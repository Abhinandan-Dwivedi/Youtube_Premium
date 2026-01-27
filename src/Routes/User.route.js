import { Router } from "express";
import Registeruser from "../Controllers/userRegister.js";
import {Upload }from "../Middlewares/multer.middleware.js";

const router = Router();
router.route("/register").post(
    Upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1    
        }
    ]), Registeruser);

export default router;