import { db } from "../connect.js";
const api_v = process.env.API_VERSION;
import axios from 'axios';

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
        const { id_empresa } = req.body;

        try {
            if (!id_empresa) {
                return res.status(400).send({
                    status: 400,
                    type: "Bad Request",
                    message: "O campo 'id_empresa' é obrigatório."
                });
            }

            db.query("SELECT nome_cliente as label, id_cliente as value FROM clientes WHERE id_empresa = ?", [id_empresa], (err, results) => {
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
                results.forEach((s) => {
                    if (!s.description){
                        s.description = 'No description available'
                    }
                })
                return res.status(200).send(results);
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


    async importarClientes(req, res) {
        const asaasApiKey = req.body.asaasApiKey;
        const environment = req.body.environment;
        const {id_empresa} = req.body;
        const limit = 100; // Limite de clientes por requisição
        let offset = 0;
        let hasMore = true;
        const api_v = process.env.API_VERSION;
        console.log(asaasApiKey)

        // Define a URL da API do Asaas
        const asaasUrl = environment === 'prod' ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";

        try {
            while (hasMore) {
                // Requisição para buscar clientes do Asaas
                const response = await axios.get(`${asaasUrl}/customers`, {
                    headers: { access_token: `${asaasApiKey}` },
                    params: { offset, limit }
                });

                const clientes = response.data.data;

                // Caso não haja clientes, encerra a busca
                if (!clientes || clientes.length === 0) {
                    hasMore = false;
                    break;
                }

                // Loop para inserir/atualizar clientes no banco sem duplicar
                for (const cliente of clientes) {
                    const [existingCliente] = await db.promise().query(
                        "SELECT id_cliente FROM clientes WHERE cpf_cnpj = ?", [cliente.cpfCnpj]
                    );

                    if (existingCliente.length > 0) {
                        // Cliente já existe, pode optar por atualizar ou não
                        continue; // Se não quiser atualizar, use continue, caso contrário, implemente a lógica de atualização
                    }

                    // Inserindo novo cliente
                    await db.promise().query(
                        `INSERT INTO clientes (customerId, id_empresa, nome_cliente, cpf_cnpj, email_cliente, telefone_cliente, status, pais, cidade, estado, cep, whatsapp, data_criacao)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                        [
                            cliente.id,
                            id_empresa, // ID da empresa
                            cliente.name,
                            cliente.cpfCnpj,
                            cliente.email || null, // Usa null se o email for indefinido
                            cliente.mobilePhone || null, // Usa null se o telefone for indefinido
                            'ATIVO', // Definindo status padrão como 'ATIVO'
                            cliente.country || 'Brasil', // Usa 'Brasil' se o país for indefinido
                            cliente.city || null,
                            cliente.state || null,
                            cliente.postalCode || null,
                            cliente.whatsapp || null // Se houver um campo de WhatsApp, use-o
                        ]
                    );
                }

                // Incrementa o offset para a próxima página
                offset += limit;

                // Verifica se há mais clientes a serem buscados
                hasMore = response.data.hasMore;
            }

            console.log("Importação de clientes concluída com sucesso.");
            return res.status(200).send({ message: "Importação de clientes concluída com sucesso." });
        } catch (error) {
            console.error("Erro ao importar clientes:", error);
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Erro ao importar clientes.",
                api_version: api_v,
                error: error
            });
        }
    }

}
