import { db } from "../connect.js";
const api_v = process.env.API_VERSION;

export class Setores {
    // Método para criar um setor
    async createSetor(req, res) {
        const { id_empresa, titulo, descricao, observacao, gera_incidencia, taxa, percentual } = req.body;

        try {
            // Verifica se os campos obrigatórios foram passados
            if (!id_empresa || !titulo) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Campos 'id_empresa' e 'titulo' são obrigatórios."
                });
            }

            // Query para inserir um novo setor
            db.query(
                `INSERT INTO setor
                    (id_empresa, titulo, descricao, observacao, gera_incidencia, taxa, percentual)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id_empresa, titulo, descricao, observacao, gera_incidencia, taxa, percentual],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao criar o setor.",
                            api_version: api_v,
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Setor criado com sucesso!" });
                }
            );
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao criar setor.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para atualizar um setor
    async updateSetor(req, res) {
        const { id } = req.body;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id' é obrigatório para atualização."
                });
            }

            let fieldsToUpdate = [];
            let values = [];

            // Verifica cada campo e adiciona à query se estiver presente
            if (req.body.titulo !== undefined) {
                fieldsToUpdate.push("titulo = ?");
                values.push(req.body.titulo);
            }
            if (req.body.descricao !== undefined) {
                fieldsToUpdate.push("descricao = ?");
                values.push(req.body.descricao);
            }
            if (req.body.observacao !== undefined) {
                fieldsToUpdate.push("observacao = ?");
                values.push(req.body.observacao);
            }
            if (req.body.gera_incidencia !== undefined) {
                fieldsToUpdate.push("gera_incidencia = ?");
                values.push(req.body.gera_incidencia);
            }
            if (req.body.taxa !== undefined) {
                fieldsToUpdate.push("taxa = ?");
                values.push(req.body.taxa);
            }
            if (req.body.percentual !== undefined) {
                fieldsToUpdate.push("percentual = ?");
                values.push(req.body.percentual);
            }

            if (fieldsToUpdate.length === 0) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Nenhum campo válido para atualizar."
                });
            }

            const query = `UPDATE setor SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            values.push(id);

            db.query(query, values, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao atualizar o setor.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Setor atualizado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao atualizar setor.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para deletar um setor
    async deleteSetor(req, res) {
        const { id } = req.body;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id' é obrigatório para deletar."
                });
            }

            db.query("DELETE FROM setor WHERE id = ?", [id], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar o setor.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Setor deletado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao deletar setor.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para listar todos os setores
    async listSetores(req, res) {
        const {id_empresa} = req.body
        try {
            db.query("SELECT id, id_empresa, titulo, descricao, observacao, gera_incidencia, taxa, percentual FROM setor WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar setores.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send(results);
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao listar setores.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para obter setor por ID
    async getSetorById(req, res) {
        const { id } = req.query;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id' é obrigatório."
                });
            }

            db.query("SELECT * FROM setores WHERE id = ?", [id], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao obter o setor.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send(results[0]);
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao obter setor.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }
}
