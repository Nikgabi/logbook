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


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: 'select_account'
});

let currentUser = null;

export async function login(){
 
 await signInWithPopup(auth,provider);
 

}

export async function logout(){

 await signOut(auth);

}

export function initAuth(callback){

 onAuthStateChanged(auth,user=>{

   currentUser=user;

   callback(user);

 });

}


export function getCurrentUser() {

   return currentUser;

}

