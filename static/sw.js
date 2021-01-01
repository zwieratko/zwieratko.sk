const version = '1';
let cacheName = `zwieratko-pwa-${version}`;
let filesToCacheCore = [
  '/',
  '/index.html',
  '/css/style.min.61b2f93a097ed87af50532137cf5cfb8d1293c6e8e21b1d7318db2ee854db7c8.css',
  '/js/bundle.min.b29e4bdcb78c4a39cd614c14af25b1a562f4b89cc772c55c616678a92121484e.js',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/mstile-150x150.png',
  '/site.webmanifest'
];
let filesToCacheExtra = [
  '/poznamky/',
  '/poznamky/2018-02-26-hugo-zaklady/',
  '/poznamky/2018-04-22-caddy-zaklady/',
  '/poznamky/2019-12-04-markdown-zaklady/',
  '/poznamky/2019-12-05-uvodzovky-a-pomlcky/',
  '/poznamky/2019-12-25-najst-a-nahradit-retazec/',
  '/poznamky/2019-12-25-responzivnost-vlozenej-mapy/',
  '/poznamky/2019-12-26-otvorit-link-na-novej-karte/',
  '/poznamky/2020-01-12-pripojit-vzdialeny-priecinok/',
  '/poznamky/2020-01-18-efiuefi-verzus-bios/',
  '/poznamky/2020-01-29-rychlost-nacitania-stranky/',
  '/poznamky/2020-01-30-systemove-pisma/',
  '/poznamky/2020-02-07-aktualizacia-php/',
  '/poznamky/2020-02-09-bezpecnostne-hlavicky/',
  '/poznamky/2020-02-13-cache-control-hlavicka/',
  //'/poznamky/2020-02-16-content-security-policy-hlavicka/',
  '/poznamky/2020-02-20-koncova-lomka-v-url/',
  '/poznamky/2020-02-21-prehladat-riadky-a-doplnit-retazce/',
  '/poznamky/2020-11-20-synchronizovat-vzdialenu-sqlite3-databazu/',
  '/poznamky/2020-11-21-prvotne-nastavenie-serveru/',
  '/poznamky/2020-11-27-exim4-a-odosielanie-posty/',
  '/recepty/',
  '/recepty/2016-12-08-medvedie-labky/',
  '/recepty/2016-12-09-minonky/',
  '/recepty/2017-06-24-celozrny-bananovy-chlieb/',
  '/recepty/2018-03-31-ananasove-rezy/',
  '/recepty/2019-12-06-utopenci/',
  '/recepty/2019-12-10-osie-hniezda/',
  '/recepty/2019-12-10-tvarohovy-kolac/',
  '/recepty/2019-12-24-zemiakovy-salat/',
  '/recepty/2019-12-24-uliky/',
  '/recepty/2019-12-24-vanilkove-rozky/',
  '/recepty/2019-12-28-lokse-obycajne/',
  '/recepty/2020-01-19-cokoladovy-kolac/',
  '/recepty/2020-01-25-salat-z-cervenej-kapusty/',
  '/recepty/2020-01-26-osie-hniezda-v2/',
  '/recepty/2020-02-01-holubky/',
  '/recepty/2020-02-01-vanilkovy-cheesecake/',
  '/recepty/2020-03-08-tiramisova-pena/',
  '/recepty/2020-03-29-osie-hniezda-v3/',
  '/recepty/2020-03-29-spaldove-muffiny/',
  '/recepty/2020-06-01-ribezlovy-dzem/',
  '/recepty/2020-06-20-kavova-torta/',
  '/recepty/2020-06-24-visnovy-kolac-s-posypkou/',
  '/recepty/2020-07-04-ceresnova-bublanina/',
  '/recepty/2020-09-19-cernicovy-dzem/',
  '/recepty/2020-09-20-slivkovy-kolac-s-posypkou/',
  '/recepty/2020-09-30-kulajda-nakyslo/',
  '/recepty/2020-10-01-kuraci-vyvar/',
  '/recepty/2020-10-09-pohankove-susienky/',
  '/recepty/2020-11-29-skvarkove-pagaciky/',
  '/recepty/2020-12-03-makovy-zavin/',
  '/recepty/2020-12-10-mandlovnicky/',
  '/recepty/2020-12-24-grilaz/',
  '/projekty/',
  '/galeria/',
  '/kontakt/'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  //self.skipWaiting(); // doplnene z https://stackoverflow.com/questions/33262385/service-worker-force-update-of-new-assets
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      cache.addAll(filesToCacheExtra);
      return cache.addAll(filesToCacheCore);
    })
  );
});

// Remove old cache if any - https://web.dev/offline-cookbook/#on-activate
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheNameList) {
            // Return true if you want to remove this cache,
            // but remember that caches are shared across
            // the whole origin
            if(cacheNameList!=cacheName)
            return true;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          }),
      );
    }),
  );
});

/* Serve cached content when offline */
/*Cache, falling back to network - https://web.dev/offline-cookbook/#cache-falling-back-to-network */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
