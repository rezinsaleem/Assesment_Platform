import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  startAssessment,
  getAttempt,
  saveAnswer,
  submitAssessment,
} from "../controllers/assessmentController";

const router = Router();

// All assessment routes require candidate role
router.post("/start", authMiddleware, roleMiddleware("candidate"), startAssessment);
router.get("/:attemptId", authMiddleware, roleMiddleware("candidate"), getAttempt);
router.patch("/answer", authMiddleware, roleMiddleware("candidate"), saveAnswer);
router.post("/submit", authMiddleware, roleMiddleware("candidate"), submitAssessment);

export default router;
