import { PaymentMethods } from "../controllers/paymentmethods.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";

const router = new Router();
const control = new PaymentMethods();

router.post("/payment-methods/create", checkToken, control.createPaymentMethod);
router.patch("/payment-methods/update", checkToken, control.updatePaymentMethod);
router.post("/payment-methods/list", checkToken, control.listPaymentMethods);
router.delete("/payment-methods/delete", checkToken, control.deletePaymentMethod);

export default router;