import {db} from "./db.js";

import {
 getCurrentUser
}
from "./auth.js";

import {
	showUser,
	clearForm	

} from "./ui.js";



// SAVE PUBLICATIONS

export async function savePublications(){
	
const user = getCurrentUser();	
if(!user){

alert("Πρέπει να συνδεθείτε");

return;
}
const fileInput =
document.getElementById("Public_attachment");

const file =
fileInput.files[0] || null;

await db.publications.add({
uid: user.uid,

publicationType:
document.getElementById("publicationType").value,

paper:
document.getElementById("paper").value,

authors:
document.getElementById("authors").value,

firstDate:
document.getElementById("firstDate").value,

public_Date:
document.getElementById("public_Date").value,

notesPubl:
document.getElementById("notes_publ").value,

attachment:file,

createdAt:new Date().toISOString()

});

alert("Η δημοσίευση αποθηκεύτηκε");

clearForm();


loadPublications();

}

//LOAD PUBLICATIONS

export async function loadPublications(){
	
	const user = getCurrentUser();
	if(!user){
		document.getElementById("publicationsList")
		.innerHTML = "";

return;
	}
	const search =
	document.getElementById("searchInput")
	.value
	.toLowerCase();

	const publications =
	await db.publications
	.where("uid")
	.equals(user.uid)
	.toArray();

	let html = "";

	publications
	//.reverse()
	.forEach(item => {

	const combined = `
	${item.paper}
	${item.authors}
	${item.publicationType}
	${item.notesPubl}
	`
	.toLowerCase();

	if(!combined.includes(search)) return;

	html += `

	<div class="card border mb-3 p-3">

	<div class="d-flex justify-content-between align-items-start flex-wrap gap-3">

	<div>

	<span class="badge bg-primary badge-type mb-2">
	${item.publicationType}
	</span>

	<h5 class="mb-1">
	${item.paper || "Χωρίς τίτλο"}
	</h5>

	<div class="text-muted mb-2">
	${item.authors || ""}
	</div>

	<div>

    <b>Ημερομηνία αποστολής:</b>
    ${item.firstDate || "-"}

</div>

<div>

    <b>Ημερομηνία δημοσίευσης:</b>
	${item.public_Date || "-"}
</div>


<div>

<button
onclick="openPublic_Attachment(${item.id})"
class="btn btn-sm btn-success mb-2">
Άνοιγμα Αρχείου Δημοσίευσης
</button>

<br>

<button
onclick="deletePublications(${item.id})"
class="btn btn-sm btn-danger">
Διαγραφή
</button>

</div>

</div>

${item.notes ? `
<hr>
<p class="mb-0">
${item.notes_publ}
</p>
` : ""}

</div>

`;

});

if(html === ""){

html = `
<div class="alert alert-secondary">
Δεν υπάρχουν δημοσιεύσεις.
</div>
`;

}


document.getElementById("publicationsList")
.innerHTML = html;

}


// DELETE PUBLICATIONS

export async function deletePublications(id){
	const confirmDelete =
	confirm("Να διαγραφεί η δημοσίευση;");

	if(!confirmDelete) return;

	await db.publications.delete(id);

	loadPublications();
	
}

//OPEN PUBLIC_ATTACHMENT

export async function openPublic_Attachment(id){
	const item =
	await db.publications.get(id);

	if(!item.attachment){

	alert("Δεν υπάρχει αρχείο");
	return;

	}

	const url = URL.createObjectURL(item.attachment);

	window.open(url);
	
}


window.openPublic_Attachment = openPublic_Attachment;
window.deletePublications = deletePublications;