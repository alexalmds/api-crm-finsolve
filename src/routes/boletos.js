import { Router } from "express";
import { BoletoController } from "../controllers/boletos.js";

const control = new BoletoController();
const router = new Router();

router.post("/boletos/integracao/asaas", control.sincronizarBoletos);

export default router;