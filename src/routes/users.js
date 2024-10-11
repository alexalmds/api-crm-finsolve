import { Users } from "../controllers/users.js";
import { Router } from "express";
import { checkRefreshToken } from '../midlewares/refreshTokenValidation.js';
import { checkToken } from "../midlewares/tokenValidation.js";

const router  = new Router();
const usr = new Users();

router.post("/users/create", usr.createUser);
router.patch("/users/update", usr.updateUser);
router.post("/users/list", usr.listUsers);
router.delete("/users/delete", usr.deleteUser);
router.post("/auth/login", usr.login);
router.post("/auth/v1/2FA-authentication", usr.finalizeTwoFa);
router.get("/auth/refresh", checkRefreshToken, usr.refresh);
router.post("/auth/logout", checkToken, usr.logout);

export default router;