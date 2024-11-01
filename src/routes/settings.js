import { Settings } from "../controllers/settings.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";
import { secret } from "../midlewares/secret.js";

const router = new Router();
const control = new Settings();

router.post("/settings/create", checkToken, control.createSettings);
router.patch("/settings/update", checkToken, control.updateSettings);
router.get("/settings/get", secret, control.listSettings);
router.delete("/settings/delete", checkToken, control.deleteSettings);
router.post("/V1/WAPI/session/status", control.getQRCode);

export default router;