  import React, { useEffect, useMemo, useState } from "react";
  import {
    Award,
    CheckCircle2,
    ClipboardList,
    RotateCcw,
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

  const ExamPage = ({ user }) => {
    const major = user?.major || "ITE";
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
      let cancelled = false;
      deferState(() => {
        if (cancelled) return;
        setLoading(true);
        setError("");
        setResult(null);
        setAnswers({});
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

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = exam?.questions?.length || 0;
    const isComplete = totalQuestions > 0 && answeredCount === totalQuestions;
    const progress = totalQuestions
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

    const resultTone = useMemo(() => {
      if (!result) return null;
      return result.passed
        ? {
            icon: CheckCircle2,
            title: "Exam passed",
            message:
              "Your certificate has been issued and added to your certificates page.",
            bg: "#f0fdf4",
            color: "#15803d",
            border: "#bbf7d0",
            iconBg: "#dcfce7",
          }
        : {
            icon: XCircle,
            title: "Not quite there yet",
            message: `A score of ${result.passScore}% is required to pass. Review the ${major} lessons, then retake the exam when you're ready.`,
            bg: "#fef2f2",
            color: "#b91c1c",
            border: "#fecaca",
            iconBg: "#fee2e2",
          };
    }, [major, result]);

    const handleSelect = (questionId, optionIndex) => {
      if (result?.passed) return;
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
      if (!user?.id || !isComplete || submitting) return;
      try {
        setSubmitting(true);
        setError("");
        const data = await profileApi.submitExam(user.id, { major, answers });
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
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
      <>
        <style>{`
          .exam-root {
            min-height: 100vh;
            padding: 88px 0 72px;
            background: #f6f7f9;
            font-family: 'Inter', 'DM Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .exam-shell {
            max-width: 860px;
            margin: 0 auto;
            padding: 0 20px;
          }

          /* ---------- header ---------- */
          .exam-topline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 20px;
          }
          .exam-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #6366f1;
          }
          .exam-title {
            font-size: 26px;
            line-height: 1.25;
            font-weight: 700;
            color: #0f172a;
            margin-top: 6px;
            letter-spacing: -0.01em;
          }
          .exam-subtitle {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
          }
          .exam-meta {
            text-align: right;
            flex-shrink: 0;
          }
          .exam-meta-count {
            font-size: 13px;
            font-weight: 600;
            color: #334155;
            font-variant-numeric: tabular-nums;
          }
          .exam-progress-track {
            width: 140px;
            height: 6px;
            background: #e2e8f0;
            border-radius: 999px;
            overflow: hidden;
            margin-top: 8px;
          }
          .exam-progress-fill {
            display: block;
            height: 100%;
            background: #4f46e5;
            border-radius: 999px;
            transition: width 0.25s ease;
          }

          /* ---------- panel ---------- */
          .exam-panel {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.03);
            overflow: hidden;
          }
          .question-row {
            padding: 26px 28px;
            border-bottom: 1px solid #f1f2f4;
          }
          .question-row:last-of-type {
            border-bottom: none;
          }
          .question-head {
            display: flex;
            align-items: baseline;
            gap: 10px;
          }
          .question-index {
            font-size: 12px;
            font-weight: 700;
            color: #94a3b8;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.03em;
          }
          .question-text {
            font-size: 15.5px;
            font-weight: 600;
            color: #0f172a;
            margin-top: 6px;
            line-height: 1.45;
          }
          .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 16px;
          }
          .option-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 11px 13px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: #fff;
            color: #334155;
            font-size: 13.5px;
            font-weight: 500;
            text-align: left;
            line-height: 1.35;
            transition: border-color 0.15s ease, background 0.15s ease;
          }
          .option-btn:hover {
            border-color: #c7d2fe;
            background: #fafaff;
          }
          .option-btn:focus-visible {
            outline: 2px solid #4f46e5;
            outline-offset: 1px;
          }
          .option-btn.selected {
            border-color: #4f46e5;
            background: #eef2ff;
            color: #3730a3;
            font-weight: 600;
          }
          .option-dot {
            width: 16px;
            height: 16px;
            border-radius: 999px;
            border: 1.5px solid #cbd5e1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .option-btn.selected .option-dot {
            border-color: #4f46e5;
          }
          .option-btn.selected .option-dot:after {
            content: "";
            width: 7px;
            height: 7px;
            border-radius: 999px;
            background: #4f46e5;
          }

          /* ---------- footer actions ---------- */
          .exam-actions {
            padding: 18px 28px;
            background: #fafbfc;
            border-top: 1px solid #eef0f2;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          .exam-hint {
            font-size: 13px;
            color: #94a3b8;
          }
          .exam-button {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border-radius: 7px;
            padding: 9px 16px;
            border: 1px solid transparent;
            font-size: 13.5px;
            font-weight: 600;
            transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
            text-decoration: none;
          }
          .exam-button.primary {
            color: white;
            background: #4338ca;
          }
          .exam-button.primary:hover:not(:disabled) {
            background: #3730a3;
          }
          .exam-button.primary:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }
          .exam-button.secondary {
            color: #334155;
            background: white;
            border-color: #d1d5db;
          }
          .exam-button.secondary:hover {
            background: #f8fafc;
          }

          /* ---------- result banner ---------- */
          .result-panel {
            margin-bottom: 18px;
            border-radius: 12px;
            padding: 18px 20px;
            border: 1px solid var(--result-border);
            background: var(--result-bg);
            color: var(--result-color);
            display: flex;
            gap: 14px;
            align-items: flex-start;
          }
          .result-icon-wrap {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            background: var(--result-icon-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .result-title {
            font-size: 15.5px;
            font-weight: 700;
            margin: 0;
          }
          .result-message {
            font-size: 13.5px;
            margin-top: 3px;
            line-height: 1.5;
            opacity: 0.92;
          }
          .result-score {
            font-size: 13px;
            font-weight: 700;
            margin-top: 10px;
            font-variant-numeric: tabular-nums;
          }

          /* ---------- states ---------- */
          .exam-loading {
            padding: 40px 28px;
            font-size: 14px;
            color: #6366f1;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .exam-error {
            margin: 20px 28px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            background: #fef2f2;
            padding: 12px 14px;
            font-size: 13.5px;
            color: #b91c1c;
          }

          @media (max-width: 640px) {
            .exam-topline {
              flex-direction: column;
              align-items: flex-start;
            }
            .exam-meta {
              text-align: left;
            }
            .options-grid {
              grid-template-columns: 1fr;
            }
            .question-row {
              padding: 20px;
            }
            .exam-actions {
              padding: 18px 20px;
              flex-direction: column;
              align-items: stretch;
            }
            .exam-button {
              justify-content: center;
            }
          }
        `}</style>

        <main className="exam-root">
          <div className="exam-shell">
            <div className="exam-topline">
              <div>
                <span className="exam-eyebrow">
                  <ClipboardList className="h-3.5 w-3.5" />
                  {major} Certification Exam
                </span>
                <h1 className="exam-title">{exam?.title || "Student Exam"}</h1>
                <p className="exam-subtitle">
                  Score {exam?.passScore || 70}% or higher to earn a verified
                  certificate.
                </p>
              </div>
              {totalQuestions > 0 && (
                <div className="exam-meta">
                  <div className="exam-meta-count">
                    {answeredCount} / {totalQuestions} answered
                  </div>
                  <div className="exam-progress-track">
                    <span
                      className="exam-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {resultTone && (
              <div
                className="result-panel"
                style={{
                  "--result-bg": resultTone.bg,
                  "--result-color": resultTone.color,
                  "--result-border": resultTone.border,
                  "--result-icon-bg": resultTone.iconBg,
                }}
              >
                <span className="result-icon-wrap">
                  <resultTone.icon className="h-5 w-5" />
                </span>
                <div style={{ flex: 1 }}>
                  <p className="result-title">{resultTone.title}</p>
                  <p className="result-message">{resultTone.message}</p>
                  <p className="result-score">
                    Score: {result.score}% &nbsp;·&nbsp; {result.correct}/
                    {result.total} correct
                  </p>
                  {result.passed && (
                    <Link
                      to="/certificates"
                      className="exam-button primary"
                      style={{ marginTop: 12 }}
                    >
                      <Award className="h-4 w-4" />
                      View certificate
                    </Link>
                  )}
                </div>
              </div>
            )}

            <section className="exam-panel">
              {loading && <div className="exam-loading">Loading your exam…</div>}

              {error && <div className="exam-error">{error}</div>}

              {!loading &&
                exam?.questions?.map((question, index) => (
                  <div className="question-row" key={question.id}>
                    <div className="question-head">
                      <span className="question-index">
                        Q{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="question-text">{question.question}</h2>
                    <div className="options-grid">
                      {question.options.map((option, optionIndex) => {
                        const selected = answers[question.id] === optionIndex;
                        return (
                          <button
                            type="button"
                            key={option}
                            className={`option-btn ${selected ? "selected" : ""}`}
                            onClick={() => handleSelect(question.id, optionIndex)}
                          >
                            <span className="option-dot" />
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {!loading && exam?.questions?.length > 0 && (
                <div className="exam-actions">
                  <p className="exam-hint">
                    Answer every question before submitting.
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {result && !result.passed && (
                      <button
                        type="button"
                        className="exam-button secondary"
                        onClick={handleRetake}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retake exam
                      </button>
                    )}
                    <button
                      type="button"
                      className="exam-button primary"
                      disabled={!isComplete || submitting || result?.passed}
                      onClick={handleSubmit}
                    >
                      {submitting ? "Submitting…" : "Submit exam"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </>
    );
  };

  export default ExamPage;
