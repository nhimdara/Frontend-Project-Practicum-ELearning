import logo from "../../assets/image/logo.png";

const MAJORS = ["all", "ITE", "IT", "Mathematics"];
const MAJOR_COLORS = {
  ITE: "#2563eb",
  IT: "#0891b2",
  Mathematics: "#7c3aed",
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Not issued";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const certificateFileName = (certificate) =>
  `${certificate.studentName || "student"}-${certificate.title || "certificate"}-${certificate.credentialId || "download"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const certificateImage = (title, color = "#2563eb") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(title || "Certificate")}&background=${color.replace("#", "")}&color=fff&size=500`;

const getCertificateLogoSrc = () => {
  if (/^(https?:|data:|blob:)/.test(logo)) return logo;
  if (typeof window === "undefined") return logo;
  return new URL(logo, window.location.origin).href;
};

const printPopupWhenReady = (popup) => {
  const print = () => {
    popup.focus();
    popup.print();
  };

  const waitForImages = Promise.all(
    Array.from(popup.document.images).map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.onload = resolve;
          image.onerror = resolve;
        }),
    ),
  );

  const waitForFonts = popup.document.fonts?.ready || Promise.resolve();
  const fallbackTimer = new Promise((resolve) =>
    window.setTimeout(resolve, 2500),
  );

  Promise.race([
    Promise.all([waitForImages, waitForFonts]),
    fallbackTimer,
  ]).finally(print);
};

// Professional certificate template, rendered standalone (used for print + download).
const buildCertificateHtml = (certificate) => {
  const accent =
    certificate.accentColor ||
    MAJOR_COLORS[certificate.studentMajor] ||
    "#b8860b";
  const studentName =
    certificate.studentName || certificate.studentEmail || "Student";
  const major = certificate.studentMajor || certificate.examMajor || "Major";
  const logoSrc = escapeHtml(getCertificateLogoSrc());
  const skills = (certificate.skills || [major]).join("  •  ");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(studentName)} Certificate</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Great+Vibes&family=EB+Garamond:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    html {
      margin: 0;
      padding: 0;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #dfe4ee;
      color: #1a1a1a;
      font-family: "EB Garamond", Georgia, serif;
    }
    .certificate {
      width: min(1150px, 96vw);
      aspect-ratio: 1.414 / 1;
      background:
        radial-gradient(circle at 50% 42%, rgba(184,134,11,0.05) 0%, rgba(184,134,11,0) 55%),
        #fffdf8;
      position: relative;
      box-shadow: 0 30px 80px rgba(15, 15, 15, 0.28);
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      overflow: hidden;
    }
    /* outer + inner ornamental border */
    .certificate::before {
      content: "";
      position: absolute;
      inset: 14px;
      border: 3px solid ${accent};
      pointer-events: none;
    }
    .certificate::after {
      content: "";
      position: absolute;
      inset: 22px;
      border: 1px solid ${accent};
      opacity: 0.55;
      pointer-events: none;
    }
    .corner {
      position: absolute;
      width: 46px;
      height: 46px;
      border: 2px solid ${accent};
      z-index: 2;
    }
    .corner.tl { top: 26px; left: 26px; border-right: none; border-bottom: none; }
    .corner.tr { top: 26px; right: 26px; border-left: none; border-bottom: none; }
    .corner.bl { bottom: 26px; left: 26px; border-right: none; border-top: none; }
    .corner.br { bottom: 26px; right: 26px; border-left: none; border-top: none; }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 46%;
      transform: translate(-50%, -50%);
      opacity: 0.05;
      z-index: 0;
      pointer-events: none;
    }

    .content {
      position: relative;
      z-index: 1;
      padding: 40px 64px;
    }

    .crest {
      width: 84px;
      height: 84px;
      margin: 0 auto 10px;
      border-radius: 50%;
      background: #fff;
      padding: 4px;
      box-shadow: 0 0 0 3px ${accent}, 0 6px 18px rgba(0,0,0,0.18);
    }
    .crest img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }

    .issuer {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-weight: 700;
      font-size: clamp(15px, 2vw, 19px);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #3f3f3f;
      margin: 0 0 2px;
    }
    .kicker {
      font: 600 12px/1.4 "EB Garamond", Arial, sans-serif;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: ${accent};
      margin: 10px 0 6px;
    }
    h1 {
      margin: 0;
      font-family: "Cormorant Garamond", Georgia, serif;
      font-weight: 600;
      font-size: clamp(38px, 5.2vw, 56px);
      letter-spacing: 0.02em;
      color: #16181d;
      line-height: 1.05;
    }
    .divider {
      width: 90px;
      height: 2px;
      background: ${accent};
      margin: 18px auto;
      opacity: 0.7;
    }
    .presented {
      margin: 4px 0 6px;
      font: 500 15px/1.5 "EB Garamond", Arial, sans-serif;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #6b7280;
    }
    .student {
      font-family: "Great Vibes", cursive;
      font-size: clamp(38px, 5.4vw, 60px);
      color: #16181d;
      margin: 4px auto 14px;
      line-height: 1.15;
    }
    .body {
      max-width: 720px;
      margin: 0 auto;
      font: 400 17px/1.7 "EB Garamond", Arial, sans-serif;
      color: #3d3d3d;
    }
    .course {
      color: #16181d;
      font-weight: 600;
      border-bottom: 1px solid ${accent};
    }
    .skills {
      display: block;
      margin-top: 8px;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${accent};
    }
    .footer {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 32px;
      align-items: end;
      margin-top: 42px;
      font: 500 13px/1.4 "EB Garamond", Arial, sans-serif;
      color: #4b5563;
    }
    .footer .label { color: #9ca3af; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
    .line { border-top: 1px solid #9ca3af; padding-top: 8px; }
    .credential {
      position: absolute;
      left: 40px;
      bottom: 40px;
      z-index: 2;
      font: 500 11px "EB Garamond", Arial, sans-serif;
      letter-spacing: 0.04em;
      color: #9ca3af;
    }
    .verify {
      position: absolute;
      right: 40px;
      bottom: 40px;
      z-index: 2;
      font: 500 11px "EB Garamond", Arial, sans-serif;
      letter-spacing: 0.04em;
      color: #9ca3af;
      text-align: right;
    }
    @media print {
      html,
      body {
        width: 297mm;
        height: 210mm;
        min-height: 0;
        overflow: hidden;
      }
      body {
        display: block;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .certificate {
        width: 297mm;
        height: 210mm;
        max-width: none;
        aspect-ratio: auto;
        box-shadow: none;
        break-inside: avoid;
        page-break-inside: avoid;
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <main class="certificate">
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
    <img class="watermark" src="${logoSrc}" alt="" />
    <div class="content">
      <div class="crest"><img src="${logoSrc}" alt="University Seal" /></div>
      <p class="issuer">${escapeHtml(certificate.issuer || "Royal University of Phnom Penh")}</p>
      <p class="kicker">Certificate of Achievement</p>
      <h1>${escapeHtml(certificate.title || "Academic Achievement")}</h1>
      <div class="divider"></div>
      <p class="presented">This certificate is proudly presented to</p>
      <div class="student">${escapeHtml(studentName)}</div>
      <p class="body">
        For successfully demonstrating outstanding achievement in
        <span class="course">${escapeHtml(major)}</span>, fulfilling all requirements
        with distinction.
        <span class="skills">${skills}</span>
      </p>
      <div class="footer">
        <div>
          <p class="label">Date Issued</p>
          <div class="line">${escapeHtml(formatDate(certificate.issueDate))}</div>
        </div>
        <div>
          <p class="label">Grade</p>
          <div class="line">${escapeHtml(certificate.grade || "Complete")}</div>
        </div>
        <div>
          <p class="label">Headteacher Signature</p>
          <div class="line">&nbsp;</div>
        </div>
      </div>
    </div>
    <div class="credential">Credential ID&nbsp;&nbsp;${escapeHtml(certificate.credentialId || "PREVIEW")}</div>
    <div class="verify">Verified Digital Record</div>
  </main>
</body>
</html>`;
};

export {
  MAJORS,
  MAJOR_COLORS,
  formatDate,
  certificateFileName,
  certificateImage,
  printPopupWhenReady,
  buildCertificateHtml,
};
