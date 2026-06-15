import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ─── Badge χρώμα ανά κατηγορία ──────────────────────────────────────────────
const categoryBadgeColor = {
   "Επιστημονικό":       "bg-primary",
   "Ερευνητικό":         "bg-success",
   "Εκπαιδευτικό":       "bg-info text-dark",
   "Καλύτερη εργασία":   "bg-warning text-dark",
   "Poster":             "bg-secondary",
   "Διάλεξη":            "bg-primary",
   "Υποτροφία":          "bg-success",
   "Τιμητική διάκριση":  "bg-danger",
   "Άλλο":               "bg-secondary"
};

// ─── Εικονίδιο ανά θέση ─────────────────────────────────────────────────────
const positionIcon = {
   "1ο": "🥇",
   "2ο": "🥈",
   "3ο": "🥉",
   "Τιμητικό": "🏅",
   "Άλλο": "🎖️"
};

// ─── SAVE AWARD ──────────────────────────────────────────────────────────────
export async function saveAward() {

   const user = getCurrentUser();
   if (!user) {
      alert("Πρέπει να συνδεθείτε");
      return;
   }

   const title = document.getElementById("awardTitle").value.trim();
   if (!title) {
      alert("Παρακαλώ συμπληρώστε τον τίτλο του βραβείου.");
      return;
   }

   const fileInput = document.getElementById("awardAttachment");
   const file = fileInput.files[0] || null;

   await db.awards.add({
      uid:         user.uid,
      title,
      category:    document.getElementById("awardCategory").value,
      organizer:   document.getElementById("awardOrganizer").value.trim(),
      date:        document.getElementById("awardDate").value,
      position:    document.getElementById("awardPosition").value,
      description: document.getElementById("awardDescription").value.trim(),
      attachment:  file,
      createdAt:   new Date().toISOString()
   });

   alert("Το βραβείο αποθηκεύτηκε!");
   clearAwardForm();
   await loadAwards();
}

// ─── LOAD AWARDS ─────────────────────────────────────────────────────────────
export async function loadAwards() {

   const user = getCurrentUser();
   if (!user) {
      document.getElementById("awardsList").innerHTML = "";
      return;
   }

   const search = document.getElementById("awardSearchInput").value.toLowerCase();

   const items = await db.awards
      .where("uid").equals(user.uid)
      .reverse()
      .sortBy("createdAt");

   let html = "";

   for (const item of items) {

      const combined = `
         ${item.title} ${item.category} ${item.organizer}
         ${item.position} ${item.description}
      `.toLowerCase();

      if (!combined.includes(search)) continue;

      const icon = positionIcon[item.position] || "🎖️";

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span class="badge ${categoryBadgeColor[item.category] || 'bg-secondary'} badge-type">
                     ${item.category || "—"}
                  </span>
                  ${item.position ? `
                  <span class="badge bg-light text-dark border badge-type">
                     ${icon} ${item.position} Βραβείο
                  </span>` : ""}
               </div>

               <h5 class="mb-1">${item.title}</h5>

               ${item.organizer ? `
               <div class="text-muted mb-1">${item.organizer}</div>` : ""}

               ${item.date ? `
               <div class="mb-1">
                  <b>Ημερομηνία:</b> ${item.date}
               </div>` : ""}

               ${item.description ? `
               <p class="text-muted mt-2 mb-2">${item.description}</p>` : ""}

               <div class="mt-2">
                  ${item.attachment ? `
                  <button onclick="openAwardAttachment(${item.id})"
                     class="btn btn-sm btn-success me-2">
                     Βεβαίωση
                  </button>` : ""}

                  <button onclick="deleteAward(${item.id})"
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

   document.getElementById("awardsList").innerHTML = html;
}

// ─── DELETE AWARD ────────────────────────────────────────────────────────────
export async function deleteAward(id) {
   if (!confirm("Να διαγραφεί το βραβείο;")) return;
   await db.awards.delete(id);
   await loadAwards();
}

// ─── OPEN ATTACHMENT ─────────────────────────────────────────────────────────
export async function openAwardAttachment(id) {
   const item = await db.awards.get(id);
   if (!item || !item.attachment) {
      alert("Δεν υπάρχει αρχείο");
      return;
   }
   window.open(URL.createObjectURL(item.attachment));
}

// ─── CLEAR FORM ──────────────────────────────────────────────────────────────
function clearAwardForm() {
   ["awardTitle","awardOrganizer","awardDescription"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });

   ["awardCategory","awardPosition"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });

   ["awardDate","awardAttachment"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
}

// ─── Expose στο window για onclick ───────────────────────────────────────────
window.deleteAward          = deleteAward;
window.openAwardAttachment  = openAwardAttachment;
