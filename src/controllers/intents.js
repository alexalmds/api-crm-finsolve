import { db } from "../connect.js"; // Conexão com o banco de dados

const api_v = process.env.API_VERSION;

export class Intents {

    // Método para criar uma intenção
    async createIntent(req, res) {
        const { id_empresa, name, examples } = req.body;

        try {
            if (!id_empresa || !name || !examples) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Preencha todos os campos obrigatórios!"
                });
            }

            db.query(
                "INSERT INTO intents (id_empresa, name, examples) VALUES (?, ?, ?)",
                [id_empresa, name, JSON.stringify(examples)],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao cadastrar a intenção.",
                            api_version: api_v,
                            date: new Date(),
                            error: err,
                        });
                    } else {
                        return res.status(200).send({ message: "Intenção cadastrada com sucesso!" });
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

    // Método para atualizar uma intenção
    async updateIntent(req, res) {
        const { id, id_empresa, name, examples } = req.body;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "ID da intenção é obrigatório!"
                });
            }

            db.query(
                "UPDATE intents SET name = ?, examples = ? WHERE id = ? AND id_empresa = ?",
                [name, JSON.stringify(examples), id, id_empresa],
                (err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao atualizar a intenção.",
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Intenção atualizada com sucesso!" });
                }
            );
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para deletar uma intenção
    async deleteIntent(req, res) {
        const { id } = req.body;

        try {
            db.query("DELETE FROM intents WHERE id = ? ", [id], (err) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar a intenção.",
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Intenção deletada com sucesso!" });
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para listar intenções por empresa
    async listIntents(req, res) {
        const { id_empresa } = req.body;

        try {
            db.query("SELECT id, name, examples FROM intents WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar intenções.",
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
