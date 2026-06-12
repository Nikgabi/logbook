import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

import {
	showUser,
	clearForm	

} from "./ui.js";


export async function saveJob(){

   
    const user = getCurrentUser();
	  
	  if(!user){

		alert("Πρέπει να συνδεθείτε");

		return;
		}

      const fileInput =
         document.getElementById("jobAttachment");
		 
	  const file =
			fileInput.files[0] || null;

      console.log("FILE INPUT", fileInput);

      await db.jobs.add({

         uid:user.uid,

         startDate:
         document.getElementById("jobStartDate").value,

         endDate:
         document.getElementById("jobEndDate").value,

         currentEmployment:
         document.getElementById("currentJob").checked,

         organizationType:
         document.getElementById("organizationType").value,

         organizationName:
         document.getElementById("organizationName").value,

         department:
         document.getElementById("department").value,

         grade:
         document.getElementById("jobGrade").value ,
		 
		 attachment:file,      // <-- ΑΥΤΟ ΥΠΑΡΧΕΙ ;

	   createdAt:
	   new Date().toISOString()

      });
	  alert("Η προϋπηρεσία αποθηκεύτηκε");
      console.log("ADD OK");
	  
	  clearForm();
	  
	
      await loadJobs(); 

}

/*
export async function saveJob(){

   const user = getCurrentUser();

   if(!user){

      alert("Πρέπει να συνδεθείτε");

      return;

   }

   const fileInput =
      document.getElementById("jobAttachment");

   const file =
      fileInput.files[0] || null;

   await db.jobs.add({

      uid:user.uid,

      startDate:
      document.getElementById("jobStartDate").value,

      endDate:
      document.getElementById("jobEndDate").value,

      currentEmployment:
      document.getElementById("currentJob").checked,

      organizationType:
      document.getElementById("organizationType").value,

      organizationName:
      document.getElementById("organizationName").value,

      department:
      document.getElementById("department").value,

      grade:
      document.getElementById("jobGrade").value,

      attachment:file,

      createdAt:
      new Date().toISOString()

   });

   alert("Η προϋπηρεσία αποθηκεύτηκε");

   await loadJobs();

} */


export async function loadJobs(){

   const user = getCurrentUser();

   if(!user){
		document.getElementById("jobsList")
		.innerHTML = "";

		return;
	}

   const jobs =
      await db.jobs
      .where("uid")
      .equals(user.uid)
      .reverse()
      .sortBy("createdAt");

   const jobsList =
      document.getElementById("jobsList");

   jobsList.innerHTML = "";

   for(const item of jobs){
	   
	   console.log("JOB", item);
		console.log("ATTACHMENT", item.attachment);

      jobsList.innerHTML += `

      <div class="card mb-3">

         <div class="card-body">

            <h5>

               ${item.organizationName}

            </h5>

            <p>

               ${item.grade}
               <br>

               ${item.department}
               <br>

               ${item.startDate}
               -
               ${item.currentEmployment
                  ? "Σήμερα"
                  : item.endDate}

            </p>

            ${
               item.attachment
               ?

               `<button
                  onclick="openJobAttachment(${item.id})"
                  class="btn btn-sm btn-success">

                  Βεβαίωση

               </button>`

               : ""
            }

            <button
               onclick="deleteJob(${item.id})"
               class="btn btn-sm btn-danger">

               Διαγραφή

            </button>

         </div>

      </div>

      `;

   }

}

export async function deleteJob(id){

   const confirmDelete =
      confirm(
         "Να διαγραφεί η προϋπηρεσία;"
      );

   if(!confirmDelete)
      return;

   await db.jobs.delete(id);

   await loadJobs();

}

export async function openJobAttachment(id){

   const item =
      await db.jobs.get(id);

   if(
      !item ||
      !item.attachment
   ) return;

   const url =
      URL.createObjectURL(
         item.attachment
      );

   window.open(
      url,
      "_blank"
   );

}

window.deleteJob =
   deleteJob;

window.openJobAttachment =
   openJobAttachment;
   
   