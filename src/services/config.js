
import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
dotenv.config()



export var transport = nodemailer.createTransport({
  host: process.env["HOST_MX"],//--> Configurar e-mail da empresa
  port: process.env["PORT_MX"],
  auth: {
    user: process.env["EMAIL"], //--> Email da empresa
    pass: process.env["PASSWORD"] //--> Senha do e-mail da empresa
  },
  tls: {
    minVersion: 'TLSv1.2', // versão mínima do SSL/TLS
  }
});


