import Express from "express";
const router = Express.Router();
import UserController from "../controller/userController.js";
import checkUserAuth from "../middelware/auth.js";

router.post("/login", checkUserAuth);

router.post("/register", UserController.userRegistretion);
router.post("/login", UserController.userLogin);

export default router;
