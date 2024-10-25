import { Setores } from "../controllers/setor.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";

const router = new Router();
const control = new Setores();

router.post("/setores/create", checkToken, control.createSetor);
router.patch("/setores/update", checkToken, control.updateSetor);
router.post("/setores/read", checkToken, control.listSetores);
router.delete("/setores/delete", checkToken, control.deleteSetor);

export default router;
