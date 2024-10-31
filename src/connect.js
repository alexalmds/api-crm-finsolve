import mysql from 'mysql2';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: "./.env" });

const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
}

// Criar a conexão com o banco de dados
export const db = mysql.createConnection(options);

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.log(chalk.red('[DATABASE] ') + chalk.gray("An error was occurred whiling initialization connection to database"));
        return;
    }
    console.log(chalk.green("[DATABASE] ") + chalk.blue("Successfuly connection to database"));
});
