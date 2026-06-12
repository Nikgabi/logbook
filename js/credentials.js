import {db} from "./db.js";

import {
 getCurrentUser
}
from "./auth.js";

import {
	showUser,
	clearForm	

} from "./ui.js";



// SAVE CREDENTIALS

export async function saveCredentials(){
	
const user = getCurrentUser();	
if(!user){

alert("Πρέπει να συνδεθείτε");

return;
}
const fileInput =
document.getElementById("attachment");

const file =
fileInput.files[0] || null;

await db.credentials.add({
uid: user.uid,

certificationType:
document.getElementById("credentialType").value,

title:
document.getElementById("title").value,

issuer:
document.getElementById("issuer").value,

issueDate:
document.getElementById("issueDate").value,

expirationDate:
document.getElementById("expirationDate").value,

notes:
document.getElementById("notes").value,

attachment:file,

createdAt:new Date().toISOString()

});

alert("Η καταχώρηση αποθηκεύτηκε");

clearForm();


loadCredentials();

}

//LOAD CRENDENTIALS

export async function loadCredentials(){
	
	const user = getCurrentUser();
	if(!user){
		document.getElementById("credentialsList")
		.innerHTML = "";

return;
	}
	const search =
	document.getElementById("searchInput")
	.value
	.toLowerCase();

	const credentials =
	await db.credentials
	.where("uid")
	.equals(user.uid)
	.toArray();

	let html = "";

	credentials
	//.reverse()
	.forEach(item => {

	const combined = `
	${item.title}
	${item.issuer}
	${item.certificationType}
	${item.notes}
	`
	.toLowerCase();

	if(!combined.includes(search)) return;

	html += `

	<div class="card border mb-3 p-3">

	<div class="d-flex justify-content-between align-items-start flex-wrap gap-3">

	<div>

	<span class="badge bg-primary badge-type mb-2">
	${item.certificationType}
	</span>

	<h5 class="mb-1">
	${item.title || "Χωρίς τίτλο"}
	</h5>

	<div class="text-muted mb-2">
	${item.issuer || ""}
	</div>

	<div>

	<b>Ημερομηνία:</b>
	${item.issueDate || "-"}

	</div>

	${item.expirationDate ? `
	<div>
	<b>Λήξη:</b>
	${item.expirationDate}
	</div>
	` : ""}
	</div>

<div>

<button
onclick="openAttachment(${item.id})"
class="btn btn-sm btn-success mb-2">
Άνοιγμα Αρχείου
</button>

<br>

<button
onclick="deleteCredentials(${item.id})"
class="btn btn-sm btn-danger">
Διαγραφή
</button>

</div>

</div>

${item.notes ? `
<hr>
<p class="mb-0">
${item.notes}
</p>
` : ""}

</div>

`;

});

if(html === ""){

html = `
<div class="alert alert-secondary">
Δεν υπάρχουν καταχωρήσεις.
</div>
`;

}


document.getElementById("credentialsList")
.innerHTML = html;

}


// DELETE CRENDENTIALS

export async function deleteCredentials(id){
	const confirmDelete =
	confirm("Να διαγραφεί η καταχώρηση;");

	if(!confirmDelete) return;

	await db.credentials.delete(id);

	loadCredentials();
	
}

//OPEN ATTACHMENT

export async function openAttachment(id){
	const item =
	await db.credentials.get(id);

	if(!item.attachment){

	alert("Δεν υπάρχει αρχείο");
	return;

	}

	const url = URL.createObjectURL(item.attachment);

	window.open(url);
	
}


window.openAttachment = openAttachment;
window.deleteCredentials = deleteCredentials;