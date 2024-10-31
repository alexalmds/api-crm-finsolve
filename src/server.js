import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import chalk, { Chalk } from 'chalk';
//--- Abaixo importação de todas as rotas
import userRouter from './routes/users.js';
import companiesRouter from './routes/empresas.js';
import paymethodsRouter from './routes/paymentmethods.js';
import intentsRouter from './routes/intents.js';
import pipelinesRouter from './routes/pipelines.js'
import settingsRouter from './routes/settings.js';
import clientesRouter from './routes/clientes.js';
import setorRouter from './routes/setor.js';
import servicoRouter from './routes/servicos.js';
import modelosCRouter from './routes/modeloContratos.js';
import boletosRouter from './routes/boletos.js';
import startCronJob from './crontabs/nodecron.js';
import cobrancasRouter from './routes/cobrancas.js';


const app = express()
const corsOption = {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: [
        "content-type",
        "Authorization",
        "Access-Controll-Allow-Credentials"
    ]
}


app.use(express.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors(corsOption));
app.use(cookieParser());

//-- Apartir daqui são usadas as rotas
app.use("/", userRouter);
app.use("/", companiesRouter);
app.use("/", paymethodsRouter);
app.use("/", intentsRouter);
app.use("/", pipelinesRouter);
app.use("/", settingsRouter);
app.use("/", clientesRouter);
app.use("/", setorRouter);
app.use("/", servicoRouter);
app.use("/", modelosCRouter);
app.use("/", boletosRouter);
app.use("/", cobrancasRouter);

startCronJob();

app.listen(8000, () => {
    console.log(chalk.green("[SERVIDOR] ") + chalk.blueBright("Server was started on PORT: ") + chalk.cyan("8000"))
})