import Question from "../models/Question";
import { IAnswer } from "../models/Attempt";

/**
 * Calculate score by comparing each answer's selectedOption
 * against the question's correctAnswer index.
 *
 * @returns The number of correct answers.
 */
export const calculateScore = async (answers: IAnswer[]): Promise<number> => {
  let score = 0;

  for (const answer of answers) {
    const question = await Question.findById(answer.questionId);
    if (question && answer.selectedOption === question.correctAnswer) {
      score++;
    }
  }

  return score;
};
