import { Pipelines } from "../controllers/pipelines.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";

const router = new Router();
const control = new Pipelines();

// Rotas para Pipelines
router.post("/pipelines/create", checkToken, control.createPipeline);
router.patch("/pipelines/update", checkToken, control.updatePipeline);
router.post("/pipelines/list", control.listPipelines);
router.delete("/pipelines/delete", checkToken, control.deletePipeline);

export default router;
