import { Clientes } from "../controllers/clientes.js";
import { Router } from "express";
import { checkToken } from "../midlewares/tokenValidation.js";


const router = new Router();
const control = new Clientes();


router.post("/clientes/create", checkToken, control.createCliente);
router.patch("/clientes/update", checkToken, control.updateCliente);
router.post("/clientes/restore", checkToken, control.listClientes);
router.delete("/clientes/delete", checkToken, control.deleteCliente);
router.post("/clientes/customer", checkToken, control.getClienteById);
router.post("/clientes/integracao/asaas", control.importarClientes);


export default router;