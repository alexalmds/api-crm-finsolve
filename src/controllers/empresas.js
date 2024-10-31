import chalk from "chalk";
import { db } from "../connect.js";
const api_v = process.env.API_VERSION;

export class Empresas {

    // Método para criar uma nova empresa
    async createEmpresa(req, res) {
        const { nome_empresa, cnpj, endereco, plano } = req.body;

        try {
            // Verificar se todos os campos obrigatórios foram preenchidos
            if (!nome_empresa || !cnpj || !endereco || !plano) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Preencha todos os campos obrigatórios!"
                });
            }

            // Inserir nova empresa no banco de dados
            db.query(
                "INSERT INTO empresas (nome_empresa, cnpj, endereco, plano) VALUES (?, ?, ?, ?)",
                [nome_empresa, cnpj, endereco, plano],
                (err, result) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao criar a empresa.",
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Empresa criada com sucesso!", id_empresa: result.insertId });
                }
            );
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para atualizar informações da empresa
    async updateEmpresa(req, res) {
        const { id_empresa } = req.body;
        const { nome_empresa, cnpj, endereco, plano, status } = req.body;

        try {
            // Atualizar empresa com base no id_empresa
            db.query(
                "UPDATE empresas SET nome_empresa = ?, cnpj = ?, endereco = ?, plano = ?, status = ? WHERE id_empresa = ?",
                [nome_empresa, cnpj, endereco, plano, status, id_empresa],
                (err, result) => {
                    if (err) {
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao atualizar a empresa.",
                            api_version: api_v,
                            date: new Date(),
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Empresa atualizada com sucesso!" });
                }
            );
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para deletar uma empresa
    async deleteEmpresa(req, res) {
        const { id_empresa } = req.params;

        try {
            db.query("DELETE FROM empresas WHERE id_empresa = ?", [id_empresa], (err, result) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar a empresa.",
                        api_version: api_v,
                        date: new Date(),
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Empresa deletada com sucesso!" });
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para listar empresas (com filtro opcional por plano e status)
    async listEmpresas(req, res) {
    
        try {
            let query = "SELECT * FROM empresas";
            let params = [];

           
            // Executar a consulta
            db.query(query, params, (err, results) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar empresas.",
                        api_version: api_v,
                        date: new Date(),
                        error: err,
                    });
                }
                return res.status(200).send(results);
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }


    async getAllCompanies() {
        try {
            const query = "SELECT * FROM empresas";
            const params = [];
            
            return new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }
}
