import { Router } from "express";
import { Cobrancas } from "../controllers/cobrancas.js";
import { checkToken } from "../midlewares/tokenValidation.js";

const router = new Router();
const control = new Cobrancas();

router.post("/cobrancas/read", checkToken, control.read);
router.post("/cobrancas/baixa", checkToken, control.baixaCobranca);
router.post("/cobrancas/lancar", checkToken, control.newInvoice);
router.post("/cobrancas/lancar-sistema", checkToken, control.lancarCobranca);

export default router;