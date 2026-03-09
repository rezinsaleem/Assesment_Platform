import { Request, Response } from "express";
import Application from "../models/Application";
import Attempt from "../models/Attempt";
import Question from "../models/Question";
import { generateResultsCsv } from "../utils/csvExport";

/**
 * GET /api/admin/applications
 * List all candidate applications for admin review.
 */
export const getAllApplications = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const applications = await Application.find().populate("userId", "name email");
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * PATCH /api/admin/applications/:id/status
 * Approve or reject a candidate's application.
 */
export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body; // "shortlisted" or "rejected"

    if (!["shortlisted", "rejected"].includes(status)) {
      res.status(400).json({ message: "Status must be 'shortlisted' or 'rejected'" });
      return;
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res.json({ message: `Application ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * GET /api/admin/results
 * Get all submitted assessment results.
 */
export const getResults = async (_req: Request, res: Response): Promise<void> => {
  try {
    const attempts = await Attempt.find({ submitted: true }).populate(
      "userId",
      "name email"
    );
    const currentTotalCount = await Question.countDocuments();

    const results = attempts.map((a) => {
      const user = a.userId as unknown as { name: string; email: string };
      // Use the snapshot if available, otherwise fallback to current count
      const tq = (a as any).totalQuestions || currentTotalCount;
      
      return {
        attemptId: a._id,
        candidateName: user.name,
        email: user.email,
        score: a.score,
        totalQuestions: tq,
        percentage:
          tq > 0
            ? (((a.score ?? 0) / tq) * 100).toFixed(2)
            : "0.00",
      };
    });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * GET /api/admin/results/export
 * Export results as a downloadable CSV file.
 */
export const exportResults = async (_req: Request, res: Response): Promise<void> => {
  try {
    const csv = await generateResultsCsv();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=results.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
