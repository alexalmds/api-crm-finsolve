import cron from 'node-cron';
import { BoletoController } from '../controllers/boletos.js';
import { Empresas } from '../controllers/empresas.js';
import { generateMessage, sendMessage } from '../transactions/whatsapp.js';
import chalk from 'chalk';
import { db } from '../connect.js';

const bol = new BoletoController();
const emp = new Empresas();

async function getCrontabForCompany(companyId) {
    try {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM crontabs WHERE id_empresa = ?', [companyId], (err, result) => {
                if (err) {
                    console.log(chalk.cyan("[CRON JOB] ") + chalk.red("Error during query: " + err));
                    return reject(err);
                }

                // Converte os valores 1 e 0 para booleanos
                const crontab = result[0] ? {
                    send_48_hours: result[0].send_48_hours === 1,
                    send_24_hours: result[0].send_24_hours === 1,
                    send_due_day: result[0].send_due_day === 1,
                    send_after_due: result[0].send_after_due === 1
                } : {
                    send_48_hours: false,
                    send_24_hours: false,
                    send_due_day: false,
                    send_after_due: false
                };

                resolve(crontab);
            });
        });
    } catch (error) {
        console.error(chalk.cyan("[CRON JOB] ") + chalk.red("Error in getCrontabForCompany: " + error));
        throw error;
    }
}


// Função para verificar se está dentro do horário permitido
function isWithinAllowedHours() {
    const now = new Date();
    const day = now.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const hour = now.getHours();

    // Verifica se é segunda a sexta (1-5)
    if (day >= 1 && day <= 5) {
        return hour >= 7 && hour < 20; // 7:00 - 19:59
    }

    // Verifica se é sábado (6)
    if (day === 6) {
        return hour >= 8 && hour < 12; // 8:00 - 11:59
    }

    return false; // Fora do horário permitido
}

async function sendNotificationIfDue(invoice, companyId, event) {
    const now = new Date();
    const currentDateString = now.toISOString().split('T')[0]; // Data no formato YYYY-MM-DD
    const ultimaNotificacaoDate = new Date(invoice.ultima_notificacao);
    const ultimaNotificacaoString = ultimaNotificacaoDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Verifica se uma notificação foi enviada hoje
    if (ultimaNotificacaoString === currentDateString) {
        return; // Não envia novamente se a notificação já foi enviada hoje
    }

    // Atualiza a última notificação e define a próxima notificação
    const updateQuery = `
        UPDATE boletos 
        SET ultima_notificacao = ?, proxima_notificacao = ? 
        WHERE id = ?
    `;

    const nextNotificationDate = new Date(now);
    nextNotificationDate.setDate(now.getDate() + 1); // Define para o dia seguinte

    db.query(updateQuery, [currentDateString, nextNotificationDate.toISOString().split('T')[0], invoice.id], (err, result) => {
        if (err) {
            console.log(chalk.red("[DATABASE] ") + chalk.redBright("Erro de banco: " + err))
        }
    });
    const message = await generateMessage(invoice, event, companyId);
    console.log(chalk.cyan("[CRON JOB]") + chalk.yellow(` Enviando mensagem para cliente: ${invoice.nome_cliente}`));
    await sendMessage(invoice.whatsapp, message);
}

// Cron job para enviar mensagens
async function startCronJob() {
    console.log(chalk.green("[SERVIDOR]") + chalk.yellow(" Scheduled tasks initialized"));

    const executeCronJobs = async () => {
        if (!isWithinAllowedHours()) {
            console.log(chalk.cyan("[CRON JOB]") + chalk.yellow(" Fora do horário permitido"));
            return;
        }

        console.log(chalk.cyan("[CRON JOB]") + chalk.yellow(" Executando tarefas de cobrança"));

        const companies = await emp.getAllCompanies();

        for (const company of companies) {
            const crontab = await getCrontabForCompany(company.id_empresa);
            const pendingInvoices = await bol.getPendingInvoices(company.id_empresa);
            console.log(chalk.cyan("[CRON JOB]") + chalk.yellow(` Processando boletos para empresa ID: ${company.id_empresa}`));
            for (const invoice of pendingInvoices) {
                const dueDate = new Date(invoice.data_vencimento); // Converte para Date se necessário
                const timeUntilDue = dueDate - new Date();

                // Verifica e envia mensagens com base nas preferências
                if (crontab.send_48_hours && timeUntilDue <= 48 * 60 * 60 * 1000 && timeUntilDue > 24 * 60 * 60 * 1000) {
                    await sendNotificationIfDue(invoice, company.id_empresa, '48_hours');
                }

                if (crontab.send_24_hours && timeUntilDue <= 24 * 60 * 60 * 1000 && timeUntilDue > 0) {
                    await sendNotificationIfDue(invoice, company.id_empresa, '24_hours');
                }

                if (crontab.send_due_day && timeUntilDue <= 0 && timeUntilDue > -24 * 60 * 60 * 1000) {
                    await sendNotificationIfDue(invoice, company.id_empresa, 'due_day');
                }

                if (crontab.send_after_due && timeUntilDue < 0) {
                    const currentDate = new Date();
                    
                    // Cria uma nova data para o dia seguinte da data de vencimento
                    const nextDueDate = new Date(dueDate);
                    nextDueDate.setDate(nextDueDate.getDate() + 1); // Adiciona um dia
                
                    // Verifica se a data atual é maior ou igual à data de vencimento + 1 dia
                    if (currentDate >= nextDueDate) {
                        console.log(currentDate, dueDate);
                        await sendNotificationIfDue(invoice, company.id_empresa, 'after_due');
                    }
                }
            }
        }
    };

    // Executa o cron imediatamente na inicialização
    await executeCronJobs();

    // Agendamento do cron para execução a cada 2 horas
    cron.schedule('0 */2 * * *', executeCronJobs);
}

export default startCronJob;
