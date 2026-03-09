import { Response } from "express";
import Attempt from "../models/Attempt";
import Question from "../models/Question";
import Application from "../models/Application";
import { AuthRequest } from "../middleware/authMiddleware";
import { calculateScore } from "../utils/scoreCalculator";

/**
 * POST /api/assessment/start
 * Start a new assessment attempt. Only approved candidates may begin.
 */
export const startAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Verify candidate has an approved application
    const application = await Application.findOne({
      userId: req.userId,
      status: "shortlisted",
    });
    if (!application) {
      res.status(403).json({ message: "Your application must be shortlisted first" });
      return;
    }

    // Prevent multiple active attempts
    const existingAttempt = await Attempt.findOne({
      userId: req.userId,
      submitted: false,
    });
    if (existingAttempt) {
      // Return the existing active attempt and include questions so the frontend can render them
      const questions = await Question.find().select("-correctAnswer");
      res.json({ attempt: existingAttempt, questions });
      return;
    }

    // Check if candidate already submitted an attempt
    const submittedAttempt = await Attempt.findOne({
      userId: req.userId,
      submitted: true,
    });
    if (submittedAttempt) {
      console.log(`Assessment already submitted for user: ${req.userId}`);
      res.status(400).json({ message: "You have already submitted your assessment. Please wait for the admin to review." });
      return;
    }

    // Create new attempt with timer
    const durationMinutes = parseInt(process.env.ASSESSMENT_DURATION_MINUTES || "30", 10);
    console.log(`Starting assessment for user ${req.userId} with duration ${durationMinutes}`);
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

    const attempt = await Attempt.create({
      userId: req.userId,
      answers: [],
      startedAt,
      expiresAt,
      submitted: false,
    });

    // Fetch questions (without correctAnswer for the candidate)
    const questions = await Question.find().select("-correctAnswer");

    res.status(201).json({ attempt, questions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * GET /api/assessment/:attemptId
 * Get an existing attempt and its questions.
 */
export const getAttempt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const attempt = await Attempt.findOne({
      _id: req.params.attemptId,
      userId: req.userId,
    });

    if (!attempt) {
      res.status(404).json({ message: "Attempt not found" });
      return;
    }

    const questions = await Question.find().select("-correctAnswer");
    res.json({ attempt, questions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * PATCH /api/assessment/answer
 * Save or update a single answer within an active attempt.
 * This is called for each answer (autosave) and also by the sync service.
 */
export const saveAnswer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { attemptId, questionId, selectedOption } = req.body;

    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.userId,
    });

    if (!attempt) {
      res.status(404).json({ message: "Attempt not found" });
      return;
    }

    if (attempt.submitted) {
      res.status(400).json({ message: "Assessment already submitted" });
      return;
    }

    // Check if time has expired
    if (new Date() > attempt.expiresAt) {
      res.status(400).json({ message: "Assessment time has expired" });
      return;
    }

    // Update or add the answer
    const existingIdx = attempt.answers.findIndex(
      (a) => a.questionId.toString() === questionId
    );

    if (existingIdx >= 0) {
      attempt.answers[existingIdx].selectedOption = selectedOption;
    } else {
      attempt.answers.push({ questionId, selectedOption });
    }

    await attempt.save();
    res.json({ message: "Answer saved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * POST /api/assessment/submit
 * Submit the assessment, calculate score, and mark as submitted.
 */
export const submitAssessment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.userId,
    });

    if (!attempt) {
      res.status(404).json({ message: "Attempt not found" });
      return;
    }

    if (attempt.submitted) {
      res.status(400).json({ message: "Already submitted" });
      return;
    }

    // Calculate score and mark submitted
    const questionsCount = await Question.countDocuments();
    attempt.score = await calculateScore(attempt.answers);
    attempt.totalQuestions = questionsCount;
    attempt.submitted = true;
    await attempt.save();

    res.json({
      message: "Assessment submitted",
      score: attempt.score,
      totalQuestions: questionsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
