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


initAuth(async user => {

   const spinner = document.getElementById("loadingSpinner");
   if (spinner) spinner.style.display = "none";

   showUser(user);

   const formIds = [
      "formCard", "formPublications", "jobForm",
      "conferenceForm", "researchForm", "seminarForm",
      "fellowshipForm", "awardsForm"
   ];

   formIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = user ? "block" : "none";
   });

   try {
      if (user) {
         await loadCredentials();   console.log("credentials OK");
         await loadJobs();          console.log("jobs OK");
         await loadPublications();  console.log("publications OK");
         await loadConferences();   console.log("conferences OK");
         await loadResearch();      console.log("research OK");
         await loadSeminars();      console.log("seminars OK");
         await loadFellowships();   console.log("fellowships OK");
         await loadAwards();        console.log("awards OK");
      }
   } catch(err) {
      console.error("❌ Error in load:", err);
   } finally {
      // Εκτελείται ΠΑΝΤΑ — ακόμα και αν υπάρχει error
      const tabContent = document.getElementById("mainTabContent");
      if (tabContent) tabContent.style.visibility = "visible";
      console.log("✅ Done!");
   }
});

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

const currentJob = document.getElementById("currentJob");
const jobEndDate = document.getElementById("jobEndDate");
currentJob.addEventListener("change", () => {
   jobEndDate.disabled = currentJob.checked;
   if (currentJob.checked) jobEndDate.value = "";
});
