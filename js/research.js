import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ─── SAVE RESEARCH ───────────────────────────────────────────────────────────
export async function saveResearch() {

   const user = getCurrentUser();
   if (!user) {
      alert("Πρέπει να συνδεθείτε");
      return;
   }

   const title = document.getElementById("resTitle").value.trim();
   if (!title) {
      alert("Παρακαλώ συμπληρώστε τον τίτλο του ερευνητικού προγράμματος.");
      return;
   }

   // Συλλογή έως 3 αρχείων
   const files = [];
   for (let i = 1; i <= 3; i++) {
      const input = document.getElementById(`resAttachment${i}`);
      if (input && input.files[0]) files.push(input.files[0]);
   }

   await db.research.add({
      uid:              user.uid,
      title,
      subject:          document.getElementById("resSubject").value.trim(),
      funding:          document.getElementById("resFunding").value.trim(),
      institution:      document.getElementById("resInstitution").value.trim(),
      country:          document.getElementById("resCountry").value,
      dateFrom:         document.getElementById("resDateFrom").value,
      dateTo:           document.getElementById("resDateTo").value,
      ongoing:          document.getElementById("resOngoing").checked,
      role:             document.getElementById("resRole").value,
      protocol:         document.getElementById("resProtocol").value.trim(),
      studyCode:        document.getElementById("resStudyCode").value.trim(),
      clinicalTrialsId: document.getElementById("resClinicalTrialsId").value.trim(),
      description:      document.getElementById("resDescription").value.trim(),
      attachments:      files,      // πίνακας File objects (έως 3)
      createdAt:        new Date().toISOString()
   });

   alert("Το ερευνητικό πρόγραμμα αποθηκεύτηκε!");
   clearResearchForm();
   await loadResearch();
}

// ─── LOAD RESEARCH ───────────────────────────────────────────────────────────
export async function loadResearch() {

   const user = getCurrentUser();
   if (!user) {
      document.getElementById("researchList").innerHTML = "";
      return;
   }

   const search = document.getElementById("resSearchInput").value.toLowerCase();

   const items = await db.research
      .where("uid").equals(user.uid)
      .reverse()
      .sortBy("createdAt");

   let html = "";

   for (const item of items) {

      const combined = `
         ${item.title} ${item.subject} ${item.funding}
         ${item.institution} ${item.role} ${item.protocol}
         ${item.studyCode} ${item.clinicalTrialsId} ${item.description}
      `.toLowerCase();

      if (!combined.includes(search)) continue;

      // Εμφάνιση διάρκειας
      const duration = item.ongoing
         ? `${item.dateFrom || "-"} – Συνεχίζεται`
         : `${item.dateFrom || "-"} – ${item.dateTo || "-"}`;

      // Κουμπιά συνημμένων
      let attachBtns = "";
      if (item.attachments && item.attachments.length > 0) {
         item.attachments.forEach((_, idx) => {
            attachBtns += `
            <button onclick="openResearchAttachment(${item.id}, ${idx})"
               class="btn btn-sm btn-success me-1 mb-1">
               Αρχείο ${idx + 1}
            </button>`;
         });
      }

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <span class="badge bg-primary badge-type mb-2">${item.role || "—"}</span>

               <h5 class="mb-1">${item.title || "Χωρίς τίτλο"}</h5>

               <div class="text-muted mb-1">${item.subject || ""}</div>

               <div class="mb-1">
                  <b>Φορέας:</b> ${item.funding || "—"}
               </div>
               <div class="mb-1">
                  <b>Ίδρυμα:</b> ${item.institution || "—"} &nbsp;|&nbsp;
                  <b>Χώρα:</b> ${item.country || "—"}
               </div>
               <div class="mb-1">
                  <b>Διάρκεια:</b> ${duration}
               </div>

               ${item.protocol ? `<div class="mb-1"><b>Αρ. Πρωτοκόλλου:</b> ${item.protocol}</div>` : ""}
               ${item.studyCode ? `<div class="mb-1"><b>Κωδικός:</b> ${item.studyCode}</div>` : ""}
               ${item.clinicalTrialsId ? `
               <div class="mb-1">
                  <b>ClinicalTrials.gov:</b>
                  <a href="https://clinicaltrials.gov/study/${item.clinicalTrialsId}"
                     target="_blank">${item.clinicalTrialsId}</a>
               </div>` : ""}

               ${item.description ? `<p class="mt-2 mb-2 text-muted">${item.description}</p>` : ""}

               <div class="mt-2">
                  ${attachBtns}
                  <button onclick="deleteResearch(${item.id})"
                     class="btn btn-sm btn-danger mb-1">
                     Διαγραφή
                  </button>
               </div>

            </div>
         </div>
      </div>`;
   }

   if (html === "") {
      html = `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
   }

   document.getElementById("researchList").innerHTML = html;
}

// ─── DELETE RESEARCH ─────────────────────────────────────────────────────────
export async function deleteResearch(id) {
   if (!confirm("Να διαγραφεί η καταχώρηση;")) return;
   await db.research.delete(id);
   await loadResearch();
}

// ─── OPEN ATTACHMENT ─────────────────────────────────────────────────────────
export async function openResearchAttachment(id, idx) {
   const item = await db.research.get(id);
   if (!item || !item.attachments || !item.attachments[idx]) {
      alert("Δεν υπάρχει αρχείο");
      return;
   }
   window.open(URL.createObjectURL(item.attachments[idx]));
}

// ─── CLEAR FORM ──────────────────────────────────────────────────────────────
function clearResearchForm() {
   ["resTitle","resSubject","resFunding","resInstitution",
    "resProtocol","resStudyCode","resClinicalTrialsId","resDescription"]
      .forEach(id => {
         const el = document.getElementById(id);
         if (el) el.value = "";
      });

   ["resCountry","resRole"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });

   ["resDateFrom","resDateTo"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ""; el.disabled = false; }
   });

   document.getElementById("resOngoing").checked = false;

   for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`resAttachment${i}`);
      if (el) el.value = "";
   }
}

// ─── Expose στο window για onclick ───────────────────────────────────────────
window.deleteResearch          = deleteResearch;
window.openResearchAttachment  = openResearchAttachment;
