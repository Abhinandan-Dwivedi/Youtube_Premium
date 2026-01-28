import { Router } from "express";
import { Registeruser, Logout, Login } from "../Controllers/userRegister.js";
import { Upload } from "../Middlewares/multer.middleware.js";
import Authstatus from "../Middlewares/Authstatus.middleware.js";

const router = Router();

router.route("/register").post(
    Upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), Registeruser);

router.route("/login").post(Login);

router.route("/logout").post(Authstatus, Logout);

export default router;