import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Plus, Save } from "lucide-react";
import { profileApi } from "../api/profile";

const MAJORS = ["ITE", "IT", "Mathematics"];

const emptyQuestionForm = {
  major: "ITE",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
};

function ExamQuestionForm({ user, defaultMajor = "ITE", lockMajor = false, dark = false }) {
  const initialMajor = MAJORS.includes(defaultMajor) ? defaultMajor : "ITE";
  const [form, setForm] = useState({ ...emptyQuestionForm, major: initialMajor });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    form.question.trim().length >= 5 &&
    cleanOptions.length >= 2 &&
    selectedCleanIndex >= 0;

  const panelClass = dark
    ? "w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
    : "w-full rounded-2xl border border-slate-200 bg-white p-5";
  const labelClass = dark
    ? "text-xs font-semibold uppercase tracking-wide text-slate-400"
    : "text-xs font-semibold uppercase tracking-wide text-slate-500";
  const inputClass = dark
    ? "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
    : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500";

  const updateOption = (index, value) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }));
    setMessage("");
    setError("");
  };

  const resetForm = () => {
    setForm({ ...emptyQuestionForm, major: lockMajor ? initialMajor : form.major });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!canSubmit) {
      setError("Complete the question, at least two options, and the correct answer.");
      return;
    }

    try {
      setSaving(true);
      await profileApi.addExamQuestion(form.major, user, {
        question: form.question,
        options: cleanOptions,
        correctAnswer: selectedCleanIndex,
      });
      setMessage("Question added to the student exam.");
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={panelClass}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={labelClass}>Student exam</p>
          <h2 className={dark ? "mt-1 text-lg font-bold text-white" : "mt-1 text-lg font-bold text-slate-900"}>
            Add exam question
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
          <Plus className="h-4 w-4" />
          Teacher/Admin only
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <label className="block">
          <span className={labelClass}>Major</span>
          <select
            className={`${inputClass} mt-1.5`}
            value={form.major}
            disabled={lockMajor}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, major: event.target.value }))
            }
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
              setForm((prev) => ({ ...prev, correctAnswer: event.target.value }))
            }
          >
            {form.options.map((_, index) => (
              <option key={index} value={index}>
                Option {index + 1}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Adding..." : "Add question"}
        </button>
      </div>

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
    </form>
  );
}

export default ExamQuestionForm;
