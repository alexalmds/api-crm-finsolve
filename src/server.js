import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//--- Abaixo importação de todas as rotas
import userRouter from './routes/users.js';
import companiesRouter from './routes/empresas.js';
import paymethodsRouter from './routes/paymentmethods.js';
import intentsRouter from './routes/intents.js';
import pipelinesRouter from './routes/pipelines.js'
import settingsRouter from './routes/settings.js';
import clientesRouter from './routes/clientes.js';


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


app.listen(8000, () => {
    console.log("[servidor] server was started on PORT 8000")
})