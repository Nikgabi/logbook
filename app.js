const provider =
new GoogleAuthProvider();

window.login = async function(){

try{

const result =
await signInWithPopup(auth, provider);

const user = result.user;

console.log(user);

}
catch(error){

console.error(error);

}

}

window.logout = async function(){

await signOut(auth);

}

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




<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDXJWygGmkLERGCv1nFj9H7xHWVYuF-Row",
    authDomain: "medical-logbook-9a47f.firebaseapp.com",
    projectId: "medical-logbook-9a47f",
    storageBucket: "medical-logbook-9a47f.firebasestorage.app",
    messagingSenderId: "830569350254",
    appId: "1:830569350254:web:32635a572746bc4b6b127f"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>