import { db } from "../connect.js";
import axios from "axios";

export class BoletoController {
    // Método para sincronizar boletos com paginação
    async sincronizarBoletos(req, res) {
        const apiVersion = process.env.API_VERSION;
        const asaasApiKey = req.body.asaasApiKey;
        const environment = req.body.environment;
        const id_empresa = req.body.id_empresa;
        const asaasUrl = environment === 'production' ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";
        const limit = 100;

        let offset = 0;
        let hasMore = true;
        const statusMap = {
            'PENDING': 'aberto',
            'RECEIVED': 'pago',
            'OVERDUE': 'vencido',
            'RECEIVED_IN_CASH': 'pago',
            'CONFIRMED': 'pago'
        };
        const paymentMap = {
            'BOLETO': 'boleto',
            'CREDIT_CARD': 'cartao_credito',
            'PIX': 'pix',
        };

        try {
            while (hasMore) {
                // Requisição para o Asaas com offset e limit
                const response = await axios.get(`${asaasUrl}/payments`, {
                    headers: { access_token: `${asaasApiKey}` },
                    params: { offset, limit } // Considerando que queremos boletos pendentes
                });

                const boletos = response.data.data;
                

                // Caso não haja boletos, encerra a busca
                if (!boletos || boletos.length === 0) {
                    hasMore = false;
                    break;
                }

                // Loop para inserir boletos no banco sem duplicar
                for (const boleto of boletos) {
                    // Busca o id_cliente com base no customerId do Asaas
                    const status = statusMap[boleto.status] || 'pendente';
                    const payment = status[boleto.billingTpe] || 'boleto'
                    const [cliente] = await db.promise().query(
                        "SELECT id_cliente FROM clientes WHERE customerId = ?", [boleto.customer]
                    );
                    const [id_payment] = await db.promise().query(
                        "SELECT id_forma_pagamento FROM formas_pagamento WHERE tipo = ?", [payment]
                    );
                    const mPayment = id_payment[0].id_forma_pagamento;

                    if (cliente.length === 0) {
                        console.warn(`Cliente com customerId ${boleto.customer} não encontrado no banco de dados.`);
                        continue; // Pula para o próximo boleto se o cliente não for encontrado
                    }

                    const id_cliente = cliente[0].id_cliente;

                    // Verifica se o boleto já existe na tabela para evitar duplicação
                    const [existingBoleto] = await db.promise().query(
                        "SELECT id FROM boletos WHERE id_boleto = ?", [boleto.id]
                    );

                    if (existingBoleto.length > 0) continue;

                    // Inserindo novo boleto com id_cliente obtido
                    await db.promise().query(
                        `INSERT INTO boletos (id_boleto, id_cliente, id_empresa, data_emissao, data_vencimento, valor, status, sincronizado_em, forma_pagamento)
                         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                        [
                            boleto.id,
                            id_cliente,       // ID do cliente do banco de dados
                            id_empresa,       // ID da empresa
                            boleto.dateCreated,
                            boleto.dueDate,
                            boleto.value,
                            status,
                            mPayment
                        ]
                    );
                }

                // Incrementa o offset para a próxima página
                offset += limit;

                // Verifica o campo hasMore na resposta para interromper o loop
                hasMore = response.data.hasMore;
            }

            console.log("Sincronização concluída com sucesso.");
            if (res) {
                return res.status(200).send({ message: "Sincronização concluída com sucesso." });
            }
        } catch (error) {
            console.error("Erro ao sincronizar boletos:", error);
            if (res) {
                return res.status(500).send({
                    status: 500,
                    type: "Internal Server Error",
                    message: "Erro ao sincronizar boletos.",
                    api_version: apiVersion,
                    error: error
                });
            }
        }
    }


    async getPendingInvoices(id_empresa) {
        const query = `
            SELECT b.*, c.nome_cliente, c.email_cliente, c.whatsapp FROM boletos b INNER JOIN clientes c ON c.id_cliente = b.id_cliente 
            WHERE  (b.status = 'pendente' OR b.status = 'vencido' OR b.status = 'aberto') 
            AND b.id_empresa = ${id_empresa}
            ORDER BY b.data_vencimento ASC
        `;
        
        const [rows] = await db.promise().query(
            query, [id_empresa]
        );
        return rows;
    }
    
}
