import { db } from "../connect.js";
const api_v = process.env.API_VERSION;

export class ModelosContrato {
    // Método para criar um modelo de contrato
    async createModeloContrato(req, res) {
        const { id_empresa, titulo, conteudo } = req.body;

        try {
            // Verifica se os campos obrigatórios foram passados
            if (!id_empresa || !titulo || !conteudo) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Campos 'id_empresa', 'titulo' e 'conteudo' são obrigatórios."
                });
            }

            // Query para inserir um novo modelo de contrato
            db.query(
                `INSERT INTO modelo_contrato 
                    (id_empresa, titulo, conteudo, data_criacao)
                VALUES (?, ?, ?, NOW())`,
                [id_empresa, titulo, conteudo],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao criar o modelo de contrato.",
                            api_version: api_v,
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Modelo de contrato criado com sucesso!" });
                }
            );
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao criar modelo de contrato.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para atualizar um modelo de contrato
    async updateModeloContrato(req, res) {
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
            if (req.body.conteudo !== undefined) {
                fieldsToUpdate.push("conteudo = ?");
                values.push(req.body.conteudo);
            }

            if (fieldsToUpdate.length === 0) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Nenhum campo válido para atualizar."
                });
            }

            const query = `UPDATE modelo_contrato SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            values.push(id);

            db.query(query, values, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao atualizar o modelo de contrato.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Modelo de contrato atualizado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao atualizar modelo de contrato.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para deletar um modelo de contrato
    async deleteModeloContrato(req, res) {
        const { id } = req.body;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id' é obrigatório para deletar."
                });
            }

            db.query("DELETE FROM modelo_contrato WHERE id = ?", [id], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar o modelo de contrato.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Modelo de contrato deletado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao deletar modelo de contrato.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para listar todos os modelos de contrato
    async listModelosContrato(req, res) {
        const {id_empresa} = req.body;
        try {
            db.query("SELECT id, id_empresa, titulo, conteudo, data_criacao FROM modelo_contrato WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar modelos de contrato.",
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
                message: "Erro interno ao listar modelos de contrato.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para obter modelo de contrato por ID
    async getModeloContratoById(req, res) {
        const { id } = req.body;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id' é obrigatório."
                });
            }

            db.query("SELECT * FROM modelo_contrato WHERE id = ?", [id], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao obter o modelo de contrato.",
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
                message: "Erro interno ao obter modelo de contrato.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }
}
