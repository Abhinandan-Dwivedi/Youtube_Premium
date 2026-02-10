import { Router } from "express";
import {
    Registeruser,
    Logout,
    Login,
    changecurrentpassword,
    getcurrentuser,
    updateuserdetails,
    updateAvatarimg,
    updateCoverimg,
    getUserChannelProfile,
    getWatchHistory
  } 
from "../Controllers/userRegister.js";
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

router.route("/password-change").post(Authstatus, changecurrentpassword);

router.route("/current-user").get(Authstatus, getcurrentuser);

router.route("/update-Account").patch(Authstatus, updateuserdetails);

router.route("/update-avatar").patch(Authstatus, Upload.single("avatar"), updateAvatarimg);

router.route("/update-cover").patch(Authstatus, Upload.single("coverImage"), updateCoverimg);

router.route("/c/:username").get(getUserChannelProfile);

router.route("/watch-history").get(Authstatus, getWatchHistory);

export default router;