import axios from 'axios';
import { db } from '../connect.js';

// Função para substituir variáveis na mensagem
function replacePlaceholders(template, invoice) {
    return template
        .replace('{name}', invoice.nome_cliente)
        .replace('{valor}', invoice.valor)
        .replace('{data_vencimento}', invoice.data_vencimento);
}

async function getCustomMessage(companyId, event) {
    const query = `
        SELECT mensagem 
        FROM mensagens_automaticas 
        WHERE id_empresa = ? AND evento = ? 
        LIMIT 1;
    `;
    const [rows] =  await db.promise().query(
        query, [companyId, event]
    );
    return rows.length > 0 ? rows[0].mensagem : null;
}

// Função para gerar a mensagem de acordo com o evento e mensagem customizada
export async function generateMessage(invoice, event, companyId) {
    const customMessage = await getCustomMessage(companyId, event);
    
    // Mensagens padrão caso não tenha uma mensagem personalizada
    const defaultMessages = {
        '48_hours': `${invoice.nome_cliente}, seu boleto de R$ ${invoice.valor } com vencimento para ${invoice.data_vencimento} está próximo do vencimento.`,
        '24_hours': `${invoice.nome_cliente}, seu boleto de R$ ${invoice.valor} com vencimento para ${invoice.data_vencimento} vence amanhã.`,
        'due_day': `${invoice.nome_cliente}, seu boleto de R$ ${invoice.valor} com vencimento para ${invoice.data_vencimento} vence hoje.`,
        'after_due': `${invoice.nome_cliente}, seu boleto de R$ ${invoice.valor} está vencido. Por favor, regularize sua situação.`
    };

    // Substituir variáveis na mensagem personalizada, se existir
    const messageTemplate = customMessage || defaultMessages[event];
    return replacePlaceholders(messageTemplate, invoice);
}

export async function sendMessage(number, message){
    try{
        await axios.post('http://localhost:8001/V1/client/send-message', {number, message}).then(() => {
        })
        .catch((exception) => {
            console.log(exception.response.data.message)
        })
    }
    catch(ex){
        console.log(ex)
    }
}