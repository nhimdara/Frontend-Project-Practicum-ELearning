// MajorSelectPage.jsx — For ALL users with database update
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateSessionMajor, getSession } from "../../auth/authMiddleware";

const MajorSelectPage = ({ onMajorSelected }) => {
  const [selectedMajor, setSelectedMajor] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const majors = [
    { id: "ITE", name: "Information Technology Education", icon: "💻" },
    { id: "IT", name: "Information Technology", icon: "🖥️" },
    { id: "Mathematics", name: "Mathematics", icon: "📐" },
  ];

  useEffect(() => {
    const session = getSession();

    if (session) {
      setUserName(session.name || "User");
      setUserRole(session.role || "");

      if (session.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (session.major && session.needsMajorSelect === false) {
        if (session.role === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
        return;
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMajor) {
      setError("Please select a major");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // This now updates both localStorage AND database
      const success = await updateSessionMajor(selectedMajor);

      if (!success) {
        throw new Error("Failed to save major");
      }

      if (onMajorSelected) {
        onMajorSelected(selectedMajor);
      } else {
        const session = getSession();
        if (session?.role === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }
    } catch (error) {
      console.error("Error selecting major:", error);
      setError("Failed to save major selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = () => {
    if (userRole === "teacher") return "teacher";
    return "student";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">
                {userRole === "teacher" ? "👨‍🏫" : "🎓"}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {userName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            As a {getRoleText()}, please select your major to continue
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {majors.map((major) => (
              <button
                key={major.id}
                type="button"
                onClick={() => {
                  setSelectedMajor(major.id);
                  setError("");
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  selectedMajor === major.id
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl">{major.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">
                    {major.name}
                  </div>
                  <div className="text-sm text-gray-500">{major.id}</div>
                </div>
                {selectedMajor === major.id && (
                  <div className="text-indigo-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!selectedMajor || loading}
            className="w-full mt-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MajorSelectPage;
