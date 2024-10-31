import { db } from "../connect.js";
import { compare, hash } from "bcrypt";
import crypto from "crypto"; // Para gerar o código 2FA
import jwt from 'jsonwebtoken';
import { sendMessage } from "../transactions/whatsapp.js";

const api_v = process.env.API_VERSION;

export class Users {

    // Método para criar usuário
    async createUser(req, res) {
        let { id_empresa, nome, email, senha, permissao } = req.body;
        try {
            if (!id_empresa) {
                return res.status(406).send({
                    status: 406,
                    type: "Not Acceptable",
                    message: "Empresa não vinculada ao usuário!"
                });
            }
            if (!nome || !email || !senha || !permissao) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Preencha todos os campos obrigatórios!"
                });
            }

            senha = await hash(senha, 8);  // Hash da senha

            db.query(
                "INSERT INTO users (nome, id_empresa, email, senha, permissao) VALUES (?, ?, ?, ?, ?)",
                [nome, id_empresa, email, senha, permissao],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: `Houve um erro interno do servidor ao criar o usuário.`,
                            api_version: api_v,
                            date: new Date(),
                            error: err,
                        });
                    } else {
                        return res.status(200).send({ message: "Usuário cadastrado com sucesso!" });
                    }
                }
            );
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: `Houve um erro interno do servidor ao processar a solicitação.`,
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para atualizar usuário
    async updateUser(req, res) {
        const { id_usuario } = req.body;
        const { nome, email, permissao, status } = req.body;

        try {
            db.query(
                "UPDATE users SET nome = ?, email = ?, permissao = ?, status = ? WHERE id_usuario = ?",
                [nome, email, permissao, status, id_usuario],
                (err, result) => {
                    if (err) {
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao atualizar o usuário.",
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Usuário atualizado com sucesso!" });
                }
            );
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para deletar usuário
    async deleteUser(req, res) {
        const { id_usuario } = req.body;

        try {
            db.query("DELETE FROM users WHERE id_usuario = ?", [id_usuario], (err, result) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar o usuário.",
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Usuário deletado com sucesso!" });
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para listar usuários com filtro por empresa
    async listUsers(req, res) {
        const { id_empresa } = req.body;  // Assume que o ID da empresa vem do token JWT

        try {
            db.query("SELECT id_usuario as id, nome as usuario, email, id_empresa, permissao, status FROM users WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar usuários.",
                        error: err,
                    });
                }
                return res.status(200).send(results);
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método de login com 2FA
    async login(req, res) {
        const { email, senha } = req.body;

        try {
            db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
                if (err || results.length === 0) {
                    return res.status(404).send({ message: "Usuário não encontrado!" });
                }

                const user = results[0];
                const isPasswordValid = await compare(senha, user.senha);

                if (!isPasswordValid) {
                    return res.status(401).send({ message: "Senha incorreta!" });
                }

                if (user.two_fa === 'T') {
                    // Gerar código 2FA de 6 dígitos
                    const twoFaCode = crypto.randomInt(100000, 999999).toString();

                    // Atualizar o código na tabela
                    db.query(
                        "UPDATE users SET two_fa_code = ? WHERE id_usuario = ?",
                        [twoFaCode, user.id_usuario],
                        (err) => {
                            if (err) {
                                return res.status(500).send({
                                    message: "Erro ao gerar o código 2FA.",
                                    error: err,
                                });
                            }
                            db.query("SELECT telefone FROM users WHERE id_usuario = ?", [user.id_usuario], 
                                (err, result) => {
                                    if (err){
                                        return res.status(500).send({
                                            message: "Erro ao enviar código 2FA.",
                                            error: err,
                                        });
                                    }
                                    else {
                                        const telefone = result[0].telefone;
                                        sendMessage(telefone, `🔐 Seu código FinSolve: *${twoFaCode}* \n Use-o para confirmar seu acesso. *Não compartilhe este código!*`);
                                        return res.status(200).send({
                                            autenticacao_2fa: "pendente",
                                            message: "Código 2FA enviado!",
                                            user: user.id_usuario,
                                        });
                                    }
                                }
                            )
                        }
                    );
                } else {
                    // 2FA desativado, retornar todos os dados do usuário
                    try {
                        const refreshToken = jwt.sign({
                            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
                            id: user.senha
                        },
                            process.env.REFRESH,
                            { algorithm: "HS256" }
                        )
                        const token = jwt.sign({
                            exp: Math.floor(Date.now() / 1000) + 3600,
                            id: user.senha
                        },
                            process.env.TOKEN,
                            { algorithm: "HS256" }
                        );
                        delete user.senha;
                        const [company] = db.promise().query(
                            `SELECT emp.*, s.*, u.id_usuario FROM empresas emp INNER JOIN settings s ON s.id_empresa = emp.id_empresa INNER JOIN users u ON u.id_empresa = emp.id_empresa WHERE u.id_usuario = ?`,
                            [user.id_usuario]
                        );
                        return res
                            .cookie("accessToken", token, {
                                httpOnly: true
                            })
                            .cookie("refreshToken", refreshToken, {
                                httpOnly: true
                            })
                            .status(200)
                            .json({
                                message: "Successful login",
                                user,
                                company: company[0]
                            })
                    }
                    catch (ex) {
                        console.log(ex)
                        return res.status(500).send({
                            msg: "Houve um erro interno do servidor. Tente novamente mais tarde!",
                            stack: ex,
                            time: new Date()
                        })
                    }
                }
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para finalizar o 2FA
    async finalizeTwoFa(req, res) {
        const { id_usuario, two_fa_code } = req.body;
    
        try {
            const [results] = await db.promise().query(
                "SELECT * FROM users WHERE id_usuario = ? AND two_fa_code = ?",
                [id_usuario, two_fa_code]
            );
    
            if (results.length === 0) {
                return res.status(401).send({ message: "Código 2FA inválido!" });
            }
    
            const user = results[0];
            try {
                const refreshToken = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
                    id: user.senha
                },
                    process.env.REFRESH,
                    { algorithm: "HS256" }
                );
    
                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    id: user.senha
                },
                    process.env.TOKEN,
                    { algorithm: "HS256" }
                );
    
                delete user.senha;
    
                const [company] = await db.promise().query(
                    `SELECT emp.*, s.*, u.id_usuario 
                     FROM empresas emp 
                     INNER JOIN settings s ON s.id_empresa = emp.id_empresa 
                     INNER JOIN users u ON u.id_empresa = emp.id_empresa 
                     WHERE u.id_usuario = ?`,
                    [user.id_usuario]
                );
    
                return res
                    .cookie("accessToken", token, { httpOnly: true })
                    .cookie("refreshToken", refreshToken, { httpOnly: true })
                    .status(200)
                    .json({
                        autenticacao_2fa: "concluida",
                        user,
                        company: company[0]
                    });
            } catch (ex) {
                console.log(ex);
                return res.status(500).send({
                    msg: "Houve um erro interno do servidor. Tente novamente mais tarde!",
                    stack: ex,
                    time: new Date()
                });
            }
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }
    


    async refresh(req, res) {
        const authHeader = req.headers.cookie?.split("; ")[1]
        const refresh = authHeader && authHeader.split("=")[1]
        const tokenStruct = refresh.split('.')[1]
        const payload = atob(tokenStruct)

        try {
            const refreshToken = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
                id: JSON.parse(payload).id
            },
                process.env.REFRESH,
                { algorithm: "HS256" }
            )
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + 3600,
                id: JSON.parse(payload).id
            },
                process.env.TOKEN,
                { algorithm: "HS256" }
            );
            return res
                .cookie("accessToken", token, {
                    httpOnly: true
                })
                .cookie("refreshToken", refreshToken, {
                    httpOnly: true
                })
                .status(200)
                .json({
                    msg: "Token atualizado com sucesso!",
                })
        }
        catch (ex) {
            console.log(ex)
            return res.status(500).send({
                msg: "Houve um erro interno do servidor. Tente novamente mais tarde!",
                stack: error,
                time: new Date()
            })
        }
    }

    async logout(req, res){
        return res
        .clearCookie("accessToken", {secure: true, sameSite: "none"})
        .clearCookie("refreshToken", {secure: true, sameSite: "none"})
        .status(200)
        .json({msg: "Successfuly logout!"});
    }
}
