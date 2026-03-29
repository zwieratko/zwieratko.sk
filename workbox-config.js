// workbox-config.js

module.exports = {
  globDirectory: "public/",
  swDest: "public/sw.js",
  // Only precache the essentials (App Shell)
  globPatterns: [
    "index.html",
    "**/*.{css,js,json,webmanifest}",
    "**/*.{png,svg}",
    //"**/*.{png,jpg,jpeg,svg,webp}",
    //"webfonts/**/*.{woff2,woff,ttf,eot}",
  ],
  skipWaiting: true,
  clientsClaim: true,

  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

  runtimeCaching: [
    {
      // All other HTML pages (NetworkFirst with faster timeout)
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 5, // Slightly more for 3G
      },
    },
    {
      // Images - CacheFirst (they rarely change)
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // Fonts ??
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // ?? API
    // {
    //   urlPattern: /https:\/\/api\.external-service\.com\/.*/,
    //   handler: 'CacheFirst',
    //   options: {
    //     cacheName: 'api-cache',
    //   }
    // }
  ],
};
