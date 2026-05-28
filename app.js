import { initializeApp }

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {

getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";



// FIREBASE CONFIG

const firebaseConfig = {

apiKey: "AIzaSyDXJWygGmkLERGCv1nFj9H7xHWVYuF-Row",

authDomain: "medical-logbook-9a47f.firebaseapp.com",

projectId: "medical-logbook-9a47f",

storageBucket: "medical-logbook-9a47f.firebasestorage.app",

messagingSenderId: "830569350254",

appId: "1:830569350254:web:32635a572746bc4b6b127f"

};


// INITIALIZE FIREBASE

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const provider =
new GoogleAuthProvider();


// LOGIN

window.login = async function(){

try{

const result =
await signInWithPopup(auth, provider);

const user = result.user;

console.log(user);

alert("Συνδέθηκε:");

}
catch(error){

console.error(error);

alert(error.message);

}

}


// LOGOUT

window.logout = async function(){

await signOut(auth);

alert("Αποσυνδέθηκε");

}


// USER STATE

onAuthStateChanged(auth, user => {

if(user){

document.getElementById("userBox")
.innerHTML = `

<b>${user.displayName}</b>

<br>

${user.email}

`;

}
else{

document.getElementById("userBox")
.innerHTML = "Δεν υπάρχει σύνδεση";

}

});