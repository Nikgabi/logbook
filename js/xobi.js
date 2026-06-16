import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ════════════════════════════════════════════════════════
// ΞΕΝΕΣ ΓΛΩΣΣΕΣ
// ════════════════════════════════════════════════════════

const levelBadgeColor = {
   "A1": "bg-secondary", "A2": "bg-secondary",
   "B1": "bg-info text-dark", "B2": "bg-info text-dark",
   "C1": "bg-success", "C2": "bg-success",
   "Native": "bg-primary"
};

export async function saveLanguage() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const name = document.getElementById("langName").value.trim();
   if (!name) { alert("Παρακαλώ συμπληρώστε τη γλώσσα."); return; }

   const file = document.getElementById("langAttachment").files[0] || null;

   await db.languages.add({
      uid:        user.uid,
      name,
      level:      document.getElementById("langLevel").value,
      attachment: file,
      createdAt:  new Date().toISOString()
   });

   alert("Η γλώσσα αποθηκεύτηκε!");
   clearLanguageForm();
   await loadLanguages();
}

export async function loadLanguages() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("languagesList").innerHTML = ""; return; }

   const search = document.getElementById("langSearchInput").value.toLowerCase();
   const items  = await db.languages.where("uid").equals(user.uid).reverse().sortBy("createdAt");

   let html = "";
   for (const item of items) {
      if (!`${item.name} ${item.level}`.toLowerCase().includes(search)) continue;
      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
               <span class="badge ${levelBadgeColor[item.level] || 'bg-secondary'} badge-type me-2">
                  ${item.level || "—"}
               </span>
               <strong>${item.name}</strong>
            </div>
            <div>
               ${item.attachment ? `
               <button onclick="openLanguageAttachment(${item.id})"
                  class="btn btn-sm btn-success me-2">Πιστοποιητικό</button>` : ""}
               <button onclick="deleteLanguage(${item.id})"
                  class="btn btn-sm btn-danger">Διαγραφή</button>
            </div>
         </div>
      </div>`;
   }

   document.getElementById("languagesList").innerHTML =
      html || `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
}

export async function deleteLanguage(id) {
   if (!confirm("Να διαγραφεί η γλώσσα;")) return;
   await db.languages.delete(id);
   await loadLanguages();
}

export async function openLanguageAttachment(id) {
   const item = await db.languages.get(id);
   if (!item?.attachment) { alert("Δεν υπάρχει αρχείο"); return; }
   window.open(URL.createObjectURL(item.attachment));
}

function clearLanguageForm() {
   document.getElementById("langName").value = "";
   document.getElementById("langLevel").selectedIndex = 0;
   document.getElementById("langAttachment").value = "";
}

window.deleteLanguage         = deleteLanguage;
window.openLanguageAttachment = openLanguageAttachment;


// ════════════════════════════════════════════════════════
// ΧΟΜΠΙ
// ════════════════════════════════════════════════════════

const hobbyBadgeColor = {
   "Μουσική":        "bg-warning text-dark",
   "Τέχνες":         "bg-danger",
   "Φωτογραφία":     "bg-dark",
   "Αθλητισμός":     "bg-success",
   "Ταξίδια":        "bg-info text-dark",
   "Προγραμματισμός":"bg-primary",
   "Εθελοντισμός":   "bg-success",
   "Άλλο":           "bg-secondary"
};

export async function saveHobby() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const category = document.getElementById("hobbyCategory").value;
   if (!category) { alert("Παρακαλώ επιλέξτε κατηγορία."); return; }

   await db.hobbies.add({
      uid:         user.uid,
      category,
      description: document.getElementById("hobbyDescription").value.trim(),
      createdAt:   new Date().toISOString()
   });

   alert("Το χόμπι αποθηκεύτηκε!");
   clearHobbyForm();
   await loadHobbies();
}

export async function loadHobbies() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("hobbiesList").innerHTML = ""; return; }

   const search = document.getElementById("hobbySearchInput").value.toLowerCase();
   const items  = await db.hobbies.where("uid").equals(user.uid).reverse().sortBy("createdAt");

   let html = "";
   for (const item of items) {
      if (!`${item.category} ${item.description}`.toLowerCase().includes(search)) continue;
      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">
               <span class="badge ${hobbyBadgeColor[item.category] || 'bg-secondary'} badge-type mb-2">
                  ${item.category}
               </span>
               ${item.description ? `<p class="mb-1 mt-1">${item.description}</p>` : ""}
            </div>
            <button onclick="deleteHobby(${item.id})"
               class="btn btn-sm btn-danger">Διαγραφή</button>
         </div>
      </div>`;
   }

   document.getElementById("hobbiesList").innerHTML =
      html || `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
}

export async function deleteHobby(id) {
   if (!confirm("Να διαγραφεί το χόμπι;")) return;
   await db.hobbies.delete(id);
   await loadHobbies();
}

function clearHobbyForm() {
   document.getElementById("hobbyCategory").selectedIndex = 0;
   document.getElementById("hobbyDescription").value = "";
}

window.deleteHobby = deleteHobby;


// ════════════════════════════════════════════════════════
// ΣΥΛΛΟΓΟΙ - ΕΤΑΙΡΕΙΕΣ
// ════════════════════════════════════════════════════════

const assocBadgeColor = {
   "Ιατρικός Σύλλογος":    "bg-danger",
   "Επιστημονική Εταιρεία":"bg-primary",
   "Ευρωπαϊκή Εταιρεία":  "bg-info text-dark",
   "Διεθνής Εταιρεία":    "bg-success",
   "Άλλο":                 "bg-secondary"
};

export async function saveAssociation() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const name = document.getElementById("assocName").value.trim();
   if (!name) { alert("Παρακαλώ συμπληρώστε το όνομα."); return; }

   await db.associations.add({
      uid:      user.uid,
      name,
      category: document.getElementById("assocCategory").value,
      dateFrom: document.getElementById("assocDateFrom").value,
      dateTo:   document.getElementById("assocDateTo").value,
      current:  document.getElementById("assocCurrent").checked,
      role:     document.getElementById("assocRole").value,
      website:  document.getElementById("assocWebsite").value.trim(),
      createdAt:new Date().toISOString()
   });

   alert("Ο σύλλογος/εταιρεία αποθηκεύτηκε!");
   clearAssociationForm();
   await loadAssociations();
}

export async function loadAssociations() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("associationsList").innerHTML = ""; return; }

   const search = document.getElementById("assocSearchInput").value.toLowerCase();
   const items  = await db.associations.where("uid").equals(user.uid).reverse().sortBy("createdAt");

   let html = "";
   for (const item of items) {
      const combined = `${item.name} ${item.category} ${item.role} ${item.website}`.toLowerCase();
      if (!combined.includes(search)) continue;

      const duration = item.current
         ? `${item.dateFrom || "—"} – Σήμερα`
         : `${item.dateFrom || "—"} – ${item.dateTo || "—"}`;

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">
               <div class="d-flex gap-2 flex-wrap mb-2">
                  <span class="badge ${assocBadgeColor[item.category] || 'bg-secondary'} badge-type">
                     ${item.category || "—"}
                  </span>
                  ${item.current ? '<span class="badge bg-success badge-type">Τρέχον</span>' : ""}
               </div>
               <h5 class="mb-1">${item.name}</h5>
               ${item.role ? `<div class="mb-1"><b>Ρόλος:</b> ${item.role}</div>` : ""}
               <div class="mb-1"><b>Περίοδος:</b> ${duration}</div>
               ${item.website ? `
               <div class="mb-1">
                  <b>Website:</b>
                  <a href="${item.website}" target="_blank">${item.website}</a>
               </div>` : ""}
            </div>
            <button onclick="deleteAssociation(${item.id})"
               class="btn btn-sm btn-danger">Διαγραφή</button>
         </div>
      </div>`;
   }

   document.getElementById("associationsList").innerHTML =
      html || `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
}

export async function deleteAssociation(id) {
   if (!confirm("Να διαγραφεί η εγγραφή;")) return;
   await db.associations.delete(id);
   await loadAssociations();
}

function clearAssociationForm() {
   ["assocName","assocWebsite"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   ["assocCategory","assocRole"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });
   ["assocDateFrom","assocDateTo"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ""; el.disabled = false; }
   });
   document.getElementById("assocCurrent").checked = false;
}

window.deleteAssociation = deleteAssociation;
