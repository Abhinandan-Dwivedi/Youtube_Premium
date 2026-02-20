import { Router } from "express";
import Authstatus from "../Middlewares/Authstatus.middleware";
import {
    createComment,
    deletecomment,
    updateComment,
    getVideoComments
} from "../Controllers/Comment.controller";

const router = Router();
router.use(Authstatus);

router.route("/:videoId").get(getVideoComments).post(createComment);
router.route("/c/:commentId").delete(deletecomment).patch(updateComment);

export default router;