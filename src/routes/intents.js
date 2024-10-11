import { Intents } from "../controllers/intents.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";

const router = new Router();
const control = new Intents();

// Rotas para Intents
router.post("/intents/create", checkToken, control.createIntent);
router.patch("/intents/update", checkToken, control.updateIntent);
router.post("/intents/list", control.listIntents);
router.delete("/intents/delete", checkToken, control.deleteIntent);

export default router;
