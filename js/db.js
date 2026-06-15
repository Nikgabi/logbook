
import Dexie from
"https://cdn.jsdelivr.net/npm/dexie@4/dist/dexie.mjs";

export const db =
new Dexie("LogBookDB");

db.version(9).stores({

   credentials:
   "++id, uid, certificationType, title",

   jobs:
   "++id, uid, organizationType, grade, startDate",

   conferences:
   "++id, uid, title, startDate",

   conference_participations:
   "++id, conferenceId, uid, type, title",

   publications:
   "++id, uid, paper, authors, publicationType, notes_publ",

   research:
   "++id, uid, title, role, dateFrom",

   seminars:
   "++id, uid, title, type, dateFrom",

   fellowships:
   "++id, uid, subject, type, dateFrom",

   awards:
   "++id, uid, title, category, date",

   trainings:
   "++id, uid, title, startDate"

});
