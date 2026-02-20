import { Router } from "express";
import Authstatus from "../Middlewares/Authstatus.middleware";
import {
    togglesubscription,
    getsubscribers,
    getsubscribedchannels,
} from "../Controllers/Subscriber.controller.js";

const router = Router();
router.use(Authstatus);
router.route("/:channelId").post(togglesubscription);
router.route("/subscribers/:channelId").get(getsubscribers);
router.route("/u/channels").get(getsubscribedchannels);

export default router;