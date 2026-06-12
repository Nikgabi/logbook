import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ─── Labels για εμφάνιση στη λίστα ──────────────────────────────────────────
const typeLabels = {
   watch:         "Παρακολούθηση",
   org_committee: "Οργανωτική Επιτροπή",
   sci_committee: "Επιστημονική Επιτροπή",
   chair:         "Προεδρείο",
   round_table:   "Στρογγυλή Τράπεζα",
   opening_speech:"Εναρκτήρια Ομιλία",
   lecture:       "Διάλεξη",
   announcement:  "Ελεύθερη Ανακοίνωση",
   poster:        "Poster",
   workshop:      "Workshop",
   trainer:       "Εκπαιδευτής"
};

const typeBadgeColor = {
   watch:         "bg-secondary",
   org_committee: "bg-warning text-dark",
   sci_committee: "bg-info text-dark",
   chair:         "bg-primary",
   round_table:   "bg-success",
   opening_speech:"bg-danger",
   lecture:       "bg-primary",
   announcement:  "bg-dark",
   poster:        "bg-secondary",
   workshop:      "bg-warning text-dark",
   trainer:       "bg-success"
};

// ─── Toggle sections στη φόρμα ───────────────────────────────────────────────
window.toggleConfSection = function(sectionId, checkbox) {
   document.getElementById(sectionId).style.display =
      checkbox.checked ? "block" : "none";
};

// ─── Προσθήκη / Αφαίρεση dynamic entries ────────────────────────────────────
const entryTemplates = {
   chair: () => `
      <div class="conf-entry input-group input-group-sm mb-2">
         <span class="input-group-text">Session</span>
         <input type="text" class="form-control" placeholder="Τίτλος session">
         <button type="button" class="btn btn-outline-danger" onclick="removeConfEntry(this)">✕</button>
      </div>`,
   round: () => `
      <div class="conf-entry mb-2">
         <input type="text" class="form-control form-control-sm mb-1" placeholder="Τίτλος στρογγυλής τράπεζας" data-field="title">
         <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="Συμμετέχοντες" data-field="participants">
            <button type="button" class="btn btn-outline-danger" onclick="removeConfEntry(this)">✕</button>
         </div>
      </div>`,
   opening: () => `
      <div class="conf-entry input-group input-group-sm mb-2">
         <input type="text" class="form-control" placeholder="Τίτλος ομιλίας">
         <button type="button" class="btn btn-outline-danger" onclick="removeConfEntry(this)">✕</button>
      </div>`,
   lecture: () => `
      <div class="conf-entry input-group input-group-sm mb-2">
         <input type="text" class="form-control" placeholder="Τίτλος διάλεξης">
         <button type="button" class="btn btn-outline-danger" onclick="removeConfEntry(this)">✕</button>
      </div>`,
   announce: () => `
      <div class="conf-entry mb-2">
         <input type="text" class="form-control form-control-sm mb-1" placeholder="Τίτλος ανακοίνωσης" data-field="title">
         <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="Ονόματα συγγραφέων" data-field="authors">
            <button type="button" class="btn btn-outline-danger" onclick="removeConfEntry(this)">✕</button>
         </div>
      </div>`,
   poster: () => `
      <div class="conf-entry mb-2">
         <input type="text" class="form-control form-control-sm mb-1" placeholder="Τίτλος poster" data-field="title">
         <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="Ονόματα συγγραφέων" data-field="authors">
            <button type="button" class="btn btn-outline-danger" onclick="removeConfEntry(this)">✕</button>
         </div>
      </div>`
};

window.addConfEntry = function(containerId, type) {
   const container = document.getElementById(containerId);
   const div = document.createElement("div");
   div.innerHTML = entryTemplates[type]();
   container.appendChild(div.firstElementChild);
};

window.removeConfEntry = function(btn) {
   btn.closest(".conf-entry").remove();
};

// ─── Βοηθητική: διαβάζει entries ενός container ─────────────────────────────
function readConfEntries(containerId, fields) {
   const container = document.getElementById(containerId);
   if (!container) return [];
   const results = [];
   container.querySelectorAll(".conf-entry").forEach(entry => {
      const obj = {};
      if (fields.length === 1) {
         // input group — παίρνει το πρώτο text input
         const inp = entry.querySelector("input[type=text]");
         obj[fields[0]] = inp ? inp.value.trim() : "";
      } else {
         // πολλαπλά πεδία με data-field
         fields.forEach(f => {
            const inp = entry.querySelector(`[data-field="${f}"]`);
            obj[f] = inp ? inp.value.trim() : "";
         });
      }
      if (Object.values(obj).some(v => v !== "")) results.push(obj);
   });
   return results;
}

// ─── SAVE CONFERENCE ─────────────────────────────────────────────────────────
export async function saveConference() {

   const user = getCurrentUser();
   if (!user) {
      alert("Πρέπει να συνδεθείτε");
      return;
   }

   const title = document.getElementById("confTitle").value.trim();
   if (!title) {
      alert("Παρακαλώ συμπληρώστε τον τίτλο του συνεδρίου.");
      return;
   }

   const fileInput = document.getElementById("confAttachment");
   const file = fileInput.files[0] || null;

   // 1. Αποθήκευση βασικών στοιχείων
   const conferenceId = await db.conferences.add({
      uid:        user.uid,
      title,
      society:    document.getElementById("confSociety").value.trim(),
      city:       document.getElementById("confCity").value.trim(),
      country:    document.getElementById("confCountry").value,
      startDate:  document.getElementById("confDateFrom").value,
      endDate:    document.getElementById("confDateTo").value,
      attachment: file,
      createdAt:  new Date().toISOString()
   });

   // 2. Συλλογή συμμετοχών
   const participations = [];
   const remarks = document.getElementById("confRemarks").value.trim();

   if (document.getElementById("chkWatch").checked)
      participations.push({ type: "watch" });

   if (document.getElementById("chkOrg").checked)
      participations.push({ type: "org_committee", role: document.getElementById("orgRole").value });

   if (document.getElementById("chkSci").checked)
      participations.push({ type: "sci_committee", role: document.getElementById("sciRole").value });

   if (document.getElementById("chkChair").checked)
      readConfEntries("entriesChair", ["title"])
         .forEach(e => participations.push({ type: "chair", title: e.title }));

   if (document.getElementById("chkRound").checked)
      readConfEntries("entriesRound", ["title", "participants"])
         .forEach(e => participations.push({ type: "round_table", title: e.title, participants: e.participants }));

   if (document.getElementById("chkOpening").checked)
      readConfEntries("entriesOpening", ["title"])
         .forEach(e => participations.push({ type: "opening_speech", title: e.title }));

   if (document.getElementById("chkLecture").checked)
      readConfEntries("entriesLecture", ["title"])
         .forEach(e => participations.push({ type: "lecture", title: e.title }));

   if (document.getElementById("chkAnnounce").checked)
      readConfEntries("entriesAnnounce", ["title", "authors"])
         .forEach(e => participations.push({ type: "announcement", title: e.title, authors: e.authors }));

   if (document.getElementById("chkPoster").checked)
      readConfEntries("entriesPoster", ["title", "authors"])
         .forEach(e => participations.push({ type: "poster", title: e.title, authors: e.authors }));

   if (document.getElementById("chkWorkshop").checked)
      participations.push({ type: "workshop", title: document.getElementById("workshopTitle").value.trim() });

   if (document.getElementById("chkTrainer").checked)
      participations.push({ type: "trainer", topic: document.getElementById("trainerTopic").value.trim() });

   // 3. Bulk insert συμμετοχών
   if (participations.length > 0) {
      await db.conference_participations.bulkAdd(
         participations.map(p => ({
            ...p,
            conferenceId,
            uid: user.uid,
            notes: remarks
         }))
      );
   }

   alert("Το συνέδριο αποθηκεύτηκε!");
   clearConferenceForm();
   await loadConferences();
}

// ─── LOAD CONFERENCES ────────────────────────────────────────────────────────
export async function loadConferences() {

   const user = getCurrentUser();
   if (!user) {
      document.getElementById("conferencesList").innerHTML = "";
      return;
   }

   const search = document.getElementById("confSearchInput").value.toLowerCase();

   const conferences = await db.conferences
      .where("uid").equals(user.uid)
      .reverse()
      .sortBy("createdAt");

   let html = "";

   for (const conf of conferences) {

      const combined = `${conf.title} ${conf.society} ${conf.city} ${conf.country}`.toLowerCase();
      if (!combined.includes(search)) continue;

      // Φόρτωση συμμετοχών
      const parts = await db.conference_participations
         .where("conferenceId").equals(conf.id)
         .toArray();

      const badgesHtml = parts.map(p =>
         `<span class="badge ${typeBadgeColor[p.type] || 'bg-secondary'} badge-type me-1 mb-1">
            ${typeLabels[p.type] || p.type}
            ${p.title ? `— ${p.title}` : ""}
            ${p.role  ? `(${p.role})` : ""}
         </span>`
      ).join("");

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div class="flex-grow-1">

               <h5 class="mb-1">${conf.title || "Χωρίς τίτλο"}</h5>

               <div class="text-muted mb-1">${conf.society || ""}</div>

               <div class="mb-1">
                  <b>Τόπος:</b> ${conf.city || "-"}, ${conf.country || ""}
               </div>

               <div class="mb-2">
                  <b>Ημερομηνίες:</b>
                  ${conf.startDate || "-"} – ${conf.endDate || "-"}
               </div>

               <div class="mb-2">${badgesHtml}</div>

               ${conf.attachment ? `
               <button onclick="openConfAttachment(${conf.id})"
                  class="btn btn-sm btn-success me-2">
                  Πιστοποιητικό
               </button>` : ""}

               <button onclick="deleteConference(${conf.id})"
                  class="btn btn-sm btn-danger">
                  Διαγραφή
               </button>

            </div>
         </div>
      </div>`;
   }

   if (html === "") {
      html = `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
   }

   document.getElementById("conferencesList").innerHTML = html;
}

// ─── DELETE CONFERENCE ───────────────────────────────────────────────────────
export async function deleteConference(id) {
   if (!confirm("Να διαγραφεί το συνέδριο;")) return;

   await db.conferences.delete(id);
   // Διαγραφή και των συμμετοχών
   await db.conference_participations
      .where("conferenceId").equals(id)
      .delete();

   await loadConferences();
}

// ─── OPEN ATTACHMENT ─────────────────────────────────────────────────────────
export async function openConfAttachment(id) {
   const item = await db.conferences.get(id);
   if (!item || !item.attachment) {
      alert("Δεν υπάρχει αρχείο");
      return;
   }
   window.open(URL.createObjectURL(item.attachment));
}

// ─── CLEAR FORM ──────────────────────────────────────────────────────────────
function clearConferenceForm() {
   ["confTitle","confSociety","confCity","confRemarks",
    "workshopTitle","trainerTopic"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   ["confCountry","orgRole","sciRole"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
   });
   ["confDateFrom","confDateTo","confAttachment"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   // Uncheck όλα τα checkboxes και κλείσιμο sections
   ["chkWatch","chkOrg","chkSci","chkChair","chkRound",
    "chkOpening","chkLecture","chkAnnounce","chkPoster",
    "chkWorkshop","chkTrainer"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
   });
   ["secOrg","secSci","secChair","secRound","secOpening",
    "secLecture","secAnnounce","secPoster","secWorkshop","secTrainer"]
      .forEach(id => {
         const el = document.getElementById(id);
         if (el) el.style.display = "none";
      });
   // Reset multi-entries — κρατάμε μόνο την πρώτη
   ["entriesChair","entriesRound","entriesOpening",
    "entriesLecture","entriesAnnounce","entriesPoster"].forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;
      const entries = container.querySelectorAll(".conf-entry");
      entries.forEach((e, i) => { if (i > 0) e.remove(); });
      container.querySelectorAll("input[type=text]").forEach(el => el.value = "");
   });
}

// ─── Expose στο window για onclick ──────────────────────────────────────────
window.deleteConference    = deleteConference;
window.openConfAttachment  = openConfAttachment;
