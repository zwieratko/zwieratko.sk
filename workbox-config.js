// workbox-config.js

module.exports = {
  // --- Povinné nastavenia Workbox GenerateSW ---

  // Odkiaľ brať vygenerované súbory (výstup z Hugo)
  globDirectory: "public/",

  // Kam uložiť finálny Service Worker (bude sa registrovať v HTML)
  swDest: "public/sw.js",

  // Súbory, ktoré majú byť automaticky kešované pri inštalácii (Precaching)
  globPatterns: [
    "**/*.{html,css,js,json,webmanifest}",
    "**/*.{png,svg}",
    //"**/*.{png,jpg,jpeg,svg,webp}",
    //"webfonts/**/*.{woff2,woff,ttf,eot}",
  ],

  // --- Nastavenia Service Workera ---

  // Zabezpečí, že Service Worker prevezme kontrolu hneď po inštalácii
  skipWaiting: true,
  clientsClaim: true,

  // Maximálna veľkosť súboru na kešovanie (napr. 5MB)
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

  // --- Kešovacie stratégie (Runtime Caching) ---

  runtimeCaching: [
    // Stratégia NetworkFirst pre hlavné HTML dokumenty (zabezpečí vždy najnovší obsah)
    {
      urlPattern: ({ request }) => request.mode === "navigate", // Zameriava sa na navigáciu (HTML)
      handler: "NetworkFirst",
      options: {
        cacheName: "html-pages-cache",
        networkTimeoutSeconds: 3,
      },
    },
    {
      // Cachovanie CSS a JS
      urlPattern: /\.(?:js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
      },
    },
    // Stratégia StaleWhileRevalidate pre dynamicky načítané obrázky (rýchle, s aktualizáciou na pozadí)
    {
      urlPattern: /.*\.(?:png|jpg|jpeg|svg|webp|gif)/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "runtime-images-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dní
        },
      },
    },
    {
      // Cachovanie fontov
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 rok
        },
      },
    },
    // Prípadná iná stratégia pre externé dáta/API
    // {
    //   urlPattern: /https:\/\/api\.external-service\.com\/.*/,
    //   handler: 'CacheFirst',
    //   options: {
    //     cacheName: 'api-cache',
    //   }
    // }
  ],
};
