import { db } from "../connect.js";
const api_v = process.env.API_VERSION;

export class Clientes {
    // Método para criar um cliente
    async createCliente(req, res) {
        const { id_empresa, nome_cliente, cpf_cnpj, email_cliente, telefone_cliente, endereco_cliente, status, pais, cidade, estado, cep, whatsapp } = req.body;

        try {
            // Verifica se o campo obrigatório 'id_empresa' foi passado
            if (!id_empresa || !nome_cliente || !cpf_cnpj) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Campos 'id_empresa', 'nome_cliente' e 'cpf_cnpj' são obrigatórios."
                });
            }

            // Query para inserir um novo cliente
            db.query(
                `INSERT INTO clientes 
                    (id_empresa, nome_cliente, cpf_cnpj, email_cliente, telefone_cliente, endereco_cliente, status, pais, cidade, estado, cep, whatsapp, data_criacao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [id_empresa, nome_cliente, cpf_cnpj, email_cliente, telefone_cliente, endereco_cliente, status, pais, cidade, estado, cep, whatsapp],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Erro ao criar o cliente.",
                            api_version: api_v,
                            error: err,
                        });
                    }
                    return res.status(200).send({ message: "Cliente criado com sucesso!" });
                }
            );
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao criar cliente.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para atualizar um cliente
    async updateCliente(req, res) {
        const { id_cliente } = req.body;

        try {
            if (!id_cliente) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id_cliente' é obrigatório para atualização."
                });
            }

            // Inicializa arrays para construir dinamicamente a query de atualização
            let fieldsToUpdate = [];
            let values = [];

            // Verifica cada campo e adiciona à query se estiver presente
            if (req.body.nome_cliente !== undefined) {
                fieldsToUpdate.push("nome_cliente = ?");
                values.push(req.body.nome_cliente);
            }
            if (req.body.cpf_cnpj !== undefined) {
                fieldsToUpdate.push("cpf_cnpj = ?");
                values.push(req.body.cpf_cnpj);
            }
            if (req.body.email_cliente !== undefined) {
                fieldsToUpdate.push("email_cliente = ?");
                values.push(req.body.email_cliente);
            }
            if (req.body.telefone_cliente !== undefined) {
                fieldsToUpdate.push("telefone_cliente = ?");
                values.push(req.body.telefone_cliente);
            }
            if (req.body.endereco_cliente !== undefined) {
                fieldsToUpdate.push("endereco_cliente = ?");
                values.push(req.body.endereco_cliente);
            }
            if (req.body.status !== undefined) {
                fieldsToUpdate.push("status = ?");
                values.push(req.body.status);
            }
            if (req.body.pais !== undefined) {
                fieldsToUpdate.push("pais = ?");
                values.push(req.body.pais);
            }
            if (req.body.cidade !== undefined) {
                fieldsToUpdate.push("cidade = ?");
                values.push(req.body.cidade);
            }
            if (req.body.estado !== undefined) {
                fieldsToUpdate.push("estado = ?");
                values.push(req.body.estado);
            }
            if (req.body.cep !== undefined) {
                fieldsToUpdate.push("cep = ?");
                values.push(req.body.cep);
            }
            if (req.body.whatsapp !== undefined) {
                fieldsToUpdate.push("whatsapp = ?");
                values.push(req.body.whatsapp);
            }

            // Se não houver campos para atualizar
            if (fieldsToUpdate.length === 0) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "Nenhum campo válido para atualizar."
                });
            }

            // Adiciona a coluna 'updated_at'
            // fieldsToUpdate.push("updated_at = NOW()");

            // Monta a query final de atualização
            const query = `UPDATE clientes SET ${fieldsToUpdate.join(', ')} WHERE id_cliente = ?`;
            values.push(id_cliente);

            // Executa a query
            db.query(query, values, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao atualizar o cliente.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Cliente atualizado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao atualizar cliente.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para deletar um cliente
    async deleteCliente(req, res) {
        const { id_cliente } = req.body;

        try {
            if (!id_cliente) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id_cliente' é obrigatório para deletar."
                });
            }

            // Query para deletar o cliente
            db.query("DELETE FROM clientes WHERE id_cliente = ?", [id_cliente], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao deletar o cliente.",
                        api_version: api_v,
                        error: err,
                    });
                }
                return res.status(200).send({ message: "Cliente deletado com sucesso!" });
            });
        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro interno ao deletar cliente.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para listar todos os clientes
    async listClientes(req, res) {
        try {
            db.query("SELECT id_cliente as id, nome_cliente, email_cliente, telefone_cliente, endereco_cliente, pais, cidade, estado, cep, cpf_cnpj, whatsapp, status FROM clientes", (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao listar clientes.",
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
                message: "Erro interno ao listar clientes.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }

    // Método para obter cliente por ID
    async getClienteById(req, res) {
        const { id_cliente } = req.query;

        try {
            if (!id_cliente) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id_cliente' é obrigatório."
                });
            }

            db.query("SELECT * FROM clientes WHERE id_cliente = ?", [id_cliente], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Erro ao obter o cliente.",
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
                message: "Erro interno ao obter cliente.",
                api_version: api_v,
                date: new Date(),
                error: ex,
            });
        }
    }
}
