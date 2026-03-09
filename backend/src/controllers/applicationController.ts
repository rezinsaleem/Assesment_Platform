import { Response } from "express";
import multer from "multer";
import path from "path";
import Application from "../models/Application";
import { AuthRequest } from "../middleware/authMiddleware";

// ---------- Multer config for resume uploads ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

/**
 * POST /api/applications
 * Candidate submits an application with a resume file.
 */
export const submitApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Resume file is required" });
      return;
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({ userId: req.userId });
    if (existing) {
      res.status(400).json({ message: "Application already submitted" });
      return;
    }

    const application = await Application.create({
      userId: req.userId,
      resumePath: req.file.filename,
      status: "pending",
      contactNumber: req.body.contactNumber,
      homeState: req.body.homeState,
      assemblyConstituency: req.body.assemblyConstituency || undefined,
      currentResidence: req.body.currentResidence,
      category: req.body.category || undefined,
      highestQualification: req.body.highestQualification,
      collegeYearOfStudy: req.body.collegeYearOfStudy || undefined,
      collegeName: req.body.collegeName || undefined,
      academicDiscipline: req.body.academicDiscipline,
      commit5Hours: req.body.commit5Hours === 'true' || req.body.commit5Hours === true,
      hasLaptop: req.body.hasLaptop === 'true' || req.body.hasLaptop === true,
      openToOnField: req.body.openToOnField === 'true' || req.body.openToOnField === true,
      willingToWorkWithInc: req.body.willingToWorkWithInc === 'true' || req.body.willingToWorkWithInc === true,
      punjabiProficiency: req.body.punjabiProficiency,
      interestReason: req.body.interestReason
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * GET /api/applications/me
 * Get the current candidate's application.
 */
export const getMyApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const application = await Application.findOne({ userId: req.userId });
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
