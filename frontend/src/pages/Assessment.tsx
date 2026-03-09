import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/api";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import {
  saveAnswerLocally,
  getLocalAnswers,
  syncUnsyncedAnswers,
  clearLocalData,
} from "../services/syncService";

interface Question {
  _id: string;
  text: string;
  options: string[];
  shuffledOptions?: { text: string; originalIndex: number }[];
}

interface Attempt {
  _id: string;
  expiresAt: string;
  submitted: boolean;
  score: number | null;
  answers: { questionId: string; selectedOption: number }[];
}

export default function Assessment() {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ score: number; total: number } | null>(null);

  // Helper to shuffle options and keep track of original indices
  const shuffleQuestions = (qs: Question[]) => {
    return qs.map(q => {
      const shuffled = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }))
        .sort(() => Math.random() - 0.5);
      return { ...q, shuffledOptions: shuffled };
    });
  };

  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);

  // Start or resume the assessment
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.post("/assessment/start");
        setAttempt(data.attempt);
        const processedQs = shuffleQuestions(data.questions || []);
        setQuestions(data.questions || []);
        setShuffledQuestions(processedQs);

        // Restore answers from attempt or localStorage
        const restored: Record<string, number> = {};
        if (data.attempt.answers) {
          for (const a of data.attempt.answers) {
            restored[a.questionId] = a.selectedOption;
          }
        }

        // Merge with local answers (local takes precedence for unsynced)
        const local = getLocalAnswers(data.attempt._id);
        for (const [qId, val] of Object.entries(local)) {
          restored[qId] = val.option;
        }

        setAnswers(restored);

        if (data.attempt.submitted) {
          setSubmitted(true);
          setScore({
            score: data.attempt.score ?? 0,
            total: data.questions.length,
          });
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to start assessment");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    if (!attempt) return;

    const handleOnline = () => {
      syncUnsyncedAnswers(attempt._id);
    };

    const handleOffline = () => {
      toast.warn("Network disconnected. Saving locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [attempt]);

  /**
   * Handle answer selection:
   * 1. Update React state
   * 2. Save to localStorage
   * 3. Attempt API call
   * 4. If API fails, mark as unsynced
   */
  const handleSelectAnswer = useCallback(
    async (questionId: string, option: number) => {
      if (!attempt || submitted) return;

      // 1. Update state
      setAnswers((prev) => ({ ...prev, [questionId]: option }));

      // 2. Save locally (initially unsynced)
      saveAnswerLocally(attempt._id, questionId, option, false);

      // 3. Attempt API call
      try {
        await api.put("/assessment/answer", {
          attemptId: attempt._id,
          questionId,
          selectedOption: option,
        });

        // 4. Mark as synced on success
        saveAnswerLocally(attempt._id, questionId, option, true);
        // toast.success("Answer saved", { autoClose: 1000 });
      } catch {
        // Stays unsynced — will be retried
        toast.warn("Saved locally. Will sync when online.", { autoClose: 2000 });
      }
    },
    [attempt, submitted]
  );

  /**
   * Submit the assessment.
   */
  const handleSubmit = async () => {
    if (!attempt) return;

    // Sync any remaining unsynced answers first
    await syncUnsyncedAnswers(attempt._id);

    setSubmitting(true);
    try {
      const { data } = await api.post("/assessment/submit", {
        attemptId: attempt._id,
      });
      setSubmitted(true);
      setScore({ score: data.score, total: data.totalQuestions });
      clearLocalData(attempt._id);
      toast.success("Assessment submitted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Auto-submit when timer expires.
   */
  const handleTimerExpire = useCallback(() => {
    if (!submitted) {
      toast.warn("The form is auto submitted.");
      handleSubmit();
    }
  }, [submitted, attempt]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Show score after submission
  if (submitted && score) {
    return (
      <div className="page-container">
        <nav className="navbar">
          <span className="nav-title">Assessment Platform</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </nav>
        <div className="card results-card">
          <h2>Assessment Complete!</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-value">{score.score}</span>
              <span className="score-divider">/</span>
              <span className="score-total">{score.total}</span>
            </div>
            <p className="score-percentage">
              {score.total > 0
                ? ((score.score / score.total) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleLogout}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <nav className="navbar">
        <span className="nav-title">Assessment</span>
        {attempt && <Timer expiresAt={attempt.expiresAt} onExpire={handleTimerExpire} />}
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="assessment-container">
        {shuffledQuestions.map((q, i) => {
          const selectedOriginalIndex = answers[q._id];
          const selectedShuffledIndex =
            selectedOriginalIndex !== undefined && selectedOriginalIndex !== null
              ? q.shuffledOptions.findIndex(
                  (o: any) => o.originalIndex === selectedOriginalIndex
                )
              : null;

          return (
            <QuestionCard
              key={q._id}
              index={i}
              questionId={q._id}
              text={q.text}
              options={q.shuffledOptions.map((o: any) => o.text)}
              selectedOption={selectedShuffledIndex}
              onSelect={(qId, sIdx) =>
                handleSelectAnswer(qId, q.shuffledOptions[sIdx].originalIndex)
              }
            />
          );
        })}

        <div className="submit-section">
          <p className="answer-count">
            {Object.keys(answers).length} of {questions.length} answered
          </p>
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
