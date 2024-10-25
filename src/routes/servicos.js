import { Servicos } from "../controllers/servicos.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";

const router = new Router();
const control = new Servicos();

router.post("/servicos/create", checkToken, control.createServico);
router.patch("/servicos/update", checkToken, control.updateServico);
router.post("/servicos/read", checkToken, control.listServicos);
router.delete("/servicos/delete", checkToken, control.deleteServico);

export default router;
