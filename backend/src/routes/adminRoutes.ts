import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getAllApplications,
  updateApplicationStatus,
  getResults,
  exportResults,
} from "../controllers/adminController";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/applications", getAllApplications);
router.patch("/applications/:id/status", updateApplicationStatus);
router.get("/results", getResults);
router.get("/results/export", exportResults);

export default router;
