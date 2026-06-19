console.log("APP LOADED");

import { login, logout, initAuth, getCurrentUser } from "./auth.js";
import { clearForm, showUser } from "./ui.js";
import { saveCredentials, loadCredentials, deleteCredentials, openAttachment } from "./credentials.js";
import { db } from "./db.js";
import { saveJob, loadJobs } from "./jobs.js";
import { savePublications, loadPublications, deletePublications, openPublic_Attachment } from "./publications.js";
import { saveConference, loadConferences } from "./conferences.js";
import { saveResearch, loadResearch } from "./research.js";
import { saveSeminar, loadSeminars } from "./seminars.js";
import { saveFellowship, loadFellowships } from "./fellowships.js";
import { saveAward, loadAwards } from "./awards.js";
import { saveLanguage, loadLanguages, saveHobby, loadHobbies, saveAssociation, loadAssociations } from "./xobi.js";
import { saveBook, loadBooks, saveJournal, loadJournals } from "./books_journals.js";
import { saveAdmin, loadAdmin } from "./admin.js";
import { saveProcedure, loadProcedures, exportProcedurePdf, saveMedproc, loadMedproc, exportMedprocPdf } from "./procedures.js";
import { saveProfile, loadProfile } from "./profile.js";
import { saveEdu, loadEdu } from "./edu.js";
import { previewCV, downloadCV, closeCV } from "./cv.js";

initAuth(async user => {

   const spinner = document.getElementById("loadingSpinner");
   if (spinner) spinner.style.display = "none";

   showUser(user);

   const formIds = [
      "formCard", "formPublications", "jobForm",
      "conferenceForm", "researchForm", "seminarForm",
      "fellowshipForm", "awardsForm",
      "languageForm", "hobbyForm", "associationForm",
      "bookForm", "journalForm", "adminForm",
      "procedureForm", "medprocForm",
      "profileForm", "eduForm"
   ];

   formIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = user ? "block" : "none";
   });

   try {
      if (user) {
         await loadProfile();
         await loadCredentials();
         await loadJobs();
         await loadPublications();
         await loadConferences();
         await loadResearch();
         await loadSeminars();
         await loadFellowships();
         await loadAwards();
         await loadLanguages();
         await loadHobbies();
         await loadAssociations();
         await loadBooks();
         await loadJournals();
         await loadAdmin();
         await loadProcedures();
         await loadMedproc();
         await loadEdu();
      }
   } catch(err) {
      console.error("❌ Error:", err);
   } finally {
      const tabContent = document.getElementById("mainTabContent");
      if (tabContent) tabContent.style.visibility = "visible";
   }
});

// Εγγραφή του Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('✅ Service Worker registered successfully'))
    .catch(error => console.log('❌ Service Worker registration failed:', error));
}

document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("saveCredentials").addEventListener("click", saveCredentials);
document.getElementById("searchInput").addEventListener("keyup", loadCredentials);
document.getElementById("saveJobBtn").addEventListener("click", saveJob);
document.getElementById("savePublications").addEventListener("click", savePublications);
document.getElementById("saveConferenceBtn").addEventListener("click", saveConference);
document.getElementById("confSearchInput").addEventListener("keyup", loadConferences);
document.getElementById("saveResearchBtn").addEventListener("click", saveResearch);
document.getElementById("resSearchInput").addEventListener("keyup", loadResearch);
document.getElementById("saveSeminarBtn").addEventListener("click", saveSeminar);
document.getElementById("semSearchInput").addEventListener("keyup", loadSeminars);
document.getElementById("saveFellowshipBtn").addEventListener("click", saveFellowship);
document.getElementById("felSearchInput").addEventListener("keyup", loadFellowships);
document.getElementById("saveAwardBtn").addEventListener("click", saveAward);
document.getElementById("awardSearchInput").addEventListener("keyup", loadAwards);
document.getElementById("saveLanguageBtn").addEventListener("click", saveLanguage);
document.getElementById("langSearchInput").addEventListener("keyup", loadLanguages);
document.getElementById("saveHobbyBtn").addEventListener("click", saveHobby);
document.getElementById("hobbySearchInput").addEventListener("keyup", loadHobbies);
document.getElementById("saveAssociationBtn").addEventListener("click", saveAssociation);
document.getElementById("assocSearchInput").addEventListener("keyup", loadAssociations);
document.getElementById("saveBookBtn").addEventListener("click", saveBook);
document.getElementById("bookSearchInput").addEventListener("keyup", loadBooks);
document.getElementById("saveJournalBtn").addEventListener("click", saveJournal);
document.getElementById("journalSearchInput").addEventListener("keyup", loadJournals);
document.getElementById("saveAdminBtn").addEventListener("click", saveAdmin);
document.getElementById("adminSearchInput").addEventListener("keyup", loadAdmin);
document.getElementById("saveProcedureBtn").addEventListener("click", saveProcedure);
document.getElementById("procSearchInput").addEventListener("keyup", loadProcedures);
document.getElementById("procRoleFilter").addEventListener("change", loadProcedures);
document.getElementById("exportProcedurePdfBtn").addEventListener("click", exportProcedurePdf);
document.getElementById("saveMedprocBtn").addEventListener("click", saveMedproc);
document.getElementById("mpSearchInput").addEventListener("keyup", loadMedproc);
document.getElementById("mpRoleFilter").addEventListener("change", loadMedproc);
document.getElementById("exportMedprocPdfBtn").addEventListener("click", exportMedprocPdf);
document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);
document.getElementById("saveEduBtn").addEventListener("click", saveEdu);
document.getElementById("eduSearchInput").addEventListener("keyup", loadEdu);
document.getElementById("eduRoleFilter").addEventListener("change", loadEdu);
document.getElementById("previewCvGrBtn").addEventListener("click", () => previewCV("gr"));
document.getElementById("previewCvEnBtn").addEventListener("click", () => previewCV("en"));
document.getElementById("downloadCvGrBtn").addEventListener("click", downloadCV);
document.getElementById("downloadCvEnBtn").addEventListener("click", downloadCV);
document.getElementById("closeCvBtn").addEventListener("click", closeCV);

const currentJob = document.getElementById("currentJob");
const jobEndDate = document.getElementById("jobEndDate");
currentJob.addEventListener("change", () => {
   jobEndDate.disabled = currentJob.checked;
   if (currentJob.checked) jobEndDate.value = "";
});
