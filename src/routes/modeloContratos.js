import { ModelosContrato } from "../controllers/modeloContratos.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";

const router = new Router();
const control = new ModelosContrato();

router.post("/modelos-contrato/create", checkToken, control.createModeloContrato);
router.patch("/modelos-contrato/update", checkToken, control.updateModeloContrato);
router.post("/modelos-contrato/read", checkToken, control.listModelosContrato);
router.delete("/modelos-contrato/delete", checkToken, control.deleteModeloContrato);
router.post("/modelos-contrato/get", control.getModeloContratoById);

export default router;