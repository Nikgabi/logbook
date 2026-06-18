import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";
import { getProfile } from "./profile.js";

// ════════════════════════════════════════════════════════
// LABELS GR / EN
// ════════════════════════════════════════════════════════

const LABELS = {
   gr: {
      credentials:    "Τίτλοι Σπουδών",
      jobs:           "Επαγγελματική Εμπειρία",
      publications:   "Δημοσιεύσεις",
      conferences:    "Συνέδρια & Ανακοινώσεις",
      research:       "Ερευνητικό Έργο",
      education:      "Εκπαιδευτικό Έργο",
      fellowships:    "Μετεκπαιδεύσεις",
      seminars:       "Σεμινάρια",
      awards:         "Βραβεία & Διακρίσεις",
      books:          "Βιβλία & Κεφάλαια",
      journals:       "Επιστημονικά Περιοδικά",
      associations:   "Επιστημονικές Εταιρείες & Σύλλογοι",
      administration: "Διοικητικό Έργο",
      languages:      "Ξένες Γλώσσες",
      hobbies:        "Ενδιαφέροντα",
      procedures:     "Λογάριθμος Χειρουργείων",
      medprocedures:  "Λογάριθμος Ιατρικών Πράξεων",
   },
   en: {
      credentials:    "Education & Degrees",
      jobs:           "Professional Experience",
      publications:   "Publications",
      conferences:    "Conferences & Presentations",
      research:       "Research",
      education:      "Teaching & Educational Activities",
      fellowships:    "Fellowships & Training Abroad",
      seminars:       "Seminars & Courses",
      awards:         "Awards & Distinctions",
      books:          "Books & Book Chapters",
      journals:       "Editorial Activities",
      associations:   "Scientific Societies & Associations",
      administration: "Administrative Roles",
      languages:      "Languages",
      hobbies:        "Interests & Hobbies",
      procedures:     "Surgical Log",
      medprocedures:  "Medical Procedures Log",
   }
};

// ════════════════════════════════════════════════════════
// CSS του εγγράφου
// ════════════════════════════════════════════════════════
const CV_STYLE = `
   <style>
   .cv-header { border-bottom: 3px solid #1a3a5c; padding-bottom: 20px; margin-bottom: 28px; }
   .cv-photo { width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid #1a3a5c; }
   .cv-name { font-size:26px; font-weight:700; color:#1a3a5c; margin:0; }
   .cv-title { font-size:14px; color:#4a6a8c; margin:4px 0 0; }
   .cv-contact { font-size:11px; color:#555; margin-top:8px; }
   .cv-contact a { color:#1a3a5c; text-decoration:none; }
   .cv-bio { font-size:12px; color:#333; margin-top:12px; font-style:italic; }
   .cv-section { margin-bottom:24px; }
   .cv-section-title {
      font-size:13px; font-weight:700; color:#fff;
      background:#1a3a5c; padding:5px 12px;
      margin-bottom:12px; letter-spacing:0.05em;
      text-transform:uppercase;
   }
   .cv-entry { margin-bottom:10px; padding-bottom:10px; border-bottom:0.5px solid #e0e0e0; }
   .cv-entry:last-child { border-bottom:none; margin-bottom:0; }
   .cv-entry-title { font-weight:700; font-size:13px; color:#1a1a1a; }
   .cv-entry-sub { font-size:12px; color:#444; }
   .cv-entry-date { font-size:11px; color:#777; }
   .cv-entry-note { font-size:11px; color:#555; font-style:italic; }
   .cv-badge { display:inline-block; font-size:10px; padding:2px 8px;
      border-radius:10px; margin:2px; border:1px solid #1a3a5c; color:#1a3a5c; }
   .cv-table { width:100%; border-collapse:collapse; font-size:11px; margin-top:4px; }
   .cv-table th { background:#e8eef5; color:#1a3a5c; padding:4px 8px; text-align:left; }
   .cv-table td { padding:4px 8px; border-bottom:0.5px solid #eee; }
   .cv-table tr:last-child td { border-bottom:none; }
   .cv-total { font-weight:700; color:#1a3a5c; font-size:12px; margin-top:6px; text-align:right; }
   </style>
`;

// ════════════════════════════════════════════════════════
// ΒΟΗΘΗΤΙΚΗ: section header
// ════════════════════════════════════════════════════════
function section(title, content) {
   return `
   <div class="cv-section">
      <div class="cv-section-title">${title}</div>
      ${content}
   </div>`;
}

// ════════════════════════════════════════════════════════
// ΣΥΛΛΟΓΗ ΔΕΔΟΜΕΝΩΝ
// ════════════════════════════════════════════════════════
async function fetchAllData(uid) {
   const [
      credentials, jobs, publications, conferences, conf_parts,
      research, education, fellowships, seminars, awards,
      books, journals, associations, administration,
      languages, hobbies, procedures, medprocedures
   ] = await Promise.all([
      db.credentials.where("uid").equals(uid).toArray(),
      db.jobs.where("uid").equals(uid).toArray(),
      db.publications.where("uid").equals(uid).toArray(),
      db.conferences.where("uid").equals(uid).toArray(),
      db.conference_participations.where("uid").equals(uid).toArray(),
      db.research.where("uid").equals(uid).toArray(),
      db.education.where("uid").equals(uid).toArray(),
      db.fellowships.where("uid").equals(uid).toArray(),
      db.seminars.where("uid").equals(uid).toArray(),
      db.awards.where("uid").equals(uid).toArray(),
      db.books.where("uid").equals(uid).toArray(),
      db.journals.where("uid").equals(uid).toArray(),
      db.associations.where("uid").equals(uid).toArray(),
      db.administration.where("uid").equals(uid).toArray(),
      db.languages.where("uid").equals(uid).toArray(),
      db.hobbies.where("uid").equals(uid).toArray(),
      db.procedures.where("uid").equals(uid).toArray(),
      db.medprocedures.where("uid").equals(uid).toArray(),
   ]);
   return {
      credentials, jobs, publications, conferences, conf_parts,
      research, education, fellowships, seminars, awards,
      books, journals, associations, administration,
      languages, hobbies, procedures, medprocedures
   };
}

// ════════════════════════════════════════════════════════
// ΚΤΙΣΙΜΟ HTML ΒΙΟΓΡΑΦΙΚΟΥ
// ════════════════════════════════════════════════════════
function buildCV(profile, data, lang) {
   const L = LABELS[lang];
   const isGr = lang === "gr";
   let html = CV_STYLE;

   // ── Header ──────────────────────────────────────────
   const name = isGr
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : `${profile.firstNameEn || ""} ${profile.lastNameEn || ""}`.trim();
   const title = isGr ? (profile.title || "") : (profile.titleEn || "");
   const bio   = isGr ? (profile.bioGr || "") : (profile.bioEn || "");

   html += `<div class="cv-header">
   <div style="display:flex; gap:20px; align-items:center;">
      ${profile.photo ? `<img src="${profile.photo}" class="cv-photo">` : ""}
      <div style="flex:1;">
         <p class="cv-name">${name}</p>
         <p class="cv-title">${title}</p>
         <div class="cv-contact">
            ${profile.email   ? `✉ ${profile.email}` : ""}
            ${profile.phone   ? ` &nbsp;|&nbsp; ☎ ${profile.phone}` : ""}
            ${profile.address ? ` &nbsp;|&nbsp; 📍 ${profile.address}` : ""}
            ${profile.linkedin ? ` &nbsp;|&nbsp; <a href="${profile.linkedin}">LinkedIn</a>` : ""}
            ${profile.orcid   ? ` &nbsp;|&nbsp; ORCID: ${profile.orcid}` : ""}
         </div>
         ${bio ? `<div class="cv-bio">${bio}</div>` : ""}
      </div>
   </div>
</div>`;

   // ── Τίτλοι Σπουδών ──────────────────────────────────
   if (data.credentials.length) {
      let c = "";
      data.credentials.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.title || "—"}</div>
            <div class="cv-entry-sub">${i.certificationType || ""}</div>
         </div>`;
      });
      html += section(L.credentials, c);
   }

   // ── Επαγγελματική Εμπειρία ──────────────────────────
   if (data.jobs.length) {
      let c = "";
      data.jobs.sort((a,b) => (b.startDate||"").localeCompare(a.startDate||"")).forEach(i => {
         const period = i.currentEmployment ? `${i.startDate} – ${isGr?"Σήμερα":"Present"}` : `${i.startDate||""} – ${i.endDate||""}`;
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.grade || "—"}</div>
            <div class="cv-entry-sub">${i.organizationName || ""} ${i.department ? "– "+i.department : ""}</div>
            <div class="cv-entry-date">${period}</div>
         </div>`;
      });
      html += section(L.jobs, c);
   }

   // ── Δημοσιεύσεις ────────────────────────────────────
   if (data.publications.length) {
      let c = "";
      data.publications.forEach((i,idx) => {
         c += `<div class="cv-entry">
            <div class="cv-entry-sub">${idx+1}. ${i.authors || ""} <em>${i.paper || ""}</em> ${i.publicationType || ""}</div>
         </div>`;
      });
      html += section(L.publications, c);
   }

   // ── Συνέδρια ────────────────────────────────────────
   if (data.conferences.length) {
      let c = "";
      data.conferences.forEach(conf => {
         const parts = data.conf_parts.filter(p => p.conferenceId === conf.id);
         const roles = parts.map(p => p.type).join(", ");
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${conf.title || "—"}</div>
            <div class="cv-entry-sub">${conf.society || ""} &nbsp;|&nbsp; ${conf.city||""}, ${conf.country||""}</div>
            <div class="cv-entry-date">${conf.startDate||""} – ${conf.endDate||""}</div>
            ${roles ? `<div class="cv-entry-note">${roles}</div>` : ""}
         </div>`;
      });
      html += section(L.conferences, c);
   }

   // ── Ερευνητικό Έργο ─────────────────────────────────
   if (data.research.length) {
      let c = "";
      data.research.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.title || "—"}</div>
            <div class="cv-entry-sub">${i.role||""} &nbsp;|&nbsp; ${i.institution||""}</div>
            <div class="cv-entry-date">${i.dateFrom||""} – ${i.ongoing?(isGr?"Σήμερα":"Present"):(i.dateTo||"")}</div>
            ${i.clinicalTrialsId ? `<div class="cv-entry-note">ClinicalTrials: ${i.clinicalTrialsId}</div>` : ""}
         </div>`;
      });
      html += section(L.research, c);
   }

   // ── Εκπαιδευτικό Έργο ───────────────────────────────
   if (data.education.length) {
      let c = "";
      data.education.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.title || "—"}</div>
            <div class="cv-entry-sub">${i.role||""} &nbsp;|&nbsp; ${i.activity||""} &nbsp;|&nbsp; ${i.organizer||""}</div>
            <div class="cv-entry-date">${i.dateFrom||""} – ${i.dateTo||""} ${i.hours ? `&nbsp;|&nbsp; ${i.hours}h` : ""} ${i.credits ? `&nbsp;|&nbsp; ${i.credits} credits` : ""}</div>
         </div>`;
      });
      html += section(L.education, c);
   }

   // ── Μετεκπαιδεύσεις ─────────────────────────────────
   if (data.fellowships.length) {
      let c = "";
      data.fellowships.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.subject || "—"}</div>
            <div class="cv-entry-sub">${i.institution||""} ${i.department ? "– "+i.department : ""} &nbsp;|&nbsp; ${i.city||""}, ${i.country||""}</div>
            <div class="cv-entry-date">${i.dateFrom||""} – ${i.dateTo||""} &nbsp;|&nbsp; ${i.type||""}</div>
            ${i.supervisor ? `<div class="cv-entry-note">${isGr?"Υπεύθυνος":"Supervisor"}: ${i.supervisor}</div>` : ""}
         </div>`;
      });
      html += section(L.fellowships, c);
   }

   // ── Σεμινάρια ───────────────────────────────────────
   if (data.seminars.length) {
      let c = "";
      data.seminars.forEach(i => {
         const roles = [
            i.attendee ? (isGr?"Παρακολούθηση":"Attendee") : "",
            i.trainer  ? (isGr?"Εκπαιδευτής":"Trainer") : "",
            i.speaker  ? (isGr?"Ομιλητής":"Speaker") : ""
         ].filter(Boolean).join(", ");
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.title || "—"}</div>
            <div class="cv-entry-sub">${i.organizer||""} &nbsp;|&nbsp; ${i.type||""}</div>
            <div class="cv-entry-date">${i.dateFrom||""} ${i.credits ? `&nbsp;|&nbsp; ${i.credits} credits` : ""}</div>
            ${roles ? `<div class="cv-entry-note">${roles}</div>` : ""}
         </div>`;
      });
      html += section(L.seminars, c);
   }

   // ── Βραβεία ─────────────────────────────────────────
   if (data.awards.length) {
      let c = "";
      data.awards.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.title || "—"}</div>
            <div class="cv-entry-sub">${i.organizer||""} &nbsp;|&nbsp; ${i.category||""} ${i.position ? "– "+i.position : ""}</div>
            <div class="cv-entry-date">${i.date||""}</div>
         </div>`;
      });
      html += section(L.awards, c);
   }

   // ── Βιβλία ──────────────────────────────────────────
   if (data.books.length) {
      let c = "";
      data.books.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.title || "—"}</div>
            <div class="cv-entry-sub">${i.role||""} &nbsp;|&nbsp; ${i.publisher||""}</div>
            ${i.isbn ? `<div class="cv-entry-note">ISBN: ${i.isbn}</div>` : ""}
            ${i.chapters ? `<div class="cv-entry-note">${i.chapters}</div>` : ""}
         </div>`;
      });
      html += section(L.books, c);
   }

   // ── Περιοδικά ───────────────────────────────────────
   if (data.journals.length) {
      let c = "";
      data.journals.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.title || "—"}</div>
            <div class="cv-entry-sub">${i.role||""} &nbsp;|&nbsp; ${i.publisher||""}</div>
            <div class="cv-entry-date">${i.dateFrom||""} – ${i.active?(isGr?"Σήμερα":"Present"):(i.dateTo||"")}</div>
         </div>`;
      });
      html += section(L.journals, c);
   }

   // ── Εταιρείες ───────────────────────────────────────
   if (data.associations.length) {
      let c = "";
      data.associations.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.name || "—"}</div>
            <div class="cv-entry-sub">${i.category||""} &nbsp;|&nbsp; ${i.role||""}</div>
            <div class="cv-entry-date">${i.dateFrom||""} – ${i.current?(isGr?"Σήμερα":"Present"):(i.dateTo||"")}</div>
         </div>`;
      });
      html += section(L.associations, c);
   }

   // ── Διοίκηση ────────────────────────────────────────
   if (data.administration.length) {
      let c = "";
      data.administration.forEach(i => {
         c += `<div class="cv-entry">
            <div class="cv-entry-title">${i.role || "—"}</div>
            <div class="cv-entry-sub">${i.institution||""}</div>
            <div class="cv-entry-date">${i.dateFrom||""} – ${i.current?(isGr?"Σήμερα":"Present"):(i.dateTo||"")}</div>
         </div>`;
      });
      html += section(L.administration, c);
   }

   // ── Χειρουργεία (πίνακας) ───────────────────────────
   if (data.procedures.length) {
      const grouped = {};
      data.procedures.forEach(i => {
         if (!grouped[i.role]) grouped[i.role] = [];
         grouped[i.role].push(i);
      });
      let c = "";
      let grandTotal = 0;
      for (const [role, entries] of Object.entries(grouped)) {
         const total = entries.reduce((s,i) => s+i.count, 0);
         grandTotal += total;
         c += `<div style="margin-bottom:10px;">
            <div class="cv-entry-title" style="margin-bottom:4px;">${role} (${isGr?"Σύνολο":"Total"}: ${total})</div>
            <table class="cv-table">
               <tr><th>${isGr?"Πράξη":"Procedure"}</th><th>${isGr?"Τύπος":"Type"}</th><th>${isGr?"Νοσοκομείο":"Hospital"}</th><th>${isGr?"Αρ.":"N"}</th></tr>
               ${entries.map(e => `<tr><td>${e.name}</td><td>${e.type}</td><td>${e.hospital}</td><td><b>${e.count}</b></td></tr>`).join("")}
            </table>
         </div>`;
      }
      c += `<div class="cv-total">Grand Total: ${grandTotal} ${isGr?"χειρουργεία":"procedures"}</div>`;
      html += section(L.procedures, c);
   }

   // ── Ιατρικές Πράξεις (πίνακας) ──────────────────────
   if (data.medprocedures.length) {
      const grouped = {};
      data.medprocedures.forEach(i => {
         if (!grouped[i.role]) grouped[i.role] = [];
         grouped[i.role].push(i);
      });
      let c = "";
      let grandTotal = 0;
      for (const [role, entries] of Object.entries(grouped)) {
         const total = entries.reduce((s,i) => s+i.count, 0);
         grandTotal += total;
         c += `<div style="margin-bottom:10px;">
            <div class="cv-entry-title" style="margin-bottom:4px;">${role} (${isGr?"Σύνολο":"Total"}: ${total})</div>
            <table class="cv-table">
               <tr><th>${isGr?"Πράξη":"Procedure"}</th><th>${isGr?"Κατηγορία":"Category"}</th><th>${isGr?"Νοσοκομείο":"Hospital"}</th><th>${isGr?"Αρ.":"N"}</th></tr>
               ${entries.map(e => `<tr><td>${e.name}</td><td>${e.category}</td><td>${e.hospital}</td><td><b>${e.count}</b></td></tr>`).join("")}
            </table>
         </div>`;
      }
      c += `<div class="cv-total">Grand Total: ${grandTotal} ${isGr?"πράξεις":"procedures"}</div>`;
      html += section(L.medprocedures, c);
   }

   // ── Γλώσσες ─────────────────────────────────────────
   if (data.languages.length) {
      let c = `<div style="display:flex; flex-wrap:wrap; gap:8px;">`;
      data.languages.forEach(i => {
         c += `<span class="cv-badge">${i.name} — ${i.level}</span>`;
      });
      c += `</div>`;
      html += section(L.languages, c);
   }

   // ── Χόμπι ───────────────────────────────────────────
   if (data.hobbies.length) {
      let c = `<div style="display:flex; flex-wrap:wrap; gap:8px;">`;
      data.hobbies.forEach(i => {
         c += `<span class="cv-badge">${i.category}${i.description ? " — "+i.description : ""}</span>`;
      });
      c += `</div>`;
      html += section(L.hobbies, c);
   }

   // Footer
   html += `<div style="margin-top:32px; padding-top:12px; border-top:1px solid #ccc; font-size:10px; color:#999; text-align:right;">
      ${isGr?"Δημιουργήθηκε":"Generated"}: ${new Date().toLocaleDateString(isGr?"el-GR":"en-GB")} — Medical LogBook
   </div>`;

   return html;
}

// ════════════════════════════════════════════════════════
// PREVIEW
// ════════════════════════════════════════════════════════
let currentLang = "gr";

export async function previewCV(lang) {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   currentLang = lang;
   const profile = await getProfile();
   if (!profile) { alert(lang === "gr" ? "Παρακαλώ συμπληρώστε πρώτα το Προφίλ." : "Please fill in your Profile first."); return; }

   const data = await fetchAllData(user.uid);
   const html = buildCV(profile, data, lang);

   document.getElementById("cvDocument").innerHTML = html;
   document.getElementById("cvPreviewArea").style.display = "block";
   document.getElementById("downloadCvGrBtn").style.display = lang === "gr" ? "inline-block" : "none";
   document.getElementById("downloadCvEnBtn").style.display = lang === "en" ? "inline-block" : "none";
   document.getElementById("closeCvBtn").style.display = "inline-block";

   document.getElementById("cvPreviewArea").scrollIntoView({ behavior: "smooth" });
}

// ════════════════════════════════════════════════════════
// DOWNLOAD PDF με html2canvas
// ════════════════════════════════════════════════════════
export async function downloadCV() {
   const doc = document.getElementById("cvDocument");
   if (!doc) return;

   // Φόρτωση libraries
   await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
   await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

   const btn = currentLang === "gr"
      ? document.getElementById("downloadCvGrBtn")
      : document.getElementById("downloadCvEnBtn");
   btn.textContent = "⏳ Δημιουργία PDF...";
   btn.disabled = true;

   try {
      const canvas = await html2canvas(doc, {
         scale: 2,
         useCORS: true,
         allowTaint: true,
         backgroundColor: "#ffffff"
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageW  = pdf.internal.pageSize.getWidth();
      const pageH  = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgW   = pageW - margin * 2;
      const imgH   = (canvas.height * imgW) / canvas.width;

      let y = margin;
      let remainingH = imgH;
      let sourceY = 0;
      const scale = canvas.width / imgW;

      while (remainingH > 0) {
         const sliceH = Math.min(pageH - margin * 2, remainingH);
         const sliceCanvas = document.createElement("canvas");
         sliceCanvas.width  = canvas.width;
         sliceCanvas.height = sliceH * scale;

         const ctx = sliceCanvas.getContext("2d");
         ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceH * scale, 0, 0, canvas.width, sliceH * scale);

         const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
         pdf.addImage(imgData, "JPEG", margin, y, imgW, sliceH);

         remainingH -= sliceH;
         sourceY    += sliceH * scale;

         if (remainingH > 0) { pdf.addPage(); y = margin; }
      }

      const filename = currentLang === "gr" ? "biografiko_gr.pdf" : "curriculum_vitae_en.pdf";
      pdf.save(filename);

   } finally {
      btn.textContent = currentLang === "gr" ? "📄 Download PDF (GR)" : "📄 Download PDF (EN)";
      btn.disabled = false;
   }
}

export function closeCV() {
   document.getElementById("cvPreviewArea").style.display = "none";
   document.getElementById("downloadCvGrBtn").style.display = "none";
   document.getElementById("downloadCvEnBtn").style.display = "none";
   document.getElementById("closeCvBtn").style.display = "none";
}

function loadScript(src) {
   return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
   });
}
