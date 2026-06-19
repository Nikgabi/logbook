const CACHE_NAME = 'medical-logbook-v2';
const urlsToCache = [
  '/',
  '/index.html',
  'js/auth.js',
  'js/app.js',
  'docs/odigies.pdf',
  'css/style.css',
  'js/admin.js',
  'js/awards.js',
  'js/books_journals.js',
  'js/conferences.js',
  'js/credentials.js',
  'js/cv.js',
  'js/db.js',
  'js/edu.js',
  'js/fellowships.js',
  'js/jobs.js',
  'js/procedures.js',
  'js/profile.js',
  'js/publications.js',
  'js/research.js',
  'js/seminars.js',
  'js/ui.js',
  'js/xobi.js'
  'logbook.png',
  'logbook_s.png'
  // Πρόσθεσε εδώ όλα τα αρχεία που χρειάζεσαι (HTML, CSS, JS, εικόνες)
];

// Εγκατάσταση: Κατεβάζει και αποθηκεύει τα αρχεία
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch: Σερβίρει τα αρχεία από το cache όταν είναι offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});