import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

const roleBadgeColor = {
   "Προϊστάμενος Τμήματος":                      "bg-primary",
   "Διευθυντής Ιατρικής Υπηρεσίας":              "bg-danger",
   "Διευθυντής Τομέα":                            "bg-danger",
   "Πρόεδρος Επιστημονικού Συμβουλίου":          "bg-success",
   "Μέλος Επιστημονικού Συμβουλίου":             "bg-success",
   "Πρόεδρος Επιτρ. Νοσοκομειακών Λοιμώξεων":   "bg-warning text-dark",
   "Μέλος Επιτρ. Νοσοκομειακών Λοιμώξεων":      "bg-warning text-dark",
   "Εκπρόσωπος Γιατρών στο ΔΣ Νοσοκομείου":     "bg-info text-dark",
   "Πρόεδρος / Μέλος Συνδικαλιστικού":           "bg-secondary",
   "Πρόεδρος / Μέλος Επιτροπής Εξετάσεων":      "bg-primary",
   "Πρόεδρος / Μέλος Επιτροπής":                 "bg-secondary",
   "Άλλο":                                        "bg-secondary"
};

// ─── SAVE ────────────────────────────────────────────────────────────────────
export async function saveAdmin() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const role = document.getElementById("adminRole").value;
   if (!role) { alert("Παρακαλώ επιλέξτε ρόλο."); return; }

   await db.administration.add({
      uid:         user.uid,
      role,
      institution: document.getElementById("adminInstitution").value.trim(),
      dateFrom:    document.getElementById("adminDateFrom").value,
      dateTo:      document.getElementById("adminDateTo").value,
      current:     document.getElementById("adminCurrent").checked,
      info:        document.getElementById("adminInfo").value.trim(),
      createdAt:   new Date().toISOString()
   });

   alert("Η διοικητική θέση αποθηκεύτηκε!");
   clearAdminForm();
   await loadAdmin();
}

// ─── LOAD ────────────────────────────────────────────────────────────────────
export async function loadAdmin() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("adminList").innerHTML = ""; return; }

   const search = document.getElementById("adminSearchInput").value.toLowerCase();
   const items  = await db.administration.where("uid").equals(user.uid).reverse().sortBy("createdAt");

   let html = "";
   for (const item of items) {
      const combined = `${item.role} ${item.institution} ${item.info}`.toLowerCase();
      if (!combined.includes(search)) continue;

      const duration = item.current
         ? `${item.dateFrom || "—"} – Τρέχουσα`
         : `${item.dateFrom || "—"} – ${item.dateTo || "—"}`;

      // Υπολογισμός διάρκειας σε μήνες
      let durationStr = "";
      if (item.dateFrom) {
         const from = new Date(item.dateFrom);
         const to   = item.current ? new Date() : (item.dateTo ? new Date(item.dateTo) : null);
         if (to) {
            const months = Math.round((to - from) / (1000 * 60 * 60 * 24 * 30.44));
            if (months > 0) durationStr = ` <span class="text-muted">(${months} μήνες)</span>`;
         }
      }

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <div class="d-flex gap-2 flex-wrap mb-2">
                  <span class="badge ${roleBadgeColor[item.role] || 'bg-secondary'} badge-type">
                     ${item.role}
                  </span>
                  ${item.current ? '<span class="badge bg-success badge-type">Τρέχουσα</span>' : ""}
               </div>

               ${item.institution ? `<h5 class="mb-1">${item.institution}</h5>` : ""}

               <div class="mb-1">
                  <b>Περίοδος:</b> ${duration} ${durationStr}
               </div>

               ${item.info ? `<p class="text-muted mt-2 mb-2">${item.info}</p>` : ""}

               <div class="mt-2">
                  <button onclick="deleteAdmin(${item.id})"
                     class="btn btn-sm btn-danger">Διαγραφή</button>
               </div>

            </div>
         </div>
      </div>`;
   }

   document.getElementById("adminList").innerHTML =
      html || `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function deleteAdmin(id) {
   if (!confirm("Να διαγραφεί η διοικητική θέση;")) return;
   await db.administration.delete(id);
   await loadAdmin();
}

// ─── CLEAR ───────────────────────────────────────────────────────────────────
function clearAdminForm() {
   document.getElementById("adminRole").selectedIndex = 0;
   document.getElementById("adminInstitution").value = "";
   document.getElementById("adminInfo").value = "";
   ["adminDateFrom","adminDateTo"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ""; el.disabled = false; }
   });
   document.getElementById("adminCurrent").checked = false;
}

window.deleteAdmin = deleteAdmin;
