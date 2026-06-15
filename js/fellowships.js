import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ─── Badge χρώμα ανά είδος ───────────────────────────────────────────────────
const typeBadgeColor = {
   "Clinical Fellowship":  "bg-primary",
   "Research Fellowship":  "bg-success",
   "Observer":             "bg-info text-dark",
   "Visiting Physician":   "bg-warning text-dark",
   "Άλλο":                 "bg-secondary"
};

// ─── SAVE FELLOWSHIP ─────────────────────────────────────────────────────────
export async function saveFellowship() {

   const user = getCurrentUser();
   if (!user) {
      alert("Πρέπει να συνδεθείτε");
      return;
   }

   const subject = document.getElementById("felSubject").value.trim();
   if (!subject) {
      alert("Παρακαλώ συμπληρώστε το αντικείμενο μετεκπαίδευσης.");
      return;
   }

   const fileInput = document.getElementById("felAttachment");
   const file = fileInput.files[0] || null;

   await db.fellowships.add({
      uid:         user.uid,
      subject,
      institution: document.getElementById("felInstitution").value.trim(),
      department:  document.getElementById("felDepartment").value.trim(),
      city:        document.getElementById("felCity").value.trim(),
      country:     document.getElementById("felCountry").value,
      dateFrom:    document.getElementById("felDateFrom").value,
      dateTo:      document.getElementById("felDateTo").value,
      type:        document.getElementById("felType").value,
      supervisor:  document.getElementById("felSupervisor").value.trim(),
      description: document.getElementById("felDescription").value.trim(),
      attachment:  file,
      createdAt:   new Date().toISOString()
   });

   alert("Η μετεκπαίδευση αποθηκεύτηκε!");
   clearFellowshipForm();
   await loadFellowships();
}

// ─── LOAD FELLOWSHIPS ────────────────────────────────────────────────────────
export async function loadFellowships() {

   const user = getCurrentUser();
   if (!user) {
      document.getElementById("fellowshipsList").innerHTML = "";
      return;
   }

   const search = document.getElementById("felSearchInput").value.toLowerCase();

   const items = await db.fellowships
      .where("uid").equals(user.uid)
      .reverse()
      .sortBy("createdAt");

   let html = "";

   for (const item of items) {

      const combined = `
         ${item.subject} ${item.institution} ${item.department}
         ${item.city} ${item.country} ${item.type}
         ${item.supervisor} ${item.description}
      `.toLowerCase();

      if (!combined.includes(search)) continue;

      // Υπολογισμός διάρκειας σε μήνες
      let durationStr = "";
      if (item.dateFrom && item.dateTo) {
         const from = new Date(item.dateFrom);
         const to   = new Date(item.dateTo);
         const months = Math.round((to - from) / (1000 * 60 * 60 * 24 * 30.44));
         if (months > 0) durationStr = ` <span class="text-muted">(${months} μήνες)</span>`;
      }

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <span class="badge ${typeBadgeColor[item.type] || 'bg-secondary'} badge-type mb-2">
                  ${item.type || "—"}
               </span>

               <h5 class="mb-1">${item.subject}</h5>

               <div class="mb-1">
                  <b>${item.institution || "—"}</b>
                  ${item.department ? ` &nbsp;|&nbsp; ${item.department}` : ""}
               </div>

               <div class="mb-1">
                  <b>Τοποθεσία:</b> ${item.city || "—"}, ${item.country || "—"}
               </div>

               <div class="mb-1">
                  <b>Διάρκεια:</b> ${item.dateFrom || "—"} – ${item.dateTo || "—"}
                  ${durationStr}
               </div>

               ${item.supervisor ? `
               <div class="mb-1">
                  <b>Υπεύθυνος:</b> ${item.supervisor}
               </div>` : ""}

               ${item.description ? `
               <p class="text-muted mt-2 mb-2">${item.description}</p>` : ""}

               <div class="mt-2">
                  ${item.attachment ? `
                  <button onclick="openFellowshipAttachment(${item.id})"
                     class="btn btn-sm btn-success me-2">
                     Βεβαίωση
                  </button>` : ""}

                  <button onclick="deleteFellowship(${item.id})"
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

   document.getElementById("fellowshipsList").innerHTML = html;
}

// ─── DELETE FELLOWSHIP ───────────────────────────────────────────────────────
export async function deleteFellowship(id) {
   if (!confirm("Να διαγραφεί η μετεκπαίδευση;")) return;
   await db.fellowships.delete(id);
   await loadFellowships();
}

// ─── OPEN ATTACHMENT ─────────────────────────────────────────────────────────
export async function openFellowshipAttachment(id) {
   const item = await db.fellowships.get(id);
   if (!item || !item.attachment) {
      alert("Δεν υπάρχει αρχείο");
      return;
   }
   window.open(URL.createObjectURL(item.attachment));
}

// ─── CLEAR FORM ──────────────────────────────────────────────────────────────
function clearFellowshipForm() {
   ["felSubject","felInstitution","felDepartment",
    "felCity","felSupervisor","felDescription"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });

   ["felCountry","felType"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });

   ["felDateFrom","felDateTo","felAttachment"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
}

// ─── Expose στο window για onclick ───────────────────────────────────────────
window.deleteFellowship           = deleteFellowship;
window.openFellowshipAttachment   = openFellowshipAttachment;
