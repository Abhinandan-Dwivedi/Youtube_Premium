import { Router } from "express";
import Authstatus from "../Middlewares/Authstatus.middleware";
import { healthcheck } from "../Controllers/healthckeck.controller";

const router = Router();
router.route("/").get(healthcheck);

export default router;