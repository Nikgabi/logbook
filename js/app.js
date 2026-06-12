console.log("APP LOADED");

import {
 login,
 logout,
 initAuth,
 getCurrentUser
}
from "./auth.js";

import {
 clearForm,
 showUser
}
from "./ui.js";

import {
 saveCredentials,
 loadCredentials,
 deleteCredentials,
 openAttachment
}
from "./credentials.js";

import { db } from "./db.js";

import { saveJob, loadJobs } from "./jobs.js";

import { savePublications, loadPublications, deletePublications, openPublic_Attachment } from "./publications.js";

import { saveConference, loadConferences } from "./conferences.js";


initAuth(async user => {

   showUser(user);

   document
     .getElementById("formCard")
     .style.display =
       user ? "block" : "none";

   document
     .getElementById("formPublications")
     .style.display =
       user ? "block" : "none";

   document
     .getElementById("jobForm")
     .style.display =
       user ? "block" : "none";

   document
     .getElementById("conferenceForm")
     .style.display =
       user ? "block" : "none";

   if(user){

      await loadCredentials();
      await loadJobs();
      await loadPublications();
      await loadConferences();
   }
});

document
.getElementById("loginBtn")
.addEventListener("click", login);

document
.getElementById("logoutBtn")
.addEventListener("click", logout);

document
.getElementById("saveCredentials")
.addEventListener("click", saveCredentials);

document
.getElementById("searchInput")
.addEventListener("keyup", loadCredentials);

document
.getElementById("saveJobBtn")
.addEventListener("click", saveJob);

document
.getElementById("savePublications")
.addEventListener("click", savePublications);

document
.getElementById("saveConferenceBtn")
.addEventListener("click", saveConference);

document
.getElementById("confSearchInput")
.addEventListener("keyup", loadConferences);

const currentJob =
document.getElementById("currentJob");

const jobEndDate =
document.getElementById("jobEndDate");

currentJob.addEventListener(
   "change",
   () => {

      jobEndDate.disabled =
         currentJob.checked;

      if(currentJob.checked){

         jobEndDate.value = "";

      }

   }
);
