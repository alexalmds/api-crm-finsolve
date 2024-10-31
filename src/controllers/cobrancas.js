import { db } from "../connect.js";
import chalk, { Chalk } from "chalk";
import axios from 'axios';
import { sendMessage } from "../transactions/whatsapp.js";

const apiVersion = process.env.API_VERSION;

function getFormatedDate() {
    const tomorrow = new Date(); // Cria uma nova instância de Date com a data e hora atuais

    // Formata a data no formato YYYY-MM-DD
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const day = String(tomorrow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // Retorna a data formatada
}

export class Cobrancas {

    async read(req, res) {
        const { id_empresa } = req.body;
        try {
            db.query("SELECT b.*, b.forma_pagamento as forma_pagamento_id, c.nome_cliente, c.customerId, c.whatsapp, c.email_cliente, c.telefone_cliente, f.descricao as forma_pagamento FROM boletos b INNER JOIN clientes c ON (c.id_cliente = b.id_cliente) INNER JOIN formas_pagamento f ON f.id_forma_pagamento = b.forma_pagamento WHERE b.id_empresa = ? ORDER BY b.id asc", [id_empresa],
                (err, result) => {
                    if (err) {
                        console.log(chalk.red("[DATABASE] ") + chalk.redBright("Error in controller level: " + err));
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Houve um erro interno do servidor ao carregar todas as cobranças. Tente novamente mais tarde.",
                            api_version: apiVersion,
                            error: err
                        })
                    }
                    if (result) {
                        const formatDate = (dateStr) => {
                            const date = new Date(dateStr);
                            return new Intl.DateTimeFormat('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            }).format(date);
                        };

                        // Mapeando as datas para formatá-las
                        const formattedResult = result.map(item => ({
                            ...item,
                            data_emissao: formatDate(item.data_emissao),
                            data_vencimento: formatDate(item.data_vencimento),
                        }));

                        return res.status(200).send(formattedResult);
                    }
                    else {
                        return res.status(404).send({ message: "Sem Cobranças disponível" })
                    }
                }
            )
        }
        catch (ex) {
            console.log(chalk.red("[SERVIDOR] " + chalk.redBright("Houve um erro ao listar as cobranças. " + ex)))
        }
    }




    async baixaCobranca(req, res) {
        const apiVersion = process.env.API_VERSION;
        const asaasApiKey = req.body.asaasApiKey;
        const environment = req.body.environment;
        const id_empresa = req.body.id_empresa;
        let { id, usuario, date, id_asaas_invoice, value, amount_invoice, dueDate, email, number, notify, issueDate } = req.body;
        const asaasUrl = environment === 'prod' ? "https://api.asaas.com/v3" : "https://sandbox.asaas.com/api/v3";

        if (!id_empresa) {
            return res.status(406).send({
                statusCode: 406,
                type: "Not Acceptable",
                message: "Informações da Empresa não vinculadas à solicitação"
            })
        }
        // Validar formato de data e consistência com a data atual e data de vencimento

        const today = new Date();
        const paymentDate = new Date(date);
        const dueDateObj = new Date(dueDate);
        const issueDateObj = new Date(issueDate)

        if (isNaN(paymentDate.getTime()) || isNaN(dueDateObj.getTime())) {
            return res.status(400).send({
                statusCode: 400,
                type: "Bad Request",
                message: "Datas de pagamento ou vencimento inválidas"
            });
        }
        if (paymentDate > today) {
            return res.status(400).send({
                statusCode: 400,
                type: "Bad Request",
                message: "A data de pagamento não pode ser futura"
            });
        }
        if (paymentDate < issueDateObj) {
            return res.status(400).send({
                statusCode: 400,
                type: "Bad Request",
                message: "A data de pagamento não pode ser anterior à data de emissão"
            });
        }
        //--Se tem integração com Asaas
        if (environment === 'prod') {
            try {
                if (!environment) {
                    return res.status(401).send({
                        statusCode: 401,
                        type: "Unauthorized",
                        message: "You need to specify environment about Asaas"
                    })
                }
                if (!id || !usuario || !date || !value || !amount_invoice) {
                    return res.status(400).send({
                        statusCode: 400,
                        type: "Bad Request",
                        message: "Campos obrigatórios não preenchidos"
                    })
                }
                if (!id_asaas_invoice) {
                    return res.status(400).send({
                        statusCode: 400,
                        type: "Bad Request",
                        message: "ID da cobrança do Asaas não identificado!"
                    })
                }

                if (parseFloat(amount_invoice) > parseFloat(value)) {
                    return res.status(401).send({
                        statusCode: 401,
                        type: "Unauthorized",
                        message: "Baixa não pode ser efetuada! Montante pago menor que o valor original da cobrança"
                    })
                }

                //-- Utilizando o axios para fazer a baixa da cobrança
                axios.post(asaasUrl + `/payments/${id_asaas_invoice}/receiveInCash`, {
                    paymentDate: getFormatedDate(),
                    value: value
                }, {
                    headers: {
                        accept: 'application/json',
                        access_token: asaasApiKey
                    }
                }).then(() => {
                    //--- Aguardando mudança no banco
                    db.query("INSERT INTO movimentacoes (id_empresa, id_boleto, id_usuario, tipo_movimentacao, valor, descricao) VALUES (?, ?, ?, 'baixa', ?, 'Baixa manual de cobrança')",
                        [id_empresa, id, usuario, value], (err, result) => {
                            if (err) {
                                return res.status(500).send({
                                    status: 500,
                                    type: "Internal Server Error",
                                    message: "Houve um erro interno do servidor ao realizar baixa da Cobrança.",
                                    api_version: apiVersion,
                                    error: err
                                })
                            }
                            else {
                                //--- Atualizando no banco o status da cobrança
                                db.query("UPDATE boletos SET status = 'pago' WHERE id = ?", [id], (err, result) => {
                                    if (err) {
                                        return res.status(500).send({
                                            status: 500,
                                            type: "Internal Server Error",
                                            message: "Houve um erro interno do servidor ao realizar baixa da Cobrança.",
                                            api_version: apiVersion,
                                            error: err
                                        })
                                    }
                                    else {
                                        if (notify) {
                                            sendMessage(number, `*Confirmamos* o recebimento do pagamento referente a cobrança ${id} no valor de *R$ ${value}*. Obrigado!`)
                                        }
                                        return res.status(200).send({ message: "Baixa realizada com sucesso!" })
                                    }
                                })
                            }
                        }
                    )
                }).catch((exception) => {
                    console.log(chalk.red("[SERVIDOR] ") + chalk.redBright("Houve um erro interno do servidor ao processar uma solicitação em: /cobrancas/baixa " + exception));
                    return res.status(502).send({
                        statusCode: 502,
                        type: "Bad Gateway",
                        api_version: apiVersion,
                        message: exception.response.data.errors[0].description,
                        date: new Date()
                    })
                })
            }
            catch (ex) {
                console.log(chalk.red("[SERVIDOR] ") + chalk.redBright("Houve um erro interno do servidor ao processar uma solicitação em: /cobrancas/baixa " + ex));
                return res.status(500).send({
                    status: 500,
                    type: "Internal Server Error",
                    message: "Houve um erro interno do servidor ao realizar baixa da Cobrança.",
                    api_version: apiVersion,
                    error: error
                })
            }
        }
        else {
            if (!id || !usuario || !date || !amount_invoice) {
                return res.status(400).send({
                    statusCode: 400,
                    type: "Bad Request",
                    message: "Campos obrigatórios não preenchidos"
                })
            }
            if (parseFloat(amount_invoice) > parseFloat(value)) {
                return res.status(401).send({
                    statusCode: 401,
                    type: "Unauthorized",
                    message: "Baixa não pode ser efetuada! Montante pago menor que o valor original da cobrança"
                })
            }
            //--- Aguardando mudança no banco
            db.query("INSERT INTO movimentacoes (id_empresa, id_boleto, id_usuario, tipo_movimentacao, valor, descricao) VALUES (?, ?, ?, 'baixa', ?, 'Baixa manual de cobrança')",
                [id_empresa, id, usuario, value], (err, result) => {
                    if (err) {
                        return res.status(500).send({
                            status: 500,
                            type: "Internal Server Error",
                            message: "Houve um erro interno do servidor ao realizar baixa da Cobrança.",
                            api_version: apiVersion,
                            error: err
                        })
                    }
                    else {
                        //--- Atualizando no banco o status da cobrança
                        db.query("UPDATE boletos SET status = 'pago' WHERE id = ?", [id], (err, result) => {
                            if (err) {
                                return res.status(500).send({
                                    status: 500,
                                    type: "Internal Server Error",
                                    message: "Houve um erro interno do servidor ao realizar baixa da Cobrança.",
                                    api_version: apiVersion,
                                    error: err
                                })
                            }
                            else {
                                if (notify) {
                                    sendMessage(number, `*Confirmamos* o recebimento do pagamento referente a cobrança ${id} no valor de *R$ ${value}. Obrigado!`)
                                }
                                return res.status(200).send({ message: "Baixa realizada com sucesso!" })
                            }
                        })
                    }
                }
            )
        }
    }


    async newInvoice(req, res) {
        let { dueDate, descricao, id_cliente, id_empresa, installment, notify, payment_method, type_juros, type_multa, valor_juros, valor_multa, value } = req.body;
        try {
            let installmentValue = 0;
            if (!id_empresa) {
                return res.status(406).send({
                    statusCode: 406,
                    type: "Not Acceptable",
                    message: "Informações da Empresa não vinculadas à solicitação"
                });
            }
            if (!dueDate || !id_cliente || !installment || !payment_method || !value) {
                return res.status(400).send({
                    message: "Preencha os campos obrigatórios!"
                });
            }
    
            // Verifica se há parcelas
            if (parseInt(installment) > 1) {
                installmentValue = parseFloat(value) / parseInt(installment);
            }
    
            // Insere no banco
            let query = 'INSERT INTO boletos (id_cliente, id_empresa, data_emissao, data_vencimento, valor, status, descricao, tipo_juros, tipo_multa, valor_juros, valor_multa, forma_pagamento, installment_value, installment) ';
            query += " VALUES (?, ?, CURRENT_DATE, ?, ?, 'pendente', ?, ?, ?, ?, ?, ?, ?, ?)";
            let params = [id_cliente, id_empresa, dueDate, value, descricao, type_juros, type_multa, valor_juros ? valor_juros : 0, valor_multa ? valor_multa : 0, payment_method, installmentValue, installment];
    
            db.query(query, params, async (err, result) => { // Note o uso de `async` aqui
                if (err) {
                    console.log(chalk.red("[SERVIDOR] ") + chalk.redBright(" Houve um erro ao Lançar cobrança: " + err));
                    return res.status(500).send({
                        status: 500,
                        type: "Internal Server Error",
                        message: "Houve um erro interno do servidor ao lançar nova Cobrança.",
                        api_version: apiVersion,
                        error: err
                    });
                }
    
                if (notify) {
                    try {
                        const [client] = await db.promise().query(
                            `SELECT nome_cliente, whatsapp, email_cliente FROM clientes WHERE id_cliente = ?`,
                            [id_cliente]
                        );
                        const [pay] = await db.promise().query(
                            `SELECT descricao FROM formas_pagamento WHERE id_forma_pagamento = ?`,
                            [payment_method]
                        );
    
                        let number = client[0].whatsapp;
                        let email = client[0].email_cliente;
                        let nome = client[0].nome_cliente;
                        let metodo = pay[0].descricao;
                        let message = `Olá, *${nome}*. \n Você tem uma nova cobrança no valor de *R$ ${value}*. \n\nDetalhes da cobrança:\n *Método de Pagamento*: ${metodo}`;
                        message += `\n*Parcelamento:* ${parseInt(installment) === 1 ? "À vista (1x)" : installment + "X sem juros"} \n*Valor Parcelas*: ${parseInt(installment) === 1 ? "" : "R$ " + installmentValue}`;
                        message += `\n*Data de Vencimento*: ${dueDate}`;
                        sendMessage(number, message);
                    } catch (error) {
                        console.log(chalk.red("[SERVIDOR] ") + chalk.redBright(" Erro ao buscar dados para notificação: " + error));
                    }
                }
    
                return res.status(200).send({ message: "Cobrança lançada com sucesso!" });
            });
        } catch (ex) {
            console.log(chalk.red("[SERVIDOR] ") + chalk.redBright("Houve um erro interno em /cobrancas/lancar " + ex));
            return res.status(500).send({
                status: 500,
                type: "Internal Server Error",
                message: "Houve um erro interno do servidor ao lançar nova Cobrança.",
                api_version: apiVersion,
                error: ex
            });
        }
    }
    
}