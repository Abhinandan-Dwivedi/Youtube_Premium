import { Router } from "express";
import Registeruser from "../Controllers/userRegister.js";

const router = Router();
router.route("/register").post(Registeruser);

export default router;