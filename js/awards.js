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

const positionIcon = {
   "1ο": "🥇", "2ο": "🥈", "3ο": "🥉",
   "Τιμητικό": "🏅", "Άλλο": "🎖️"
};

// ─── EDIT STATE ──────────────────────────────────────────────────────────────
// Όταν είναι null → νέα εγγραφή (add).
// Όταν έχει id    → επεξεργασία υπάρχουσας (update).
let editingAwardId = null;

// ─── SAVE / UPDATE AWARD ─────────────────────────────────────────────────────
export async function saveAward() {

   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const title = document.getElementById("awardTitle").value.trim();
   if (!title) { alert("Παρακαλώ συμπληρώστε τον τίτλο του βραβείου."); return; }

   const fileInput = document.getElementById("awardAttachment");
   // Αν ο χρήστης επέλεξε νέο αρχείο, χρησιμοποίησέ το.
   // Αλλιώς (σε edit) κράτα το παλιό attachment όπως ήταν.
   let attachment = fileInput.files[0] || null;

   const data = {
      uid:         user.uid,
      title,
      category:    document.getElementById("awardCategory").value,
      organizer:   document.getElementById("awardOrganizer").value.trim(),
      date:        document.getElementById("awardDate").value,
      position:    document.getElementById("awardPosition").value,
      description: document.getElementById("awardDescription").value.trim(),
   };

   if (editingAwardId) {
      // ── UPDATE ──────────────────────────────────────
      if (attachment) data.attachment = attachment;
      // Αν δεν επιλέχθηκε νέο αρχείο, ΔΕΝ αγγίζουμε το attachment (παραμένει το παλιό)
      await db.awards.update(editingAwardId, data);
      alert("Το βραβείο ενημερώθηκε!");
   } else {
      // ── ADD ─────────────────────────────────────────
      data.attachment = attachment;
      data.createdAt  = new Date().toISOString();
      await db.awards.add(data);
      alert("Το βραβείο αποθηκεύτηκε!");
   }

   clearAwardForm();
   await loadAwards();
}

// ─── EDIT AWARD — γεμίζει τη φόρμα ───────────────────────────────────────────
export async function editAward(id) {
   const item = await db.awards.get(id);
   if (!item) return;

   editingAwardId = id;

   document.getElementById("awardTitle").value       = item.title || "";
   document.getElementById("awardOrganizer").value   = item.organizer || "";
   document.getElementById("awardDate").value        = item.date || "";
   document.getElementById("awardDescription").value = item.description || "";
   document.getElementById("awardCategory").value     = item.category || "";
   document.getElementById("awardPosition").value     = item.position || "";
   // Σημείωση: το <input type=file> δεν μπορεί να προσυμπληρωθεί για λόγους ασφαλείας του browser.
   // Το υπάρχον attachment παραμένει όπως είναι, εκτός αν ο χρήστης επιλέξει νέο αρχείο.

   // Αλλαγή του κουμπιού σε λειτουργία "Ενημέρωση"
   const btn = document.getElementById("saveAwardBtn");
   btn.textContent = "Ενημέρωση Βραβείου";
   btn.classList.remove("btn-primary");
   btn.classList.add("btn-warning");

   // Εμφάνιση κουμπιού "Άκυρο" αν δεν υπάρχει already
   showCancelEditButton("award");

   // Scroll στη φόρμα
   document.getElementById("awardsForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── CANCEL EDIT ─────────────────────────────────────────────────────────────
export function cancelEditAward() {
   editingAwardId = null;
   clearAwardForm();
}

// ─── LOAD AWARDS ─────────────────────────────────────────────────────────────
export async function loadAwards() {

   const user = getCurrentUser();
   if (!user) { document.getElementById("awardsList").innerHTML = ""; return; }

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

               ${item.organizer ? `<div class="text-muted mb-1">${item.organizer}</div>` : ""}

               ${item.date ? `<div class="mb-1"><b>Ημερομηνία:</b> ${item.date}</div>` : ""}

               ${item.description ? `<p class="text-muted mt-2 mb-2">${item.description}</p>` : ""}

               <div class="mt-2">
                  ${item.attachment ? `
                  <button onclick="openAwardAttachment(${item.id})"
                     class="btn btn-sm btn-success me-2">
                     Βεβαίωση
                  </button>` : ""}

                  <button onclick="editAward(${item.id})"
                     class="btn btn-sm btn-outline-primary me-2">
                     ✏️ Επεξεργασία
                  </button>

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
   // Αν διαγράφεις την εγγραφή που επεξεργαζόσουν, βγάλε από edit mode
   if (editingAwardId === id) cancelEditAward();
   await loadAwards();
}

// ─── OPEN ATTACHMENT ─────────────────────────────────────────────────────────
export async function openAwardAttachment(id) {
   const item = await db.awards.get(id);
   if (!item || !item.attachment) { alert("Δεν υπάρχει αρχείο"); return; }
   window.open(URL.createObjectURL(item.attachment));
}

// ─── CLEAR FORM (επαναφέρει και το κουμπί στο "Αποθήκευση") ─────────────────
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

   editingAwardId = null;

   const btn = document.getElementById("saveAwardBtn");
   btn.textContent = "Αποθήκευση";
   btn.classList.remove("btn-warning");
   btn.classList.add("btn-primary");

   hideCancelEditButton("award");
}

// ─── ΒΟΗΘΗΤΙΚΕΣ: εμφάνιση/απόκρυψη κουμπιού "Άκυρο Επεξεργασίας" ────────────
// Δημιουργείται δυναμικά δίπλα στο save button, ώστε να μη χρειάζεται
// αλλαγή στο HTML — λειτουργεί άμεσα.
function showCancelEditButton(prefix) {
   const saveBtn = document.getElementById(`save${capitalize(prefix)}Btn`);
   if (!saveBtn) return;
   let cancelBtn = document.getElementById(`cancelEdit${capitalize(prefix)}Btn`);
   if (!cancelBtn) {
      cancelBtn = document.createElement("button");
      cancelBtn.id = `cancelEdit${capitalize(prefix)}Btn`;
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn-outline-secondary mt-2 w-100";
      cancelBtn.textContent = "Άκυρο Επεξεργασίας";
      cancelBtn.onclick = () => window[`cancelEdit${capitalize(prefix)}`]();
      saveBtn.insertAdjacentElement("afterend", cancelBtn);
   }
   cancelBtn.style.display = "block";
}

function hideCancelEditButton(prefix) {
   const cancelBtn = document.getElementById(`cancelEdit${capitalize(prefix)}Btn`);
   if (cancelBtn) cancelBtn.style.display = "none";
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ─── Expose στο window για onclick ───────────────────────────────────────────
window.deleteAward          = deleteAward;
window.openAwardAttachment  = openAwardAttachment;
window.editAward            = editAward;
window.cancelEditAward      = cancelEditAward;
