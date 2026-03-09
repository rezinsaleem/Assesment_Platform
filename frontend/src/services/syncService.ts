import api from "../api/api";
import { toast } from "react-toastify";

interface LocalAnswer {
  option: number;
  synced: boolean;
}

interface LocalAnswers {
  [questionId: string]: LocalAnswer;
}

interface LocalData {
  attemptId: string;
  answers: LocalAnswers;
}

/**
 * Save an answer to localStorage. Called every time the user selects an option.
 */
export function saveAnswerLocally(
  attemptId: string,
  questionId: string,
  option: number,
  synced: boolean
): void {
  const key = `assessment_${attemptId}`;
  const raw = localStorage.getItem(key);
  const data: LocalData = raw
    ? JSON.parse(raw)
    : { attemptId, answers: {} };

  data.answers[questionId] = { option, synced };
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Mark a specific answer as synced in localStorage.
 */
export function markSynced(attemptId: string, questionId: string): void {
  const key = `assessment_${attemptId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return;

  const data: LocalData = JSON.parse(raw);
  if (data.answers[questionId]) {
    data.answers[questionId].synced = true;
    localStorage.setItem(key, JSON.stringify(data));
  }
}

/**
 * Get all locally-stored answers for an attempt.
 */
export function getLocalAnswers(attemptId: string): LocalAnswers {
  const key = `assessment_${attemptId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  const data: LocalData = JSON.parse(raw);
  return data.answers;
}

/**
 * Sync all unsynced answers to the backend.
 * Called on "online" event and periodically.
 */
export async function syncUnsyncedAnswers(attemptId: string): Promise<void> {
  const answers = getLocalAnswers(attemptId);
  const unsyncedEntries = Object.entries(answers).filter(
    ([, val]) => !val.synced
  );

  if (unsyncedEntries.length === 0) return;

  toast.info("Connection restored. Syncing answers...");

  for (const [questionId, val] of unsyncedEntries) {
    try {
      await api.patch("/assessment/answer", {
        attemptId,
        questionId,
        selectedOption: val.option,
      });
      markSynced(attemptId, questionId);
    } catch {
      // Will retry on next sync cycle
      console.warn(`Failed to sync answer for question ${questionId}`);
    }
  }
}

/**
 * Clear local assessment data after submission.
 */
export function clearLocalData(attemptId: string): void {
  localStorage.removeItem(`assessment_${attemptId}`);
}
