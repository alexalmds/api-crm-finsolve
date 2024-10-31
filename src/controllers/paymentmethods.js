import { db } from "../connect.js";

const api_v = process.env.API_VERSION;

export class PaymentMethods {

    // Método para criar uma forma de pagamento
    async createPaymentMethod(req, res) {
        const { id_empresa, tipo, descricao, status } = req.body;
        console.log(req.body)

        try {
            if (!id_empresa || !tipo || !descricao) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Preencha todos os campos obrigatórios!"
                });
            }

            db.query(
                "INSERT INTO formas_pagamento (id_empresa, tipo, descricao, status) VALUES (?, ?, ?, ?)",
                [id_empresa, tipo, descricao, status || 'ativo'],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao cadastrar a forma de pagamento.",
                            api_version: api_v,
                            date: new Date(),
                            error: err,
                        });
                    } else {
                        return res.status(200).send({ message: "Forma de pagamento cadastrada com sucesso!" });
                    }
                }
            );
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Houve um erro interno do servidor ao processar a solicitação.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para atualizar uma forma de pagamento
    async updatePaymentMethod(req, res) {
        const { id_forma_pagamento, tipo, descricao, status } = req.body;

        try {
            if (!id_forma_pagamento) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "ID da forma de pagamento é obrigatório!"
                });
            }

            db.query(
                "UPDATE formas_pagamento SET tipo = ?, descricao = ?, status = ? WHERE id_forma_pagamento = ?",
                [tipo, descricao, status, id_forma_pagamento],
                (err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao atualizar a forma de pagamento.",
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Forma de pagamento atualizada com sucesso!" });
                }
            );
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para deletar uma forma de pagamento
    async deletePaymentMethod(req, res) {
        const { id_forma_pagamento } = req.body;

        try {
            db.query("DELETE FROM formas_pagamento WHERE id_forma_pagamento = ?", [id_forma_pagamento], (err) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar a forma de pagamento.",
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Forma de pagamento deletada com sucesso!" });
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para listar formas de pagamento por empresa
    async listPaymentMethods(req, res) {
        const { id_empresa } = req.body;  // Assume que o ID da empresa vem do token JWT

        try {
            db.query("SELECT id_forma_pagamento as id, descricao, tipo, status FROM formas_pagamento WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar formas de pagamento.",
                        error: err,
                    });
                }
                return res.status(200).send(results);
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    async listPaymentMethodsEmpresa(req, res) {
        const { id_empresa } = req.body;  // Assume que o ID da empresa vem do token JWT

        try {
            db.query("SELECT descricao as label, id_forma_pagamento as value, 'No description Available' as description FROM formas_pagamento WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar formas de pagamento.",
                        error: err,
                    });
                }
                return res.status(200).send(results);
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }
}
