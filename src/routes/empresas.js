import { Empresas } from "../controllers/empresas.js";
import { Router } from "express";
import { checkToken } from '../midlewares/tokenValidation.js';

const router = new Router();
const emp = new Empresas();

router.post("/companies/create", checkToken, emp.createEmpresa);
router.patch("/companies/update", checkToken, emp.updateEmpresa);
router.post("/companies/list", checkToken, emp.listEmpresas);
router.delete("/companies/delete", checkToken, emp.deleteEmpresa);


export default router;