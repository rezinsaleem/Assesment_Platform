import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  submitApplication,
  getMyApplication,
  upload,
} from "../controllers/applicationController";

const router = Router();

// All application routes require authentication and candidate role
router.post(
  "/",
  authMiddleware,
  roleMiddleware("candidate"),
  upload.single("resume"),
  submitApplication
);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("candidate"),
  getMyApplication
);

export default router;
