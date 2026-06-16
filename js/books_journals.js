import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ════════════════════════════════════════════════════════
// ΒΙΒΛΙΑ
// ════════════════════════════════════════════════════════

const bookRoleBadge = {
   "Συγγραφέας":     "bg-primary",
   "Συν-συγγραφέας": "bg-info text-dark",
   "Επιμελητής":     "bg-success",
   "Μεταφραστής":    "bg-warning text-dark",
   "Editor":         "bg-danger",
   "Reviewer":       "bg-secondary"
};

export async function saveBook() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const title = document.getElementById("bookTitle").value.trim();
   if (!title) { alert("Παρακαλώ συμπληρώστε τον τίτλο."); return; }

   await db.books.add({
      uid:       user.uid,
      title,
      publisher: document.getElementById("bookPublisher").value.trim(),
      isbn:      document.getElementById("bookISBN").value.trim(),
      role:      document.getElementById("bookRole").value,
      chapters:  document.getElementById("bookChapters").value.trim(),
      url:       document.getElementById("bookUrl").value.trim(),
      createdAt: new Date().toISOString()
   });

   alert("Το βιβλίο αποθηκεύτηκε!");
   clearBookForm();
   await loadBooks();
}

export async function loadBooks() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("booksList").innerHTML = ""; return; }

   const search = document.getElementById("bookSearchInput").value.toLowerCase();
   const items  = await db.books.where("uid").equals(user.uid).reverse().sortBy("createdAt");

   let html = "";
   for (const item of items) {
      const combined = `${item.title} ${item.publisher} ${item.isbn} ${item.role} ${item.chapters}`.toLowerCase();
      if (!combined.includes(search)) continue;

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <span class="badge ${bookRoleBadge[item.role] || 'bg-secondary'} badge-type mb-2">
                  ${item.role || "—"}
               </span>

               <h5 class="mb-1">${item.title}</h5>

               ${item.publisher ? `<div class="text-muted mb-1">${item.publisher}</div>` : ""}

               ${item.isbn ? `<div class="mb-1"><b>ISBN:</b> ${item.isbn}</div>` : ""}

               ${item.chapters ? `
               <div class="mb-1">
                  <b>Κεφάλαια:</b><br>
                  <span class="text-muted">${item.chapters}</span>
               </div>` : ""}

               ${item.url ? `
               <div class="mb-1">
                  <a href="${item.url}" target="_blank" class="btn btn-sm btn-outline-primary mt-1">
                     🔗 Σύνδεσμος
                  </a>
               </div>` : ""}

               <div class="mt-2">
                  <button onclick="deleteBook(${item.id})"
                     class="btn btn-sm btn-danger">Διαγραφή</button>
               </div>

            </div>
         </div>
      </div>`;
   }

   document.getElementById("booksList").innerHTML =
      html || `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
}

export async function deleteBook(id) {
   if (!confirm("Να διαγραφεί το βιβλίο;")) return;
   await db.books.delete(id);
   await loadBooks();
}

function clearBookForm() {
   ["bookTitle","bookPublisher","bookISBN","bookChapters","bookUrl"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   document.getElementById("bookRole").selectedIndex = 0;
}

window.deleteBook = deleteBook;


// ════════════════════════════════════════════════════════
// ΠΕΡΙΟΔΙΚΑ
// ════════════════════════════════════════════════════════

const journalRoleBadge = {
   "Editor-in-Chief":  "bg-danger",
   "Associate Editor": "bg-primary",
   "Section Editor":   "bg-info text-dark",
   "Reviewer":         "bg-secondary",
   "Editorial Board":  "bg-success",
   "Guest Editor":     "bg-warning text-dark"
};

export async function saveJournal() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   const title = document.getElementById("journalTitle").value.trim();
   if (!title) { alert("Παρακαλώ συμπληρώστε τον τίτλο."); return; }

   await db.journals.add({
      uid:       user.uid,
      title,
      issn:      document.getElementById("journalISSN").value.trim(),
      publisher: document.getElementById("journalPublisher").value.trim(),
      role:      document.getElementById("journalRole").value,
      dateFrom:  document.getElementById("journalDateFrom").value,
      dateTo:    document.getElementById("journalDateTo").value,
      active:    document.getElementById("journalActive").checked,
      website:   document.getElementById("journalWebsite").value.trim(),
      createdAt: new Date().toISOString()
   });

   alert("Το περιοδικό αποθηκεύτηκε!");
   clearJournalForm();
   await loadJournals();
}

export async function loadJournals() {
   const user = getCurrentUser();
   if (!user) { document.getElementById("journalsList").innerHTML = ""; return; }

   const search = document.getElementById("journalSearchInput").value.toLowerCase();
   const items  = await db.journals.where("uid").equals(user.uid).reverse().sortBy("createdAt");

   let html = "";
   for (const item of items) {
      const combined = `${item.title} ${item.issn} ${item.publisher} ${item.role}`.toLowerCase();
      if (!combined.includes(search)) continue;

      const duration = item.active
         ? `${item.dateFrom || "—"} – Ενεργό`
         : `${item.dateFrom || "—"} – ${item.dateTo || "—"}`;

      html += `
      <div class="card border mb-3 p-3">
         <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="flex-grow-1">

               <div class="d-flex gap-2 flex-wrap mb-2">
                  <span class="badge ${journalRoleBadge[item.role] || 'bg-secondary'} badge-type">
                     ${item.role || "—"}
                  </span>
                  ${item.active ? '<span class="badge bg-success badge-type">Ενεργό</span>' : ""}
               </div>

               <h5 class="mb-1">${item.title}</h5>

               ${item.publisher ? `<div class="text-muted mb-1">${item.publisher}</div>` : ""}

               ${item.issn ? `<div class="mb-1"><b>ISSN:</b> ${item.issn}</div>` : ""}

               <div class="mb-1"><b>Περίοδος:</b> ${duration}</div>

               ${item.website ? `
               <div class="mb-1">
                  <a href="${item.website}" target="_blank" class="btn btn-sm btn-outline-primary mt-1">
                     🔗 Website
                  </a>
               </div>` : ""}

               <div class="mt-2">
                  <button onclick="deleteJournal(${item.id})"
                     class="btn btn-sm btn-danger">Διαγραφή</button>
               </div>

            </div>
         </div>
      </div>`;
   }

   document.getElementById("journalsList").innerHTML =
      html || `<div class="alert alert-secondary">Δεν υπάρχουν καταχωρήσεις.</div>`;
}

export async function deleteJournal(id) {
   if (!confirm("Να διαγραφεί το περιοδικό;")) return;
   await db.journals.delete(id);
   await loadJournals();
}

function clearJournalForm() {
   ["journalTitle","journalISSN","journalPublisher","journalWebsite"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
   });
   document.getElementById("journalRole").selectedIndex = 0;
   ["journalDateFrom","journalDateTo"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ""; el.disabled = false; }
   });
   document.getElementById("journalActive").checked = false;
}

window.deleteJournal = deleteJournal;
