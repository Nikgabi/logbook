import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ─── Badge χρώμα ανά είδος ───────────────────────────────────────────────────
const typeBadgeColor = {
   "Δια ζώσης": "bg-primary",
   "Online":    "bg-info text-dark",
   "Hybrid":    "bg-warning text-dark"
};

// ─── SAVE SEMINAR ────────────────────────────────────────────────────────────
export async function saveSeminar() {

   const user = getCurrentUser();
   if (!user) {
      alert("Πρέπει να συνδεθείτε");
      return;
   }

   const title = document.getElementById("semTitle").value.trim();
   if (!title) {
      alert("Παρακαλώ συμπληρώστε τον τίτλο του σεμιναρίου.");
      return;
   }

   // Τουλάχιστον ένας ρόλος
   const attendee = document.getElementById("semAttendee").checked;
   const trainer  = document.getElementById("semTrainer").checked;
   const speaker  = document.getElementById("semSpeaker").checked;

   if (!attendee && !trainer && !speaker) {
      alert("Παρακαλώ επιλέξτε τουλάχιστον έναν ρόλο συμμετοχής.");
      return;
   }

   const fileInput = document.getElementById("semAttachment");
   const file = fileInput.files[0] || null;

   await db.seminars.add({
      uid:         user.uid,
      title,
      organizer:   document.getElementById("semOrganizer").value.trim(),
      type:        document.getElementById("semType").value,
      dateFrom:    document.getElementById("semDateFrom").value,
      dateTo:      document.getElementById("semDateTo").value,
      credits:     parseFloat(document.getElementById("semCredits").value) || 0,
      attendee,
      trainer,
      speaker,
      description: document.getElementById("semDescription").value.trim(),
      attachment:  file,
      createdAt:   new Date().toISOString()
   });

   alert("Το σεμινάριο αποθηκεύτηκε!");
   clearSeminarForm();
   await loadSeminars();
}

// ─── LOAD SEMINARS ───────────────────────────────────────────────────────────
export async function loadSeminars() {

   const user = getCurrentUser();
   if (!user) {
      document.getElementById("seminarsList").innerHTML = "";
      return;
   }

   const search = document.getElementById("semSearchInput").value.toLowerCase();

   const items = await db.seminars
      .where("uid").equals(user.uid)
      .reverse()
      .sortBy("createdAt");

   let html = "";

   for (const item of items) {

      const combined = `
         ${item.title} ${item.organizer} ${item.type} ${item.description}
      `.toLowerCase();

      if (!combined.includes(search)) continue;

      // Ρόλοι ως badges
      const roles = [];
      if (item.attendee) roles.push('<span class="badge bg-secondary badge-type me-1">Παρακολούθηση</span>');
      if (item.trainer)  roles.push('<span class="badge bg-success  badge-type me-1">Εκπαιδευτής</span>');
      if (item.speaker)  roles.push('<span class="badge bg-danger   badge-type me-1">Ομιλητής</span>');

      // Διάρκεια
      const duration = (item.dateFrom && item.dateTo && item.dateFrom !== item.dateTo)
         ? `${item.dateFrom} – ${item.dateTo}`
         : item.dateFrom || "—";

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <span class="badge ${typeBadgeColor[item.type] || 'bg-secondary'} badge-type mb-2">
                  ${item.type || "—"}
               </span>

               <h5 class="mb-1">${item.title}</h5>

               <div class="text-muted mb-1">${item.organizer || ""}</div>

               <div class="mb-1">
                  <b>Ημερομηνία:</b> ${duration}
               </div>

               ${item.credits ? `
               <div class="mb-1">
                  <b>Credits:</b> ${item.credits}
               </div>` : ""}

               <div class="mb-2">${roles.join("")}</div>

               ${item.description ? `
               <p class="text-muted mb-2">${item.description}</p>` : ""}

               <div class="mt-2">
                  ${item.attachment ? `
                  <button onclick="openSeminarAttachment(${item.id})"
                     class="btn btn-sm btn-success me-2">
                     Πιστοποιητικό
                  </button>` : ""}

                  <button onclick="deleteSeminar(${item.id})"
                     class="btn btn-sm btn-danger">
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

   document.getElementById("seminarsList").innerHTML = html;
}

// ─── DELETE SEMINAR ──────────────────────────────────────────────────────────
export async function deleteSeminar(id) {
   if (!confirm("Να διαγραφεί το σεμινάριο;")) return;
   await db.seminars.delete(id);
   await loadSeminars();
}

// ─── OPEN ATTACHMENT ─────────────────────────────────────────────────────────
export async function openSeminarAttachment(id) {
   const item = await db.seminars.get(id);
   if (!item || !item.attachment) {
      alert("Δεν υπάρχει αρχείο");
      return;
   }
   window.open(URL.createObjectURL(item.attachment));
}

// ─── CLEAR FORM ──────────────────────────────────────────────────────────────
function clearSeminarForm() {
   ["semTitle","semOrganizer","semCredits","semDescription"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });

   ["semType"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });

   ["semDateFrom","semDateTo","semAttachment"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });

   ["semAttendee","semTrainer","semSpeaker"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
   });
}

// ─── Expose στο window για onclick ───────────────────────────────────────────
window.deleteSeminar          = deleteSeminar;
window.openSeminarAttachment  = openSeminarAttachment;
