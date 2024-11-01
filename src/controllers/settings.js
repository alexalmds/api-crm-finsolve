import axios from "axios";
import { db } from "../connect.js";
const api_v = process.env.API_VERSION;

export class Settings {
    // Método para criar configurações
    async createSettings(req, res) {
        const { id_empresa, id_usuario, asaas_api_key, asaas_mode, theme, gpt_api_kv, gpt_active_integration, asaas_active_integration } = req.body;

        try {
            if (!id_empresa) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Field 'id_empresa' must be have a value"
                });
            }

            db.query(
                `INSERT INTO settings 
                    (id_empresa, id_usuario, asaas_api_key, asaas_mode, theme, gpt_api_kv, gpt_active_integration, asaas_active_integration, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [id_empresa, id_usuario, asaas_api_key, asaas_mode, theme, gpt_api_kv, gpt_active_integration, asaas_active_integration],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao criar as configurações.",
                            api_version: api_v,
                            date: new Date(),
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Configurações criadas com sucesso!" });
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

    // Método para atualizar configurações
    async updateSettings(req, res) {
        const { id_empresa, id_usuario } = req.body;

        try {
            if (!id_empresa) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "field 'id_empresa' must have a value."
                });
            }

            // Objeto para construir os campos dinamicamente
            let fieldsToUpdate = [];
            let values = [];

            // Verifica cada campo, adicionando-o na query somente se estiver presente
            if (req.body.asaas_api_key !== undefined) {
                fieldsToUpdate.push("asaas_api_key = ?");
                values.push(req.body.asaas_api_key);
            }
            if (req.body.asaas_mode !== undefined) {
                fieldsToUpdate.push("asaas_mode = ?");
                values.push(req.body.asaas_mode);
            }
            if (req.body.theme !== undefined) {
                fieldsToUpdate.push("theme = ?");
                values.push(req.body.theme);
            }
            if (req.body.gpt_api_kv !== undefined) {
                fieldsToUpdate.push("gpt_api_kv = ?");
                values.push(req.body.gpt_api_kv);
            }
            if (req.body.gpt_active_integration !== undefined) {
                fieldsToUpdate.push("gpt_active_integration = ?");
                values.push(req.body.gpt_active_integration);
            }
            if (req.body.asaas_active_integration !== undefined) {
                fieldsToUpdate.push("asaas_active_integration = ?");
                values.push(req.body.asaas_active_integration);
            }

            // Se não houver campos para atualizar
            if (fieldsToUpdate.length === 0) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "No valid fields to update."
                });
            }

            // Adiciona a coluna de 'updated_at' para manter o registro atualizado
            fieldsToUpdate.push("updated_at = NOW()");

            // Monta a query final
            const query = `UPDATE settings SET ${fieldsToUpdate.join(', ')} WHERE id_empresa = ?`;
            values.push(id_empresa);

            // Executa a query
            db.query(query, values, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao atualizar as configurações.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Configurações atualizadas com sucesso!" });
            });
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

    // Método para deletar configurações
    async deleteSettings(req, res) {
        const { id_empresa } = req.body;

        try {
            db.query("DELETE FROM settings WHERE id_empresa = ?", [id_empresa], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar as configurações.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Configurações deletadas com sucesso!" });
            });
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

    // Método para listar configurações por empresa e usuário
    async listSettings(req, res) {
        const { id_empresa } = req.query;

        try {
            db.query("SELECT * FROM settings WHERE id_empresa = ?", [id_empresa], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar as configurações.",
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
                message: "Houve um erro interno do servidor ao processar a solicitação.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }


    async getQRCode(req, res){
        const {id_empresa, production_env, tokenApi} = req.body;
        if (!id_empresa){
            return res.status(400).send({
                message: "Incorrect value or missing data. Filed 'id_empresa'"
            })
        }
        axios.get(`http://localhost:8001/V1/session/status?production_env=${production_env}&tokenApi=${tokenApi}&id_empresa_s=${id_empresa}`).then((resp)=> {
            return res.json({status: resp.data.status, qrCode: resp.data.qrCode})
        }).catch((exception) => {
            return res.status(500).send({
                message: `Issue error: ${exception}`
            })
        })
    }
}
