import { db } from "./db.js";
import { getCurrentUser } from "./auth.js";

// ─── Preview φωτογραφίας ──────────────────────────────────────────────────────
window.previewProfilePhoto = function(input) {
   if (!input.files || !input.files[0]) return;
   const reader = new FileReader();
   reader.onload = e => {
      document.getElementById("profilePhotoImg").src = e.target.result;
      document.getElementById("profilePhotoImg").style.display = "block";
      document.getElementById("profilePhotoPlaceholder").style.display = "none";
   };
   reader.readAsDataURL(input.files[0]);
};

// ─── SAVE PROFILE ─────────────────────────────────────────────────────────────
export async function saveProfile() {
   const user = getCurrentUser();
   if (!user) { alert("Πρέπει να συνδεθείτε"); return; }

   // Φωτογραφία ως base64
   let photoBase64 = null;
   const photoInput = document.getElementById("profilePhoto");
   if (photoInput.files && photoInput.files[0]) {
      photoBase64 = await new Promise(res => {
         const r = new FileReader();
         r.onload = e => res(e.target.result);
         r.readAsDataURL(photoInput.files[0]);
      });
   } else {
      // Κρατάμε την υπάρχουσα αν δεν αλλάξει
      const existing = await db.profile.where("uid").equals(user.uid).first();
      if (existing) photoBase64 = existing.photo;
   }

   // Upsert — ένα προφίλ ανά χρήστη
   const existing = await db.profile.where("uid").equals(user.uid).first();

   const data = {
      uid:            user.uid,
      firstName:      document.getElementById("profileFirstName").value.trim(),
      lastName:       document.getElementById("profileLastName").value.trim(),
      firstNameEn:    document.getElementById("profileFirstNameEn").value.trim(),
      lastNameEn:     document.getElementById("profileLastNameEn").value.trim(),
      title:          document.getElementById("profileTitle").value.trim(),
      titleEn:        document.getElementById("profileTitleEn").value.trim(),
      email:          document.getElementById("profileEmail").value.trim(),
      phone:          document.getElementById("profilePhone").value.trim(),
      address:        document.getElementById("profileAddress").value.trim(),
      linkedin:       document.getElementById("profileLinkedin").value.trim(),
      orcid:          document.getElementById("profileOrcid").value.trim(),
      bioGr:          document.getElementById("profileBioGr").value.trim(),
      bioEn:          document.getElementById("profileBioEn").value.trim(),
      photo:          photoBase64,
      updatedAt:      new Date().toISOString()
   };

   if (existing) {
      await db.profile.update(existing.id, data);
   } else {
      await db.profile.add(data);
   }

   alert("Το προφίλ αποθηκεύτηκε!");
}

// ─── LOAD PROFILE ─────────────────────────────────────────────────────────────
export async function loadProfile() {
   const user = getCurrentUser();
   if (!user) return;

   const item = await db.profile.where("uid").equals(user.uid).first();
   if (!item) return;

   const fields = [
      "firstName", "lastName", "firstNameEn", "lastNameEn",
      "title", "titleEn", "email", "phone", "address",
      "linkedin", "orcid", "bioGr", "bioEn"
   ];

   fields.forEach(f => {
      const el = document.getElementById(`profile${f.charAt(0).toUpperCase() + f.slice(1)}`);
      if (el && item[f]) el.value = item[f];
   });

   // Φωτογραφία
   if (item.photo) {
      document.getElementById("profilePhotoImg").src = item.photo;
      document.getElementById("profilePhotoImg").style.display = "block";
      document.getElementById("profilePhotoPlaceholder").style.display = "none";
   }
}

// ─── GET PROFILE (για χρήση από το βιογραφικό) ───────────────────────────────
export async function getProfile() {
   const user = getCurrentUser();
   if (!user) return null;
   return await db.profile.where("uid").equals(user.uid).first();
}
