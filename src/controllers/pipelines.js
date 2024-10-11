import { db } from "../connect.js";
const api_v = process.env.API_VERSION;

export class Pipelines {

    // Método para criar um pipeline
    async createPipeline(req, res) {
        const { id_empresa, name, steps } = req.body;

        try {
            if (!id_empresa || !name || !steps) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Preencha todos os campos obrigatórios!"
                });
            }

            db.query(
                "INSERT INTO pipelines (id_empresa, name, steps) VALUES (?, ?, ?)",
                [id_empresa, name, JSON.stringify(steps)],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao cadastrar o pipeline.",
                            api_version: api_v,
                            date: new Date(),
                            error: err,
                        });
                    } else {
                        return res.status(200).send({ message: "Pipeline cadastrado com sucesso!" });
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

    // Método para atualizar um pipeline
    async updatePipeline(req, res) {
        const { id, id_empresa, name, steps } = req.body;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "ID do pipeline é obrigatório!"
                });
            }

            db.query(
                "UPDATE pipelines SET name = ?, steps = ? WHERE id = ? AND id_empresa = ?",
                [name, JSON.stringify(steps), id, id_empresa],
                (err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao atualizar o pipeline.",
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Pipeline atualizado com sucesso!" });
                }
            );
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para deletar um pipeline
    async deletePipeline(req, res) {
        const { id } = req.body;

        try {
            db.query("DELETE FROM pipelines WHERE id = ?", [id], (err) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar o pipeline.",
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Pipeline deletado com sucesso!" });
            });
        } catch (ex) {
            return res.status(500).send({ message: ex.message });
        }
    }

    // Método para listar pipelines por empresa
    async listPipelines(req, res) {
        const { id_empresa } = req.body;

        try {
            db.query("SELECT id, name, steps FROM pipelines WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar pipelines.",
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
