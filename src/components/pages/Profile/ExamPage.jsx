import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { profileApi } from "../../api/profile";

const deferState = (fn) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
};

const QUESTIONS_PER_PAGE = 5;

const scrollToQuestion = (questionId) => {
  const element = document.getElementById(`exam-question-${questionId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

const ExamPage = ({ user }) => {
  const major = user?.major || "ITE";
  const studentName = user?.name || "Student";

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    deferState(() => {
      if (cancelled) return;
      setLoading(true);
      setError("");
      setResult(null);
      setAnswers({});
      setExamStarted(false);
      setSubmitAttempted(false);
      setCurrentPage(0);
    });

    profileApi
      .getExamByMajor(major)
      .then((data) => {
        if (!cancelled) setExam(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [major]);

  const questions = useMemo(
    () => (Array.isArray(exam?.questions) ? exam.questions : []),
    [exam],
  );
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (question) => answers[question.id] !== undefined,
  ).length;
  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);
  const isComplete = totalQuestions > 0 && answeredCount === totalQuestions;
  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;
  const totalPages = Math.max(Math.ceil(totalQuestions / QUESTIONS_PER_PAGE), 1);
  const currentPageIndex = Math.min(currentPage, totalPages - 1);
  const pageStart = currentPageIndex * QUESTIONS_PER_PAGE;
  const currentPageQuestions = questions.slice(
    pageStart,
    pageStart + QUESTIONS_PER_PAGE,
  );
  const pageEnd = Math.min(pageStart + currentPageQuestions.length, totalQuestions);
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalPages - 1;
  const firstUnansweredQuestion = questions.find(
    (question) => answers[question.id] === undefined,
  );
  const firstUnansweredIndex = questions.findIndex(
    (question) => answers[question.id] === undefined,
  );
  const examLocked = Boolean(result);

  const resultTone = useMemo(() => {
    if (!result) return null;

    return result.passed
      ? {
          icon: CheckCircle2,
          title: "Exam submitted successfully",
          message:
            "You passed. Your certificate has been issued and added to your learning record.",
          tone: "success",
        }
      : {
          icon: XCircle,
          title: "Exam submitted",
          message: `You need ${result.passScore}% to pass. Review the ${major} lessons, then try again when you are ready.`,
          tone: "danger",
        };
  }, [major, result]);

  const ResultIcon = resultTone?.icon;

  const handleStart = () => {
    setExamStarted(true);
    setCurrentPage(0);
    setSubmitAttempted(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelect = (questionId, optionIndex) => {
    if (examLocked) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setError("");
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    if (!user?.id) {
      setError("Please sign in again before submitting your exam.");
      return;
    }

    if (!totalQuestions) {
      setError("This exam does not have any questions yet.");
      return;
    }

    if (!isComplete) {
      setError(
        `Please answer ${unansweredCount} required question${
          unansweredCount === 1 ? "" : "s"
        } before submitting.`,
      );
      if (firstUnansweredIndex >= 0) {
        setCurrentPage(Math.floor(firstUnansweredIndex / QUESTIONS_PER_PAGE));
        setTimeout(() => {
          if (firstUnansweredQuestion) scrollToQuestion(firstUnansweredQuestion.id);
        }, 0);
      }
      return;
    }

    if (submitting || examLocked) return;

    try {
      setSubmitting(true);
      setError("");

      const data = await profileApi.submitExam(user.id, {
        major,
        answers,
      });

      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setExamStarted(true);
    setSubmitAttempted(false);
    setCurrentPage(0);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 0));
    setSubmitAttempted(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages - 1));
    setSubmitAttempted(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .exam-root {
          min-height: 100vh;
          padding: 96px 20px 40px;
          background: #f7f5fb;
          color: #202124;
          font-family: 'Inter', 'DM Sans', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .exam-shell {
          width: 100%;
          max-width: 880px;
          margin: 0 auto;
        }

        .form-header {
          overflow: hidden;
          border: 1px solid #dadce0;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
        }

        .form-header-strip {
          height: 10px;
          background: #673ab7;
        }

        .form-header-body {
          padding: 28px 32px 24px;
        }

        .form-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #673ab7;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .form-title {
          margin: 12px 0 8px;
          font-size: 30px;
          line-height: 1.25;
          font-weight: 700;
          color: #202124;
          letter-spacing: 0;
        }

        .form-description {
          max-width: 680px;
          margin: 0;
          color: #5f6368;
          font-size: 14px;
          line-height: 1.65;
        }

        .form-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #eceff1;
        }

        .form-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 34px;
          border: 1px solid #dadce0;
          border-radius: 999px;
          background: #fff;
          padding: 7px 12px;
          color: #3c4043;
          font-size: 13px;
          font-weight: 600;
        }

        .form-card {
          margin-top: 14px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
        }

        .form-card-pad {
          padding: 24px 32px;
        }

        .intro-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin: 22px 0;
        }

        .intro-stat {
          border: 1px solid #e8eaed;
          border-radius: 8px;
          padding: 14px;
          background: #fafafa;
        }

        .intro-stat span {
          display: block;
          color: #5f6368;
          font-size: 12px;
          font-weight: 600;
        }

        .intro-stat strong {
          display: block;
          margin-top: 5px;
          color: #202124;
          font-size: 18px;
          font-weight: 700;
        }

        .intro-note {
          margin: 0 0 22px;
          color: #5f6368;
          font-size: 14px;
          line-height: 1.65;
        }

        .progress-card {
          position: sticky;
          top: 78px;
          z-index: 5;
          margin-top: 14px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
        }

        .progress-card-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 18px;
        }

        .progress-copy {
          min-width: 150px;
          color: #3c4043;
          font-size: 13px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .progress-track {
          flex: 1;
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: #eceff1;
        }

        .progress-fill {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #673ab7;
          transition: width 0.2s ease;
        }

        .question-card {
          position: relative;
          margin-top: 14px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          background: #fff;
          padding: 24px 32px 26px;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
        }

        .question-card.needs-answer {
          border-color: #d93025;
          box-shadow: inset 4px 0 0 #d93025, 0 1px 2px rgba(60, 64, 67, 0.08);
        }

        .question-kicker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .question-number {
          color: #5f6368;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .answered-badge {
          color: #137333;
          font-size: 12px;
          font-weight: 700;
        }

        .question-text {
          margin: 0;
          color: #202124;
          font-size: 16px;
          line-height: 1.55;
          font-weight: 600;
        }

        .required-star {
          color: #d93025;
          margin-left: 3px;
        }

        .options-list {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .option-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-height: 44px;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 10px 12px;
          color: #3c4043;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .option-row:hover {
          background: #f8fafd;
          border-color: #e8eaed;
        }

        .option-row.selected {
          background: #f3effb;
          border-color: #d7c6f4;
        }

        .option-row.locked {
          cursor: default;
        }

        .option-row input {
          width: 18px;
          height: 18px;
          margin-top: 1px;
          accent-color: #673ab7;
          flex: 0 0 auto;
        }

        .option-label {
          color: inherit;
          font-size: 14px;
          line-height: 1.45;
        }

        .required-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          color: #d93025;
          font-size: 12px;
          font-weight: 700;
        }

        .submit-card {
          margin-top: 14px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          background: #fff;
          padding: 18px;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
        }

        .submit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .submit-hint {
          margin: 0;
          color: #5f6368;
          font-size: 13px;
          line-height: 1.45;
        }

        .button-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .exam-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          border-radius: 6px;
          border: 1px solid transparent;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
        }

        .exam-button.primary {
          background: #673ab7;
          color: #fff;
        }

        .exam-button.primary:hover:not(:disabled) {
          background: #5e35a7;
        }

        .exam-button.secondary {
          border-color: #dadce0;
          background: #fff;
          color: #3c4043;
        }

        .exam-button.secondary:hover:not(:disabled) {
          background: #f8fafd;
        }

        .exam-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .result-panel {
          margin-top: 14px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
          overflow: hidden;
        }

        .result-panel.success {
          border-color: #c8e6c9;
        }

        .result-panel.danger {
          border-color: #f4c7c3;
        }

        .result-strip {
          height: 8px;
          background: #137333;
        }

        .result-panel.danger .result-strip {
          background: #d93025;
        }

        .result-body {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 22px 24px;
        }

        .result-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          background: #e6f4ea;
          color: #137333;
          flex: 0 0 auto;
        }

        .result-panel.danger .result-icon {
          background: #fce8e6;
          color: #d93025;
        }

        .result-title {
          margin: 0;
          color: #202124;
          font-size: 18px;
          font-weight: 700;
        }

        .result-message {
          margin: 5px 0 0;
          color: #5f6368;
          font-size: 14px;
          line-height: 1.55;
        }

        .result-score {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .score-pill {
          border: 1px solid #e8eaed;
          border-radius: 999px;
          padding: 7px 11px;
          color: #3c4043;
          font-size: 13px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .state-card {
          margin-top: 14px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          background: #fff;
          padding: 26px 32px;
          color: #5f6368;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
        }

        .state-card strong {
          display: block;
          color: #202124;
          font-size: 16px;
          margin-bottom: 5px;
        }

        .exam-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 14px;
          border: 1px solid #f4c7c3;
          border-radius: 8px;
          background: #fce8e6;
          padding: 13px 15px;
          color: #a50e0e;
          font-size: 13px;
          font-weight: 700;
        }

        .spin {
          animation: exam-spin 0.85s linear infinite;
        }

        html.dark-mode .exam-root {
          background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 30rem),
            radial-gradient(circle at top right, rgba(6, 182, 212, 0.14), transparent 28rem),
            linear-gradient(160deg, #070816, #10122a) !important;
          color: #f4f7ff;
        }

        html.dark-mode .form-header,
        html.dark-mode .form-card,
        html.dark-mode .progress-card,
        html.dark-mode .question-card,
        html.dark-mode .submit-card,
        html.dark-mode .result-panel,
        html.dark-mode .state-card {
          background: rgba(21, 23, 51, 0.96) !important;
          border-color: #2b315f !important;
          color: #f4f7ff !important;
          box-shadow: 0 20px 54px rgba(0, 0, 0, 0.42) !important;
        }

        html.dark-mode .form-header-strip,
        html.dark-mode .progress-fill {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        }

        html.dark-mode .form-eyebrow,
        html.dark-mode .answered-badge {
          color: #aebcff !important;
        }

        html.dark-mode .form-title,
        html.dark-mode .intro-stat strong,
        html.dark-mode .progress-copy,
        html.dark-mode .question-text,
        html.dark-mode .result-title,
        html.dark-mode .state-card strong {
          color: #f4f7ff !important;
        }

        html.dark-mode .form-description,
        html.dark-mode .intro-stat span,
        html.dark-mode .intro-note,
        html.dark-mode .question-number,
        html.dark-mode .submit-hint,
        html.dark-mode .result-message,
        html.dark-mode .state-card {
          color: #a8b1d6 !important;
        }

        html.dark-mode .form-meta-row {
          border-top-color: #2b315f !important;
        }

        html.dark-mode .form-chip,
        html.dark-mode .intro-stat,
        html.dark-mode .score-pill {
          background: #10142e !important;
          border-color: #2b315f !important;
          color: #d7def7 !important;
        }

        html.dark-mode .progress-track {
          background: #23274c !important;
        }

        html.dark-mode .option-row {
          color: #d7def7 !important;
        }

        html.dark-mode .option-row:hover {
          background: rgba(99, 102, 241, 0.12) !important;
          border-color: rgba(129, 140, 248, 0.32) !important;
        }

        html.dark-mode .option-row.selected {
          background: rgba(99, 102, 241, 0.20) !important;
          border-color: rgba(165, 180, 252, 0.46) !important;
        }

        html.dark-mode .question-card.needs-answer {
          border-color: #fca5a5 !important;
          box-shadow: inset 4px 0 0 #ef4444, 0 20px 54px rgba(0, 0, 0, 0.42) !important;
        }

        html.dark-mode .required-star,
        html.dark-mode .required-note {
          color: #fca5a5 !important;
        }

        html.dark-mode .exam-button.secondary {
          background: #10142e !important;
          border-color: #2b315f !important;
          color: #d7def7 !important;
        }

        html.dark-mode .exam-button.secondary:hover:not(:disabled) {
          background: #1c1f42 !important;
        }

        html.dark-mode .result-panel.success {
          border-color: rgba(110, 231, 183, 0.38) !important;
        }

        html.dark-mode .result-panel.danger {
          border-color: rgba(252, 165, 165, 0.38) !important;
        }

        html.dark-mode .result-icon {
          background: rgba(16, 185, 129, 0.18) !important;
          color: #6ee7b7 !important;
        }

        html.dark-mode .result-panel.danger .result-icon,
        html.dark-mode .exam-error {
          background: rgba(127, 29, 29, 0.22) !important;
          color: #fecaca !important;
        }

        html.dark-mode .exam-error {
          border-color: rgba(248, 113, 113, 0.32) !important;
        }

        @keyframes exam-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 720px) {
          .exam-root {
            padding: 82px 12px 28px;
          }

          .form-header-body,
          .form-card-pad,
          .question-card {
            padding: 22px 18px;
          }

          .form-title {
            font-size: 24px;
          }

          .intro-grid {
            grid-template-columns: 1fr;
          }

          .progress-card {
            top: 68px;
          }

          .progress-card-inner,
          .submit-row,
          .result-body {
            flex-direction: column;
            align-items: stretch;
          }

          .button-row {
            justify-content: stretch;
          }

          .exam-button {
            width: 100%;
          }
        }
      `}</style>

      <main className="exam-root">
        <div className="exam-shell">
          <section className="form-header" aria-labelledby="exam-title">
            <div className="form-header-strip" />
            <div className="form-header-body">
              <span className="form-eyebrow">
                <ClipboardList className="h-4 w-4" />
                {major} certification form
              </span>

              <h1 className="form-title" id="exam-title">
                {exam?.title || `${major} Certification Exam`}
              </h1>

              <p className="form-description">
                Complete every required question and submit once. A score of{" "}
                {exam?.passScore || 70}% or higher awards your certificate
                automatically.
              </p>

              <div className="form-meta-row" aria-label="Exam details">
                <span className="form-chip">
                  <ShieldCheck className="h-4 w-4" />
                  {studentName}
                </span>
                <span className="form-chip">
                  <ClipboardList className="h-4 w-4" />
                  {totalQuestions || 0} questions
                </span>
                <span className="form-chip">
                  <Award className="h-4 w-4" />
                  Pass mark {exam?.passScore || 70}%
                </span>
              </div>
            </div>
          </section>

          {error && (
            <div className="exam-error" role="alert">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {resultTone && (
            <section className={`result-panel ${resultTone.tone}`}>
              <div className="result-strip" />
              <div className="result-body">
                <span className="result-icon">
                  {ResultIcon && <ResultIcon className="h-5 w-5" />}
                </span>

                <div style={{ flex: 1 }}>
                  <h2 className="result-title">{resultTone.title}</h2>
                  <p className="result-message">{resultTone.message}</p>

                  <div className="result-score">
                    <span className="score-pill">Score {result.score}%</span>
                    <span className="score-pill">
                      {result.correct} of {result.total} correct
                    </span>
                    <span className="score-pill">
                      Pass mark {result.passScore}%
                    </span>
                  </div>

                  <div className="button-row" style={{ marginTop: 16 }}>
                    {result.passed ? (
                      <Link to="/profile" className="exam-button primary">
                        <Award className="h-4 w-4" />
                        View profile
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="exam-button primary"
                        onClick={handleRetake}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retake exam
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {loading && (
            <section className="state-card">
              <strong>Loading your exam</strong>
              <span>
                <Loader2 className="spin mr-2 inline h-4 w-4" />
                Preparing the latest questions for your major.
              </span>
            </section>
          )}

          {!loading && !examStarted && !result?.passed && (
            <section className="form-card">
              <div className="form-card-pad">
                <h2 className="question-text">
                  Before you start
                  <span className="required-star">*</span>
                </h2>
                <p className="intro-note">
                  This exam is formatted like a professional assessment form.
                  Choose one answer for each question, review your responses,
                  then submit for scoring.
                </p>

                <div className="intro-grid">
                  <div className="intro-stat">
                    <span>Total questions</span>
                    <strong>{totalQuestions || 0}</strong>
                  </div>
                  <div className="intro-stat">
                    <span>Required answers</span>
                    <strong>{totalQuestions || 0}</strong>
                  </div>
                  <div className="intro-stat">
                    <span>Passing score</span>
                    <strong>{exam?.passScore || 70}%</strong>
                  </div>
                </div>

                {!totalQuestions && !error ? (
                  <p className="intro-note">
                    No questions are available for this major yet. Please check
                    again later.
                  </p>
                ) : null}

                <button
                  type="button"
                  className="exam-button primary"
                  onClick={handleStart}
                  disabled={!totalQuestions}
                >
                  <ClipboardList className="h-4 w-4" />
                  Start exam
                </button>
              </div>
            </section>
          )}

          {!loading && examStarted && totalQuestions > 0 && (
            <>
              <section className="progress-card" aria-label="Exam progress">
                <div className="progress-card-inner">
                  <div className="progress-copy">
                    Page {currentPageIndex + 1} of {totalPages}
                  </div>
                  <div className="progress-track" aria-hidden="true">
                    <span
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="progress-copy" style={{ textAlign: "right" }}>
                    {answeredCount} of {totalQuestions} answered
                  </div>
                </div>
              </section>

              {currentPageQuestions.map((question, index) => {
                const questionAnswered = answers[question.id] !== undefined;
                const showRequired =
                  submitAttempted && !questionAnswered && !examLocked;
                const questionNumber = pageStart + index + 1;

                return (
                  <section
                    className={`question-card ${
                      showRequired ? "needs-answer" : ""
                    }`}
                    id={`exam-question-${question.id}`}
                    key={question.id}
                    aria-labelledby={`exam-question-title-${question.id}`}
                  >
                    <div className="question-kicker">
                      <span className="question-number">
                        Question {String(questionNumber).padStart(2, "0")}
                      </span>
                      {questionAnswered && (
                        <span className="answered-badge">Answered</span>
                      )}
                    </div>

                    <h2
                      className="question-text"
                      id={`exam-question-title-${question.id}`}
                    >
                      {question.question}
                      <span className="required-star">*</span>
                    </h2>

                    <div className="options-list" role="radiogroup">
                      {(question.options || []).map((option, optionIndex) => {
                        const selected = answers[question.id] === optionIndex;

                        return (
                          <label
                            className={`option-row ${
                              selected ? "selected" : ""
                            } ${examLocked ? "locked" : ""}`}
                            key={`${question.id}-${optionIndex}`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={selected}
                              disabled={examLocked}
                              onChange={() =>
                                handleSelect(question.id, optionIndex)
                              }
                            />
                            <span className="option-label">{option}</span>
                          </label>
                        );
                      })}
                    </div>

                    {showRequired && (
                      <div className="required-note">
                        <AlertCircle className="h-3.5 w-3.5" />
                        This question is required.
                      </div>
                    )}
                  </section>
                );
              })}

              <section className="submit-card">
                <div className="submit-row">
                  <p className="submit-hint">
                    {isComplete
                      ? "All questions are answered. Review once before submitting."
                      : `Showing questions ${pageStart + 1}-${pageEnd} of ${totalQuestions}. ${unansweredCount} required question${
                          unansweredCount === 1 ? "" : "s"
                        } remaining.`}
                  </p>

                  <div className="button-row">
                    {!isFirstPage && (
                      <button
                        type="button"
                        className="exam-button secondary"
                        disabled={submitting}
                        onClick={handlePreviousPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                    )}

                    {result && !result.passed && (
                      <button
                        type="button"
                        className="exam-button secondary"
                        onClick={handleRetake}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retake
                      </button>
                    )}

                    {!isLastPage ? (
                      <button
                        type="button"
                        className="exam-button primary"
                        disabled={submitting || examLocked}
                        onClick={handleNextPage}
                      >
                        Next page
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="exam-button primary"
                        disabled={submitting || examLocked}
                        onClick={handleSubmit}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="spin h-4 w-4" />
                            Submitting
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit exam
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default ExamPage;
