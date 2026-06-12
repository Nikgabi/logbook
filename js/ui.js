import {getCurrentUser} from "./auth.js";


/*
export function clearForm(){

 //document.getElementById("title").value="";
 document
.getElementById("formCard")
.reset();

}
*/

export function clearForm(){

   document.getElementById("credentialType").value = "";
   document.getElementById("title").value = "";
   document.getElementById("issuer").value = "";
   document.getElementById("issueDate").value = "";
   document.getElementById("expirationDate").value = "";
   document.getElementById("notes").value = "";
   document.getElementById("attachment").value = "";
   
   document.getElementById("jobStartDate").value = "";
   document.getElementById("jobEndDate").value = "";
   document.getElementById("organizationType").value = "";
   document.getElementById("organizationName").value = "";
   document.getElementById("department").value = "";
   document.getElementById("jobGrade").value = "";
   document.getElementById("jobAttachment").value = "";
   
   document.getElementById("publicationType").value = "";
   document.getElementById("titlePub").value = "";
   document.getElementById("paper").value = "";
   document.getElementById("authors").value = "";
   document.getElementById("firstDate").value = "";
   document.getElementById("public_Date").value = "";
   document.getElementById("Public_attachment").value = "";
   
   

}

export function showUser(user){
	
   
   const formCard =
      document.getElementById("formCard");
    const jobForm = 
	   document.getElementById("jobForm");
	const formPublications =
		document.getElementById("formPublications");

   const userBox =
      document.getElementById("userBox");

   const credentialsList =
      document.getElementById("credentialsList");
	const publicatiosList =
      document.getElementById("publicationsList");
	const jobsList =
      document.getElementById("jobsList");	
   document.getElementById("conferenceForm").style.display = user ? "block" : "none";	 

   if(user){
		
      formCard.style.display = "block";
	  jobForm.style.display = "block"; 
	  formPublications.style.dispay = "block" ; 
	  

      userBox.innerHTML = `
         <b>${user.displayName}</b>
         <br>
         ${user.email}
      `;

   }
   else{

      formCard.style.display = "none";
	  jobForm.style.display = "none"; 
	  formPublications.style.dispay = "none" ; 

      userBox.innerHTML =
         "Δεν υπάρχει σύνδεση";
		 
      credentialsList.innerHTML = "";
	  publicationsList.innerHTML = "";
	  jobsList.innerHTML = "";  	
   }

}