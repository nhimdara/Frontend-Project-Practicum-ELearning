import React, { useEffect } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
        border: `1px solid ${toast.type === "success" ? "#a7f3d0" : "#fecaca"}`,
        borderRadius: "12px",
        padding: "12px 18px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        color: toast.type === "success" ? "#065f46" : "#991b1b",
        animation: "slideUp 0.25s ease",
        minWidth: "260px",
        maxWidth: "340px",
      }}
    >
      {toast.type === "success" ? (
        <CheckCircle size={17} style={{ flexShrink: 0 }} />
      ) : (
        <AlertCircle size={17} style={{ flexShrink: 0 }} />
      )}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "inherit",
          opacity: 0.7,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  VIDEO CARD
// ─────────────────────────────────────────────────────────────

export default Toast;
