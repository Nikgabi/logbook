import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ════════════════════════════════════════════════════════
// ΒΟΗΘΗΤΙΚΕΣ
// ════════════════════════════════════════════════════════

const roleBadgeProc = {
   "Χειρουργός":  "bg-danger",
   "Α' Βοηθός":  "bg-primary",
   "Β' Βοηθός":  "bg-info text-dark",
   "Εκπαιδευτής":"bg-success"
};

const roleBadgeMed = {
   "Εκτελών":     "bg-danger",
   "Βοηθός":      "bg-primary",
   "Εκπαιδευτής": "bg-success",
   "Παρατηρητής": "bg-secondary"
};

const typeBadge = {
   "Ανοικτό":       "bg-secondary",
   "Λαπαροσκοπικό": "bg-primary",
   "Ενδοσκοπικό":   "bg-info text-dark",
   "Ρομποτικό":     "bg-warning text-dark"
};

// Φόρτωμα jsPDF από CDN
function loadJsPDF() {
   return new Promise((resolve) => {
      if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => resolve(window.jspdf.jsPDF);
      document.head.appendChild(script);
   });
}

// ════════════════════════════════════════════════════════
// ΧΕΙΡΟΥΡΓΕΙΑ
// ════════════════════════════════════════════════════════

export async function saveProcedure() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const hospital   = document.getElementById("procHospital").value.trim();
   const department = document.getElementById("procDepartment").value.trim();
   const role       = document.getElementById("procRole").value;
   const type       = document.getElementById("procType").value;
   const name       = document.getElementById("procName").value.trim();
   const count      = parseInt(document.getElementById("procCount").value) || 0;

   if (!name || !role || !type || count <= 0) {
      alert("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία και έναν θετικό αριθμό.");
      return;
   }

   // Αναζήτηση αν υπάρχει ήδη ο ίδιος συνδυασμός
   const existing = await db.procedures
      .where({ uid: user.uid, hospital, role, type, name })
      .first();

   if (existing) {
      // Άθροισε
      await db.procedures.update(existing.id, { count: existing.count + count });
   } else {
      // Νέα εγγραφή
      await db.procedures.add({
         uid: user.uid, hospital, department, role, type, name, count,
         createdAt: new Date().toISOString()
      });
   }

   clearProcedureForm();
   await loadProcedures();
}

export async function loadProcedures() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("proceduresList").innerHTML = ""; return; }

   const search     = document.getElementById("procSearchInput").value.toLowerCase();
   const roleFilter = document.getElementById("procRoleFilter").value;

   let items = await db.procedures.where("uid").equals(user.uid).toArray();

   // Φίλτρα
   if (roleFilter) items = items.filter(i => i.role === roleFilter);
   if (search)     items = items.filter(i =>
      `${i.name} ${i.hospital} ${i.department} ${i.role} ${i.type}`.toLowerCase().includes(search)
   );

   if (items.length === 0) {
      document.getElementById("proceduresList").innerHTML =
         `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
      return;
   }

   // Ομαδοποίηση ανά ρόλο
   const grouped = {};
   items.forEach(i => {
      if (!grouped[i.role]) grouped[i.role] = [];
      grouped[i.role].push(i);
   });

   let html = "";
   let grandTotal = 0;

   for (const [role, entries] of Object.entries(grouped)) {
      const roleTotal = entries.reduce((s, i) => s + i.count, 0);
      grandTotal += roleTotal;

      html += `
      <div class="mb-3">
         <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge ${roleBadgeProc[role] || 'bg-secondary'} fs-6">${role}</span>
            <span class="fw-bold">Σύνολο: ${roleTotal}</span>
         </div>
         <table class="table table-sm table-bordered mb-0">
            <thead class="table-light">
               <tr>
                  <th>Πράξη</th>
                  <th>Τύπος</th>
                  <th>Νοσοκομείο</th>
                  <th class="text-center">Αρ.</th>
                  <th></th>
               </tr>
            </thead>
            <tbody>`;

      entries.forEach(i => {
         html += `
               <tr>
                  <td>${i.name}</td>
                  <td><span class="badge ${typeBadge[i.type] || 'bg-secondary'} badge-type">${i.type}</span></td>
                  <td><small>${i.hospital}${i.department ? '<br><span class="text-muted">' + i.department + '</span>' : ''}</small></td>
                  <td class="text-center fw-bold">${i.count}</td>
                  <td>
                     <button onclick="deleteProcedure(${i.id})"
                        class="btn btn-sm btn-outline-danger py-0">✕</button>
                  </td>
               </tr>`;
      });

      html += `
            </tbody>
         </table>
      </div>`;
   }

   html += `
   <div class="alert alert-primary d-flex justify-content-between mt-3">
      <strong>Grand Total</strong>
      <strong>${grandTotal} χειρουργεία</strong>
   </div>`;

   document.getElementById("proceduresList").innerHTML = html;
}

export async function deleteProcedure(id) {
   if (!confirm("Να διαγραφεί η εγγραφή;")) return;
   await db.procedures.delete(id);
   await loadProcedures();
}

export async function exportProcedurePdf() {
   const user = getCurrentUser();
   if (!user) return;

   const JsPDF = await loadJsPDF();
   const doc   = new JsPDF();
   const items = await db.procedures.where("uid").equals(user.uid).toArray();

   if (items.length === 0) { alert("Δεν υπάρχουν εγγραφές."); return; }

   // Ομαδοποίηση ανά ρόλο
   const grouped = {};
   items.forEach(i => {
      if (!grouped[i.role]) grouped[i.role] = [];
      grouped[i.role].push(i);
   });

   doc.setFont("helvetica");
   doc.setFontSize(16);
   doc.text("Logariasmos Xeirourgion", 14, 20);
   doc.setFontSize(10);
   doc.text(`Hmerominia: ${new Date().toLocaleDateString("el-GR")}`, 14, 28);

   let y = 38;
   let grandTotal = 0;

   for (const [role, entries] of Object.entries(grouped)) {
      const roleTotal = entries.reduce((s, i) => s + i.count, 0);
      grandTotal += roleTotal;

      // Επικεφαλίδα ρόλου
      doc.setFillColor(52, 58, 64);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.rect(14, y, 182, 7, "F");
      doc.text(`${role}  (Synolo: ${roleTotal})`, 16, y + 5);
      doc.setTextColor(0, 0, 0);
      y += 10;

      // Γραμμές
      doc.setFontSize(9);
      entries.forEach(i => {
         if (y > 270) { doc.addPage(); y = 20; }
         doc.text(i.name.substring(0, 35), 16, y);
         doc.text(i.type, 90, y);
         doc.text(i.hospital.substring(0, 30), 125, y);
         doc.text(String(i.count), 190, y, { align: "right" });
         y += 6;
         doc.setDrawColor(200);
         doc.line(14, y - 1, 196, y - 1);
      });
      y += 5;
   }

   // Grand Total
   doc.setFillColor(13, 110, 253);
   doc.setTextColor(255, 255, 255);
   doc.setFontSize(11);
   doc.rect(14, y, 182, 8, "F");
   doc.text(`Grand Total: ${grandTotal} xeirourgeia`, 16, y + 5.5);

   doc.save("logariasmos_xeirourgion.pdf");
}

function clearProcedureForm() {
   ["procHospital","procDepartment","procName","procCount"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   ["procRole","procType"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });
}

window.deleteProcedure = deleteProcedure;


// ════════════════════════════════════════════════════════
// ΙΑΤΡΙΚΕΣ ΠΡΑΞΕΙΣ
// ════════════════════════════════════════════════════════

export async function saveMedproc() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const hospital   = document.getElementById("mpHospital").value.trim();
   const department = document.getElementById("mpDepartment").value.trim();
   const role       = document.getElementById("mpRole").value;
   const category   = document.getElementById("mpCategory").value;
   const name       = document.getElementById("mpName").value.trim();
   const count      = parseInt(document.getElementById("mpCount").value) || 0;

   if (!name || !role || !category || count <= 0) {
      alert("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία και έναν θετικό αριθμό.");
      return;
   }

   // Αναζήτηση αν υπάρχει ήδη ο ίδιος συνδυασμός
   const existing = await db.medprocedures
      .where({ uid: user.uid, hospital, role, category, name })
      .first();

   if (existing) {
      await db.medprocedures.update(existing.id, { count: existing.count + count });
   } else {
      await db.medprocedures.add({
         uid: user.uid, hospital, department, role, category, name, count,
         createdAt: new Date().toISOString()
      });
   }

   clearMedprocForm();
   await loadMedproc();
}

export async function loadMedproc() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("medprocList").innerHTML = ""; return; }

   const search     = document.getElementById("mpSearchInput").value.toLowerCase();
   const roleFilter = document.getElementById("mpRoleFilter").value;

   let items = await db.medprocedures.where("uid").equals(user.uid).toArray();

   if (roleFilter) items = items.filter(i => i.role === roleFilter);
   if (search)     items = items.filter(i =>
      `${i.name} ${i.hospital} ${i.department} ${i.role} ${i.category}`.toLowerCase().includes(search)
   );

   if (items.length === 0) {
      document.getElementById("medprocList").innerHTML =
         `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
      return;
   }

   // Ομαδοποίηση ανά ρόλο
   const grouped = {};
   items.forEach(i => {
      if (!grouped[i.role]) grouped[i.role] = [];
      grouped[i.role].push(i);
   });

   let html = "";
   let grandTotal = 0;

   for (const [role, entries] of Object.entries(grouped)) {
      const roleTotal = entries.reduce((s, i) => s + i.count, 0);
      grandTotal += roleTotal;

      html += `
      <div class="mb-3">
         <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge ${roleBadgeMed[role] || 'bg-secondary'} fs-6">${role}</span>
            <span class="fw-bold">Σύνολο: ${roleTotal}</span>
         </div>
         <table class="table table-sm table-bordered mb-0">
            <thead class="table-light">
               <tr>
                  <th>Πράξη</th>
                  <th>Κατηγορία</th>
                  <th>Νοσοκομείο</th>
                  <th class="text-center">Αρ.</th>
                  <th></th>
               </tr>
            </thead>
            <tbody>`;

      entries.forEach(i => {
         html += `
               <tr>
                  <td>${i.name}</td>
                  <td><small class="text-muted">${i.category}</small></td>
                  <td><small>${i.hospital}${i.department ? '<br><span class="text-muted">' + i.department + '</span>' : ''}</small></td>
                  <td class="text-center fw-bold">${i.count}</td>
                  <td>
                     <button onclick="deleteMedproc(${i.id})"
                        class="btn btn-sm btn-outline-danger py-0">✕</button>
                  </td>
               </tr>`;
      });

      html += `</tbody></table></div>`;
   }

   html += `
   <div class="alert alert-primary d-flex justify-content-between mt-3">
      <strong>Grand Total</strong>
      <strong>${grandTotal} πράξεις</strong>
   </div>`;

   document.getElementById("medprocList").innerHTML = html;
}

export async function deleteMedproc(id) {
   if (!confirm("Να διαγραφεί η εγγραφή;")) return;
   await db.medprocedures.delete(id);
   await loadMedproc();
}

export async function exportMedprocPdf() {
   const user = getCurrentUser();
   if (!user) return;

   const JsPDF = await loadJsPDF();
   const doc   = new JsPDF();
   const items = await db.medprocedures.where("uid").equals(user.uid).toArray();

   if (items.length === 0) { alert("Δεν υπάρχουν εγγραφές."); return; }

   const grouped = {};
   items.forEach(i => {
      if (!grouped[i.role]) grouped[i.role] = [];
      grouped[i.role].push(i);
   });

   doc.setFont("helvetica");
   doc.setFontSize(16);
   doc.text("Logariasmos Iatrikon Praxeon", 14, 20);
   doc.setFontSize(10);
   doc.text(`Hmerominia: ${new Date().toLocaleDateString("el-GR")}`, 14, 28);

   let y = 38;
   let grandTotal = 0;

   for (const [role, entries] of Object.entries(grouped)) {
      const roleTotal = entries.reduce((s, i) => s + i.count, 0);
      grandTotal += roleTotal;

      doc.setFillColor(52, 58, 64);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.rect(14, y, 182, 7, "F");
      doc.text(`${role}  (Synolo: ${roleTotal})`, 16, y + 5);
      doc.setTextColor(0, 0, 0);
      y += 10;

      doc.setFontSize(9);
      entries.forEach(i => {
         if (y > 270) { doc.addPage(); y = 20; }
         doc.text(i.name.substring(0, 35), 16, y);
         doc.text(i.category, 90, y);
         doc.text(i.hospital.substring(0, 30), 130, y);
         doc.text(String(i.count), 190, y, { align: "right" });
         y += 6;
         doc.setDrawColor(200);
         doc.line(14, y - 1, 196, y - 1);
      });
      y += 5;
   }

   doc.setFillColor(13, 110, 253);
   doc.setTextColor(255, 255, 255);
   doc.setFontSize(11);
   doc.rect(14, y, 182, 8, "F");
   doc.text(`Grand Total: ${grandTotal} praxeis`, 16, y + 5.5);

   doc.save("logariasmos_iatrikon_praxeon.pdf");
}

function clearMedprocForm() {
   ["mpHospital","mpDepartment","mpName","mpCount"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   ["mpRole","mpCategory"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });
}

window.deleteMedproc = deleteMedproc;
