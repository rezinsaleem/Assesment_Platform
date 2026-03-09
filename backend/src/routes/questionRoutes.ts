import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { createQuestion, getQuestions, updateQuestion, deleteQuestion } from "../controllers/questionController";

const router = Router();

// Admin creates questions
router.post("/", authMiddleware, roleMiddleware("admin"), createQuestion);

// Authenticated users can fetch questions
router.get("/", authMiddleware, getQuestions);

// Admin updates questions
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateQuestion);

// Admin deletes questions
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteQuestion);

export default router;
