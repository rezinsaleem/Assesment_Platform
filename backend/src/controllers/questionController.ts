import { Request, Response } from "express";
import Question from "../models/Question";

/**
 * POST /api/questions
 * Admin creates a new question.
 */
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, options, correctAnswer } = req.body;
    const question = await Question.create({ text, options, correctAnswer });
    res.status(201).json({ question });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * GET /api/questions
 * Fetch all questions. When fetched by candidates during assessment,
 * the correctAnswer is stripped on the frontend side (or optionally here).
 */
export const getQuestions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const questions = await Question.find();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * PUT /api/questions/:id
 * Admin updates an existing question.
 */
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`[updateQuestion] Attempting to update Question ID: ${id}`, req.body);
    const { text, options, correctAnswer } = req.body;
    const question = await Question.findByIdAndUpdate(
      id,
      { text, options, correctAnswer },
      { new: true, runValidators: true }
    );
    if (!question) {
      console.log(`[updateQuestion] Question ID ${id} not found.`);
      res.status(404).json({ message: "Question not found" });
      return;
    }
    console.log(`[updateQuestion] Successfully updated Question ID: ${id}`);
    res.json({ question });
  } catch (error) {
    console.error(`[updateQuestion] Error:`, error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * DELETE /api/questions/:id
 * Admin deletes an existing question.
 */
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`[deleteQuestion] Attempting to delete Question ID: ${id}`);
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      console.log(`[deleteQuestion] Question ID ${id} not found.`);
      res.status(404).json({ message: "Question not found" });
      return;
    }
    console.log(`[deleteQuestion] Successfully deleted Question ID: ${id}`);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(`[deleteQuestion] Error:`, error);
    res.status(500).json({ message: "Server error", error });
  }
};
