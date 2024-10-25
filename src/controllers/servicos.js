import { db } from "../connect.js";
const api_v = process.env.API_VERSION;

export class Servicos {
    // Método para criar um serviço
    async createServico(req, res) {
        const { id_empresa, titulo, descricao, encargos, tributos_federais_totais, valor, vigencia, id_setor } = req.body;

        try {
            // Verifica se os campos obrigatórios foram passados
            if (!id_empresa || !titulo || !valor) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Campos 'id_empresa', 'titulo' e 'valor' são obrigatórios."
                });
            }

            // Query para inserir um novo serviço
            db.query(
                `INSERT INTO servico 
                    (id_empresa, titulo, descricao, encargos, tributos_federais_totais, valor, vigencia, id_setor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id_empresa, titulo, descricao, encargos, tributos_federais_totais, valor, vigencia, id_setor],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao criar o serviço.",
                            api_version: api_v,
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Serviço criado com sucesso!" });
                }
            );
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao criar serviço.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para atualizar um serviço
    async updateServico(req, res) {
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
            if (req.body.encargos !== undefined) {
                fieldsToUpdate.push("encargos = ?");
                values.push(req.body.encargos);
            }
            if (req.body.tributos_federais_totais !== undefined) {
                fieldsToUpdate.push("tributos_federais_totais = ?");
                values.push(req.body.tributos_federais_totais);
            }
            if (req.body.valor !== undefined) {
                fieldsToUpdate.push("valor = ?");
                values.push(req.body.valor);
            }
            if (req.body.vigencia !== undefined) {
                fieldsToUpdate.push("vigencia = ?");
                values.push(req.body.vigencia);
            }
            if (req.body.id_setor !== undefined) {
                fieldsToUpdate.push("id_setor = ?");
                values.push(req.body.id_setor);
            }

            if (fieldsToUpdate.length === 0) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Nenhum campo válido para atualizar."
                });
            }

            const query = `UPDATE servico SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            values.push(id);

            db.query(query, values, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao atualizar o serviço.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Serviço atualizado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao atualizar serviço.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para deletar um serviço
    async deleteServico(req, res) {
        const { id } = req.body;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id' é obrigatório para deletar."
                });
            }

            db.query("DELETE FROM servico WHERE id = ?", [id], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar o serviço.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Serviço deletado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao deletar serviço.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para listar todos os serviços
    async listServicos(req, res) {
        const {id_empresa} = req.body;
        try {
            db.query("SELECT s.id, s.id_empresa, s.titulo, s.descricao, s.encargos, s.tributos_federais_totais, s.valor, s.vigencia, s.id_setor, se.titulo as setor_nome FROM servico s INNER JOIN setor se ON (se.id = s.id_setor) WHERE s.id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar serviços.",
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
                message: "Erro interno ao listar serviços.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para obter serviço por ID
    async getServicoById(req, res) {
        const { id } = req.query;

        try {
            if (!id) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id' é obrigatório."
                });
            }

            db.query("SELECT * FROM servico WHERE id = ?", [id], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao obter o serviço.",
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
                message: "Erro interno ao obter serviço.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }
}
