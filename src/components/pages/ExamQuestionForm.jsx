import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { profileApi } from "../api/profile";

const MAJORS = ["ITE", "IT", "Mathematics"];

const emptyQuestionForm = {
  major: "ITE",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
};

const normalizeRole = (role = "") => {
  const normalized = String(role || "").trim().toLowerCase();
  return normalized === "client" ? "student" : normalized;
};

const padOptions = (options = []) => {
  const next = Array.isArray(options) ? options.slice(0, 4) : [];
  while (next.length < 4) next.push("");
  return next;
};

const getCorrectAnswerIndex = (question = {}) => {
  const answer = Number(question.correctAnswer ?? question.answer ?? 0);
  return Number.isInteger(answer) && answer >= 0 ? answer : 0;
};

const normalizeExamQuestion = (question = {}, index = 0) => ({
  id:
    question.id ||
    question.questionKey ||
    question.question_key ||
    `question-${index + 1}`,
  question:
    question.question ||
    question.questionText ||
    question.question_text ||
    "",
  options: Array.isArray(question.options) ? question.options : [],
  correctAnswer: getCorrectAnswerIndex(question),
});

function ExamQuestionForm({
  user,
  defaultMajor = "ITE",
  lockMajor = false,
  dark = false,
  onQuestionsChange,
}) {
  const getPageDarkMode = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark-mode");
  const initialMajor = MAJORS.includes(defaultMajor) ? defaultMajor : "ITE";
  const [form, setForm] = useState({
    ...emptyQuestionForm,
    major: initialMajor,
  });
  const [pageDarkMode, setPageDarkMode] = useState(getPageDarkMode);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedMajor = form.major;
  const actorRole = normalizeRole(user?.dbRole || user?.role);
  const canManage = ["admin", "teacher"].includes(actorRole);

  const optionEntries = useMemo(
    () =>
      form.options
        .map((option, index) => ({ option: option.trim(), index }))
        .filter((entry) => entry.option),
    [form.options],
  );
  const cleanOptions = optionEntries.map((entry) => entry.option);
  const selectedCleanIndex = optionEntries.findIndex(
    (entry) => entry.index === Number(form.correctAnswer),
  );

  const canSubmit =
    canManage &&
    form.question.trim().length >= 5 &&
    cleanOptions.length >= 2 &&
    selectedCleanIndex >= 0;
  const isDark = dark || pageDarkMode;

  const panelClass = isDark
    ? "exam-question-panel w-full rounded-2xl border border-indigo-400/20 bg-[#151733]/95 p-5 shadow-2xl shadow-black/30"
    : "exam-question-panel w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60";
  const labelClass = isDark
    ? "text-xs font-semibold uppercase tracking-wide text-indigo-200"
    : "text-xs font-semibold uppercase tracking-wide text-slate-500";
  const inputClass = isDark
    ? "w-full rounded-xl border border-indigo-400/25 bg-[#10142e] px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-indigo-300 disabled:opacity-60"
    : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 disabled:opacity-60";
  const mutedTextClass = isDark ? "text-slate-300" : "text-slate-500";
  const questionCardClass = isDark
    ? "exam-question-card rounded-xl border border-indigo-400/20 bg-[#10142e] p-4 shadow-lg shadow-black/20"
    : "exam-question-card rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-slate-200/70";
  const secondaryButtonClass = isDark
    ? "inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/25 bg-[#10142e] px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:border-indigo-300 hover:bg-indigo-500/15 disabled:opacity-60"
    : "inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60";
  const pillClass = isDark
    ? "inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-100"
    : "inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700";
  const cancelButtonClass = isDark
    ? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
    : "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
  const editButtonClass = isDark
    ? "inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-300/35 bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/25"
    : "inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100";
  const deleteButtonClass = isDark
    ? "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-300/35 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/25 disabled:opacity-60"
    : "inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60";
  const dividerClass = isDark
    ? "mt-6 border-t border-indigo-400/20 pt-5"
    : "mt-6 border-t border-slate-200 pt-5";

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setForm({
      ...emptyQuestionForm,
      major: lockMajor ? initialMajor : selectedMajor,
    });
  };

  const refreshQuestions = async (major = selectedMajor) => {
    try {
      setLoadingQuestions(true);
      setError("");
      const data = await profileApi.getExamByMajor(major, user);
      const normalizedQuestions = Array.isArray(data?.questions)
        ? data.questions.map(normalizeExamQuestion)
        : [];
      setQuestions(normalizedQuestions);
      onQuestionsChange?.({
        ...data,
        major,
        questions: normalizedQuestions,
      });
    } catch (err) {
      setQuestions([]);
      onQuestionsChange?.({ major, questions: [] });
      setError(err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    refreshQuestions(selectedMajor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMajor]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const observer = new MutationObserver(() => {
      setPageDarkMode(getPageDarkMode());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setPageDarkMode(getPageDarkMode());
    return () => observer.disconnect();
  }, []);

  const updateOption = (index, value) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }));
    clearAlerts();
  };

  const startEdit = (question) => {
    setEditingQuestion(question);
    setForm({
      major: selectedMajor,
      question: question.question || "",
      options: padOptions(question.options),
      correctAnswer: getCorrectAnswerIndex(question),
    });
    clearAlerts();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!canManage) {
      setError("Your account is not allowed to manage exam questions.");
      return;
    }

    if (!canSubmit) {
      setError("Complete the question, at least two options, and the correct answer.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        question: form.question.trim(),
        options: cleanOptions,
        correctAnswer: selectedCleanIndex,
      };

      if (editingQuestion) {
        await profileApi.updateExamQuestion(
          selectedMajor,
          editingQuestion.id,
          user,
          payload,
        );
        setMessage("Question updated.");
      } else {
        await profileApi.addExamQuestion(selectedMajor, user, payload);
        setMessage("Question added to the student exam.");
      }

      resetForm();
      await refreshQuestions(selectedMajor);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (question) => {
    if (!canManage || deletingId) return;
    const ok = window.confirm("Delete this exam question?");
    if (!ok) return;

    try {
      setDeletingId(question.id);
      clearAlerts();
      await profileApi.deleteExamQuestion(selectedMajor, question.id, user);
      if (editingQuestion?.id === question.id) resetForm();
      setMessage("Question deleted.");
      await refreshQuestions(selectedMajor);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`exam-question-form ${panelClass}`}>
      <form onSubmit={handleSubmit}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className={labelClass}>Student exam</p>
            <h2
              className={
                isDark
                  ? "mt-1 text-lg font-bold text-white"
                  : "mt-1 text-lg font-bold text-slate-900"
              }
            >
              {editingQuestion ? "Update exam question" : "Manage exam questions"}
            </h2>
            <p className={`mt-1 text-sm ${mutedTextClass}`}>
              Insert, update, and delete questions for the selected major.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refreshQuestions(selectedMajor)}
              disabled={loadingQuestions}
              className={secondaryButtonClass}
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingQuestions ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <div className={pillClass}>
              <Plus className="h-4 w-4" />
              Admin/Teacher
            </div>
          </div>
        </div>

        {!canManage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            <AlertCircle className="h-4 w-4" />
            Your account is not allowed to manage questions.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <label className="block">
            <span className={labelClass}>Major</span>
            <select
              className={`${inputClass} mt-1.5`}
              value={selectedMajor}
              disabled={lockMajor || saving}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, major: event.target.value }));
                setEditingQuestion(null);
                clearAlerts();
              }}
            >
              {MAJORS.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Question</span>
            <textarea
              className={`${inputClass} mt-1.5 min-h-[96px] resize-y`}
              value={form.question}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, question: event.target.value }))
              }
              placeholder="Enter the exam question"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {form.options.map((option, index) => (
            <label key={index} className="block">
              <span className={labelClass}>Option {index + 1}</span>
              <input
                className={`${inputClass} mt-1.5`}
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Answer option ${index + 1}`}
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block sm:w-64">
            <span className={labelClass}>Correct answer</span>
            <select
              className={`${inputClass} mt-1.5`}
              value={form.correctAnswer}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  correctAnswer: event.target.value,
                }))
              }
            >
              {form.options.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            {editingQuestion && (
              <button
                type="button"
                onClick={resetForm}
                className={cancelButtonClass}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving
                ? "Saving..."
                : editingQuestion
                  ? "Update question"
                  : "Add question"}
            </button>
          </div>
        </div>
      </form>

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className={dividerClass}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className={labelClass}>Question list</p>
            <h3
              className={
                isDark
                  ? "mt-1 text-base font-bold text-white"
                  : "mt-1 text-base font-bold text-slate-900"
              }
            >
              {selectedMajor} questions ({questions.length})
            </h3>
          </div>
          {loadingQuestions && (
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
          )}
        </div>

        {questions.length === 0 && !loadingQuestions ? (
          <div className={`rounded-xl border border-dashed p-5 text-sm ${mutedTextClass}`}>
            No questions found for this major.
          </div>
        ) : (
          <div className="grid gap-3">
            {questions.map((question, index) => (
              <article key={question.id || index} className={questionCardClass}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className={labelClass}>Question {index + 1}</p>
                    <p
                      className={
                        isDark
                          ? "mt-1 text-sm font-semibold text-slate-100"
                          : "mt-1 text-sm font-semibold text-slate-900"
                      }
                    >
                      {question.question}
                    </p>
                    <p className={`mt-2 text-xs ${mutedTextClass}`}>
                      {(question.options || []).filter(Boolean).join(" | ")}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(question)}
                        className={editButtonClass}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === question.id}
                        onClick={() => handleDelete(question)}
                        className={deleteButtonClass}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === question.id ? "Deleting" : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamQuestionForm;
