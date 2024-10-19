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
  '/poznamky/2018/02/hugo-zaklady/',
  '/poznamky/2018/04/caddy-v1-zaklady/',
  '/poznamky/2019/12/markdown-zaklady/',
  '/poznamky/2019/12/uvodzovky-a-pomlcky/',
  '/poznamky/2019/12/najst-a-nahradit-retazec/',
  '/poznamky/2019/12/responzivnost-vlozenej-mapy/',
  '/poznamky/2019/12/otvorit-link-na-novej-karte-hugo/',
  '/poznamky/2020/01/pripojit-vzdialeny-priecinok/',
  '/poznamky/2020/01/efi/uefi-verzus-bios/',
  '/poznamky/2020/01/rychlost-nacitania-stranky/',
  '/poznamky/2020/01/systemove-pisma/',
  '/poznamky/2020/02/aktualizacia-php-na-verziu-7.4/',
  '/poznamky/2020/02/bezpecnostne-hlavicky/',
  '/poznamky/2020/02/cache-control-hlavicka/',
  '/poznamky/2020/02/content-security-policy-hlavicka/',
  '/poznamky/2020/02/koncova-lomka-v-url-hugo/',
  '/poznamky/2020/02/prehladat-riadky-a-doplnit-retazce/',
  '/poznamky/2020/11/synchronizovat-vzdialenu-sqlite3-databazu/',
  '/poznamky/2020/11/prvotne-nastavenie-serveru/',
  '/poznamky/2020/11/exim4-a-odosielanie-posty/',
  '/poznamky/2021/11/aktualizacia-php-na-verziu-8.1/',
  '/poznamky/2021/11/aktualizacia-systemu-debian-na-verziu-11-bullseye/',
  '/poznamky/2022/12/apt-advanced-package-tool-zaklady/',
  '/poznamky/2022/12/apt-neplatny-podpisovy-kluc/',
  '/poznamky/2022/12/apt-neoficialne-repozitare/',
  '/poznamky/2022/12/python-instalacia/',
  '/poznamky/2022/12/cas-poslednej-zmeny-prispevku-hugo/',
  '/poznamky/2022/12/zobrazit-znacky-podla-kategorie-hugo/',
  '/poznamky/2022/12/openssh-instalacia-a-zakladne-nastavenie/',
  '/poznamky/2022/12/implementacia-serii-hugo/',
  '/poznamky/2023/01/git-system-na-spravu-verzii-zaklady/',
  '/poznamky/2023/01/git-praca-s-repozitarmi/',
  '/poznamky/2023/01/git-zaznamenavanie-zmien/',
  '/poznamky/2023/01/git-podpisovanie-zaznamov-o-zmenach/',
  '/poznamky/2023/11/aktualizacia-systemu-debian-na-verziu-12-bookworm/',
  '/poznamky/2023/11/historia-prikazov-v-powershell/',
  '/poznamky/2023/12/aktualizacia-php-na-verziu-8.3/',
  '/poznamky/2023/12/php-a-sqlite3/',
  '/poznamky/2024/01/git-kontrola-a-sledovanie-zmien/',
  '/poznamky/2024/01/debian-ako-odstranit-starsie-jadra/',
  '/poznamky/2024/01/scoop-spravca-balickov/',
  '/poznamky/2024/02/postgresql-zaklady/',
  '/poznamky/2024/07/aktualizacia-systemu-raspbian-na-verziu-11-bullseye/',
  '/poznamky/2024/07/raspberry-pi-os-ako-zmenit-zabudnute-heslo/',
  '/poznamky/2024/10/nastavenie-pristupovych-prav-k-suboru-vo-windows/',
  '/recepty/',
  '/recepty/2016/12/medvedie-labky/',
  '/recepty/2016/12/minonky/',
  '/recepty/2017/06/celozrnny-bananovy-chlieb/',
  '/recepty/2018/03/ananasove-rezy/',
  '/recepty/2019/12/utopenci/',
  '/recepty/2019/12/osie-hniezda/',
  '/recepty/2019/12/tvarohovy-kolac/',
  '/recepty/2019/12/zemiakovy-salat/',
  '/recepty/2019/12/uliky/',
  '/recepty/2019/12/vanilkove-rozky/',
  '/recepty/2019/12/lokse-posuchy/',
  '/recepty/2020/01/cokoladovy-kolac/',
  '/recepty/2020/01/salat-z-cervenej-kapusty/',
  '/recepty/2020/01/osie-hniezda-v2/',
  '/recepty/2020/02/holubky/',
  '/recepty/2020/02/vanilkovy-cheesecake/',
  '/recepty/2020/03/tiramisova-pena/',
  '/recepty/2020/03/osie-hniezda-v3/',
  '/recepty/2020/03/spaldove-muffiny-s-cucoriedkami/',
  '/recepty/2020/06/ribezlovo-malinovy-dzem/',
  '/recepty/2020/06/kavova-torta/',
  '/recepty/2020/06/visnovy-kolac-s-posypkou/',
  '/recepty/2020/07/ceresnova-bublanina/',
  '/recepty/2020/09/cernicovy-dzem/',
  '/recepty/2020/09/slivkovy-kolac-s-posypkou/',
  '/recepty/2020/09/kulajda-nakyslo/',
  '/recepty/2020/10/kuraci-vyvar/',
  '/recepty/2020/10/pohankove-susienky/',
  '/recepty/2020/11/skvarkove-pagaciky/',
  '/recepty/2020/12/makovy-zavin/',
  '/recepty/2020/12/mandlovnicky/',
  '/recepty/2020/12/grilaz/',
  '/recepty/2021/03/palacinky/',
  '/recepty/2021/06/ryzovy-nakyp/',
  '/recepty/2021/06/jahodovy-dzem/',
  '/recepty/2021/06/medovo-horcicovy-dresing/',
  '/recepty/2021/06/natierka-z-udenej-nivy/',
  '/recepty/2021/06/pivne-rozky/',
  '/recepty/2021/06/zeleninove-kari/',
  '/recepty/2021/06/karfiolove-kari-s-cicerom/',
  '/recepty/2021/06/razne-bananove-muffiny/',
  '/recepty/2021/08/kokosove-jeze/',
  '/recepty/2021/08/kolac-z-kysleho-mlieka/',
  '/recepty/2021/08/hrachova-kasa/',
  '/recepty/2021/08/koprovo-zemiakova-omacka/',
  '/recepty/2021/08/letna-hubova-polievka/',
  '/recepty/2021/08/pirohy-z-kysleho-mlieka/',
  '/recepty/2021/08/tvarohove-gule/',
  '/recepty/2021/08/koprovo-tvarohovy-kolac/',
  '/recepty/2021/08/nakladane-uhorky/',
  '/recepty/2021/08/celozrnne-razne-pernicky/',
  '/recepty/2021/08/cviklove-kari/',
  '/recepty/2021/08/piskota-s-kakaovou-plnkou/',
  '/recepty/2021/08/pohankova-krupicna-kasa/',
  '/recepty/2021/09/kapia-v-sladko-kyslom-naleve/',
  '/recepty/2021/09/nakladane-leco/',
  '/recepty/2021/09/pikantna-paprikova-pomazanka/',
  '/recepty/2021/09/plnena-paprika/',
  '/recepty/2021/09/hubova-omacka-na-cestoviny/',
  '/recepty/2021/09/piskotova-rolada/',
  '/recepty/2021/09/cestoviny-s-fetou-a-paradajkami/',
  '/recepty/2021/09/hubove-rizoto/',
  '/recepty/2021/09/jablkova-zemlovka/',
  '/recepty/2021/10/hrncekova-knedla/',
  '/recepty/2021/10/dusena-cervena-kysla-kapusta/',
  '/recepty/2021/10/kacacie-prsia-so-slivkovou-omackou/',
  '/recepty/2021/10/cokoladove-brownies/',
  '/recepty/2021/12/fasirky/',
  '/recepty/2021/12/snehove-pusinky/',
  '/recepty/2021/12/linecke-kolaciky/',
  '/recepty/2021/12/quindim/',
  '/recepty/2021/12/zltkovo-orechove-rezy/',
  '/recepty/2022/12/sezamovo-kokosove-tycinky/',
  '/recepty/2022/12/snehove-gule/',
  '/recepty/2023/01/plnene-oblatky/',
  '/recepty/2023/04/velkonocna-hrudka/',
  '/recepty/2023/04/velkonocna-cvikla/',
  '/recepty/2023/06/nepeceny-kokosovo-vanilkovy-cheesecake/',
  '/recepty/2023/07/marhulovy-dzem/',
  '/recepty/2023/07/marhulovy-kolac-s-posypkou/',
  '/recepty/2023/08/babovka-z-prepelicich-vajec/',
  '/recepty/2023/09/nepecena-rolada-s-gastanovym-pyre/',
  '/recepty/2023/11/drozdova-natierka/',
  '/recepty/2023/12/vinove-pecivo/',
  '/recepty/2024/03/plnene-kurca/',
  '/recepty/2024/08/hubova-polievka-nakyslo/',
  '/recepty/2024/08/razne-jablkove-muffiny/',
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
/*self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});*/

/* Serve cached content when offline */
/*Network falling back to cache -  https://web.dev/offline-cookbook/#network-falling-back-to-cache */
self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    }),
  );
});
