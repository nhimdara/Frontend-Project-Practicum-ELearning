import React, { createElement } from "react";

export const Button = ({ as = "button", variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return createElement(as, { className: `ui-button ${variants[variant]} ${className}`, ...props });
};

export const Card = ({ className = "", children, ...props }) => (
  <section className={`ui-card ${className}`} {...props}>{children}</section>
);

export const Container = ({ as = "div", className = "", ...props }) =>
  createElement(as, { className: `ui-container ${className}`, ...props });

export const ResponsiveGrid = ({ min = "16rem", className = "", style, ...props }) => (
  <div className={`ui-responsive-grid ${className}`} style={{ "--grid-min": min, ...style }} {...props} />
);

export const PageHeader = ({ eyebrow, title, description, action }) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
      <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-slate-600">{description}</p>}
    </div>
    {action}
  </header>
);

export const ProgressBar = ({ value = 0, label = "Progress" }) => {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm text-slate-600">
        <span>{label}</span><span className="font-semibold text-slate-800">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={safeValue} aria-valuemin="0" aria-valuemax="100">
        <div className="h-full rounded-full bg-indigo-600 transition-[width]" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
};

export const PageLoader = () => (
  <div className="mx-auto max-w-7xl px-5 py-32" role="status" aria-label="Loading page">
    <div className="h-8 w-52 animate-pulse rounded-lg bg-slate-200" />
    <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-slate-100" />)}
    </div>
  </div>
);
