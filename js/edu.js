import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ─── Badge χρώμα ανά ρόλο ────────────────────────────────────────────────────
const roleBadgeColor = {
   "Εκπαιδευόμενος":         "bg-secondary",
   "Ομιλητής":               "bg-primary",
   "Διδάσκων":               "bg-info text-dark",
   "Εκπαιδευτής":            "bg-success",
   "Διευθυντής Προγράμματος":"bg-danger",
   "Επιστημονικός Υπεύθυνος":"bg-danger",
   "Συντονιστής":            "bg-warning text-dark",
   "Άλλο":                   "bg-secondary"
};

// ─── Toggle πιστοποιητικού (μόνο για Εκπαιδευόμενο) ─────────────────────────
window.toggleEduAttachment = function(select) {
   const section = document.getElementById("eduAttachmentSection");
   if (section) {
      section.style.display = select.value === "Εκπαιδευόμενος" ? "block" : "none";
   }
};

// ─── SAVE ────────────────────────────────────────────────────────────────────
export async function saveEdu() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const role     = document.getElementById("eduRole").value;
   const activity = document.getElementById("eduActivity").value;
   const title    = document.getElementById("eduTitle").value.trim();

   if (!role || !activity || !title) {
      alert("Παρακαλώ συμπληρώστε Ρόλο, Δραστηριότητα και Τίτλο.");
      return;
   }

   const fileInput = document.getElementById("eduAttachment");
   const file = (role === "Εκπαιδευόμενος" && fileInput.files[0])
      ? fileInput.files[0] : null;

   await db.education.add({
      uid:        user.uid,
      role,
      activity,
      title,
      organizer:  document.getElementById("eduOrganizer").value.trim(),
      location:   document.getElementById("eduLocation").value.trim(),
      dateFrom:   document.getElementById("eduDateFrom").value,
      dateTo:     document.getElementById("eduDateTo").value,
      hours:      parseFloat(document.getElementById("eduHours").value) || 0,
      credits:    parseFloat(document.getElementById("eduCredits").value) || 0,
      attachment: file,
      notes:      document.getElementById("eduNotes").value.trim(),
      createdAt:  new Date().toISOString()
   });

   alert("Η εκπαιδευτική δραστηριότητα αποθηκεύτηκε!");
   clearEduForm();
   await loadEdu();
}

// ─── LOAD ────────────────────────────────────────────────────────────────────
export async function loadEdu() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("eduList").innerHTML = ""; return; }

   const search     = document.getElementById("eduSearchInput").value.toLowerCase();
   const roleFilter = document.getElementById("eduRoleFilter").value;

   let items = await db.education.where("uid").equals(user.uid).reverse().sortBy("createdAt");

   if (roleFilter) items = items.filter(i => i.role === roleFilter);
   if (search)     items = items.filter(i =>
      `${i.role} ${i.activity} ${i.title} ${i.organizer} ${i.location} ${i.notes}`
         .toLowerCase().includes(search)
   );

   // Σύνολα
   const totalHours   = items.reduce((s, i) => s + (i.hours || 0), 0);
   const totalCredits = items.reduce((s, i) => s + (i.credits || 0), 0);

   let html = "";

   if (items.length > 0) {
      html += `
      <div class="d-flex gap-3 mb-3">
         <span class="badge bg-primary">Ώρες: ${totalHours}</span>
         <span class="badge bg-success">Credits: ${totalCredits}</span>
         <span class="badge bg-secondary">Σύνολο: ${items.length}</span>
      </div>`;
   }

   for (const item of items) {

      const duration = (item.dateFrom && item.dateTo && item.dateFrom !== item.dateTo)
         ? `${item.dateFrom} – ${item.dateTo}`
         : item.dateFrom || "—";

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <div class="d-flex gap-2 flex-wrap mb-2">
                  <span class="badge ${roleBadgeColor[item.role] || 'bg-secondary'} badge-type">
                     ${item.role}
                  </span>
                  <span class="badge bg-light text-dark border badge-type">
                     ${item.activity}
                  </span>
               </div>

               <h5 class="mb-1">${item.title}</h5>

               ${item.organizer ? `<div class="text-muted mb-1">${item.organizer}</div>` : ""}

               <div class="mb-1">
                  ${item.location ? `<b>Τόπος:</b> ${item.location} &nbsp;|&nbsp;` : ""}
                  <b>Ημερομηνία:</b> ${duration}
               </div>

               <div class="mb-1 d-flex gap-3 flex-wrap">
                  ${item.hours   ? `<span><b>Ώρες:</b> ${item.hours}</span>` : ""}
                  ${item.credits ? `<span><b>Credits:</b> ${item.credits}</span>` : ""}
               </div>

               ${item.notes ? `<p class="text-muted mt-2 mb-2">${item.notes}</p>` : ""}

               <div class="mt-2">
                  ${item.attachment ? `
                  <button onclick="openEduAttachment(${item.id})"
                     class="btn btn-sm btn-success me-2">
                     Πιστοποιητικό
                  </button>` : ""}
                  <button onclick="deleteEdu(${item.id})"
                     class="btn btn-sm btn-danger">
                     Διαγραφή
                  </button>
               </div>

            </div>
         </div>
      </div>`;
   }

   document.getElementById("eduList").innerHTML =
      html || `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function deleteEdu(id) {
   if (!confirm("Να διαγραφεί η εγγραφή;")) return;
   await db.education.delete(id);
   await loadEdu();
}

// ─── OPEN ATTACHMENT ─────────────────────────────────────────────────────────
export async function openEduAttachment(id) {
   const item = await db.education.get(id);
   if (!item?.attachment) { alert("Δεν υπάρχει αρχείο"); return; }
   window.open(URL.createObjectURL(item.attachment));
}

// ─── CLEAR FORM ──────────────────────────────────────────────────────────────
function clearEduForm() {
   ["eduTitle","eduOrganizer","eduLocation","eduHours","eduCredits","eduNotes"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   ["eduRole","eduActivity"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });
   ["eduDateFrom","eduDateTo","eduAttachment"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   document.getElementById("eduAttachmentSection").style.display = "none";
}

window.deleteEdu          = deleteEdu;
window.openEduAttachment  = openEduAttachment;
