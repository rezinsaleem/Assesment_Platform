import { createObjectCsvStringifier } from "csv-writer";
import Attempt from "../models/Attempt";
import Question from "../models/Question";
import Application from "../models/Application";

interface CsvRow {
  candidateName: string;
  email: string;
  contactNumber: string;
  homeState: string;
  category: string;
  highestQualification: string;
  score: number;
  totalQuestions: number;
  percentage: string;
  startedAt: string;
  submittedAt: string;
  durationMinutes: string;
}

/**
 * Generate a CSV string containing all submitted attempt results with full details.
 */
export const generateResultsCsv = async (): Promise<string> => {
  const attempts = await Attempt.find({ submitted: true }).populate("userId", "name email");
  const currentTotalQuestions = await Question.countDocuments();

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: "candidateName", title: "Candidate Name" },
      { id: "email", title: "Email" },
      { id: "contactNumber", title: "Contact Number" },
      { id: "homeState", title: "Home State" },
      { id: "category", title: "Category" },
      { id: "highestQualification", title: "Qualification" },
      { id: "score", title: "Score" },
      { id: "totalQuestions", title: "Total Questions" },
      { id: "percentage", title: "Percentage" },
      { id: "startedAt", title: "Started At" },
      { id: "submittedAt", title: "Submitted At" },
      { id: "durationMinutes", title: "Duration (Min)" },
    ],
  });

  const records: CsvRow[] = await Promise.all(attempts.map(async (attempt: any) => {
    const user = attempt.userId as unknown as { _id: any, name: string; email: string };
    
    // Fetch complementary application data
    const application = await Application.findOne({ userId: user._id });
    
    const score = attempt.score ?? 0;
    const tq = attempt.totalQuestions || currentTotalQuestions;
    const pct = tq > 0 ? ((score / tq) * 100).toFixed(2) : "0.00";

    // Timing calculations
    const start = new Date(attempt.startedAt);
    const end = new Date(attempt.updatedAt); // Since it was marked 'submitted' last
    const diffMs = end.getTime() - start.getTime();
    const durationMin = (diffMs / (1000 * 60)).toFixed(1);

    return {
      candidateName: user.name,
      email: user.email,
      contactNumber: application?.contactNumber || "N/A",
      homeState: application?.homeState || "N/A",
      category: application?.category || "N/A",
      highestQualification: application?.highestQualification || "N/A",
      score,
      totalQuestions: tq,
      percentage: pct,
      startedAt: start.toLocaleString(),
      submittedAt: end.toLocaleString(),
      durationMinutes: durationMin,
    };
  }));

  return csvStringifier.getHeaderString()! + csvStringifier.stringifyRecords(records);
};
