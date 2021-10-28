---
title: "Cache-Control hlavička"
date: 2020-02-13T22:00:47+01:00
draft: false
description: Ako správne nastaviť Cache-Control hlavičku odpovede webového servera.
type: posts
tags:
  - Caddy
  - Webový server
  - Cache-Control
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem správne nastaviť Cache-Control hlavičku odpovede webového servera.

Chcem zohľadniť aj bezpečnosť a súkromie, ale aj rýchlosť načítania stránky. Oboje viem ovplyvniť práve dobrým nastavením hlavičky Cache-Control.

---

## Typy webových vyrovnávacích pamätí

Existuje viacero spôsobov, ako nazerať na webovú vyrovnávaciu pamäť, no z pohľadu hlavičky Cache-Control ich môžem rozdeliť na dva typy.

### Súkromná vyrovnávacia pamäť

- V podstate jediná „cache“, ktorú mám plne pod kontrolou. Je súčasťou prehliadača, viem určiť jej veľkosť, môžem ju vymazať a mal by som mať ku nej prístup len ja.

- Prehliadač môže, ako vyrovnávaciu pamäť použiť aj pamäť, aj pevný disk počítača, a teda je to veľmi rýchla vyrovnávacia pamäť.

### Zdieľaná vyrovnávacia pamäť

- Všetky ostatné „cache“ sú zdieľané mnohými užívateľmi. Sú na rôznych miestach cesty medzi webovým serverom a užívateľovým prehliadačom.

- Môžu to byť proxy servery poskytovateľov internetového pripojenia, firemný proxy alebo akákoľvek tretia strana na ceste.

- Môže to byť tak isto reverzný proxy server stojaci pred webovým serverom, slúžiaci na rozdelenie záťaže alebo distribúciu obsahu pomocou prevádzkovateľa [CDN](https://cs.wikipedia.org/wiki/Content_delivery_network).

Všetky tieto vyrovnávacie pamäte sa riadia vlastnou politikou, ktorú nastavuje ich správca a práve aj politikou nastavenou v hlavičke odpovede webového servera Cache-Control.

---

## Parametre hlavičky Cache-Control

Je ich možné rozdeliť do niekoľkých skupín, podľa toho, čo dané parametre ovplyvňujú.

### Uložiteľnosť

Parametre ovplyvňujúce **možnosť** ukladať obsah do vyrovnávacej pamäte:

- `public` -- je možné ukladať odpovede do akejkoľvek vyrovnávacej pamäte (súkromnej aj zdieľanej), je možné ukladať odpovede, aj keď sú spojené s HTTP autentifikáciou, aj keď neobsahujú `max-age` alebo, aj keď sú odpoveďou na POST požiadavku

- `private` -- je možné ukladať odpovede, ale len do súkromnej vyrovnávacej pamäte užívateľa v prehliadači (teda nie do zdieľanej mimo prehliadača)

- `no-cache` -- je síce možné ukladať odpovede do vyrovnávacej pamäte, ale pred každým použitím je potrebné overiť platnosť na serveri odkiaľ pochádzajú

- `no-store` -- nie je možné ukladať odpovede servera do žiadnej vyrovnávacej pamäte (ani v prehliadači, ani cestou do prehliadača), po každej požiadavke prehliadača je celá odpoveď znova sťahovaná zo servera

### Životnosť

Parametre definujúce **životnosť** uloženého obsahu:

- `max-age` -- určuje maximálny čas v sekundách, počas ktorého je možné odpoveď uloženú vo vyrovnávacej pamäti považovať za aktuálnu a používať ju, je to relatívny čas vo vzťahu k času požiadavky

- `s-maxage` -- to isté, ale vo vzťahu ku zdieľaným vyrovnávacím pamätiam na ceste do prehliadača

- `stale-while-revalidate` -- určuje čas v sekundách, počas ktorého je možné použiť aj zastaranú verziu odpovede, pokiaľ je zároveň na pozadí kontrolovaná dostupnosť novšej verzie

- `stale-if-error` -- určuje čas v sekundách, počas ktorého je možné použiť aj zastaranú verziu odpovede, ak nie je možné získať novšiu (zatiaľ nie je podporovaný žiadnym prehliadačom)

### Overiteľnosť

Parametre určujúce či sa má obsah znova **overovať**:

- `must-revalidate` -- pred použitím obsahu z vyrovnávacej pamäte je nevyhnutné overiť či nie je zastaraný, musí sa striktne dodržiavať doba uvedená v `max-age`, `s-maxage` alebo `Expires`

- `proxy-revalidate` -- to isté, ale vo vzťahu ku zdieľaným vyrovnávacím pamätiam na ceste do prehliadača

- `immutable` -- naopak označuje, že uložený obsah sa nebude na serveri meniť, a teda prehliadač si nemusí overovať či nedošlo k zmene, aj keď užívateľ vyslovene obnoví stránku

### Iné

- `no-transform` -- obsah uložený vo vyrovnávacej pamäti nesmie byť pozmenený za žiadnych okolností

---

## Nastavenie hlavičky Cache-Control

Pre správne nastavenie je dôležité rozdeliť súbory podľa obsahu a podľa toho ako často sa mení ten obsah a pre takto správne rozdelené súbory môžem správne nastaviť rôzne spôsoby a časy ukladania obsahu do vyrovnávacej pamäte.

### Súbory HTML / PHP

Ak súbory môžu obsahovať citlivé, osobné alebo dôverné informácie alebo sa ich obsah veľmi často mení je potrebné hlavičku Cache-Control nastaviť tak, aby sa žiaden obsah neukladal v žiadnej vyrovnávacej pamäti. Aby sa súbory pri požiadavke prehliadača vždy sťahovali zo serveru na novo.

Toto je potrebné nastaviť tak, aby to rešpektovali podľa možnosti všetky používané prehliadače.

.htaccess:
```Apache
# 0 days
<filesMatch "\.(x?html?|php)\.br$">
Header always set Cache-Control "no-store, max-age=0"
Header always set Pragma "no-cache"
Header always set Expires 0
</filesMatch>
```

Caddyfile:
```sh
# 0 days
handle {
  header Cache-Control "no-store, max-age=0"
  header Pragma no-cache
  header Expires 0
  header a-extra-header "without-cache"
}
```

### Súbory CSS / JS a obrázky

Ak súbory neobsahujú citlivé údaje alebo sú stále, nemenia sa často je možné nastaviť agresívnejšie „kešovanie“. Súbory je možné ukladať do vyrovnávacích pamätí na relatívne dlhšiu dobu.

.htaccess:
```Apache
# 30 days
<filesMatch "\.(ico|jpe?g|png|gif|swf|svg|webp)$">
Header set Cache-Control "max-age=2592000, public, stale-while-revalidate=86400, stale-if-error=604800"
</filesMatch>

# 7 days
<filesMatch "\.(css|js)\.br$">
Header set Cache-Control "max-age=604800, public, stale-while-revalidate=86400, stale-if-error=604800"
</filesMatch>
```

nginx.conf:
```Nginx
location ~* \.(ico|pdf|flv|jpg|jpeg|png|gif|js|css|swf)$ {
    add_header Cache-Control "max-age=2592000, stale-while-revalidate=86400, stale-if-error=604800";
}
```

Caddyfile:
```sh
# 30 days
@image-path {
  file
  path *.ico *.png *.jpg *.jpeg *.svg *.webp
}
handle @image-path {
  header Cache-Control "max-age=2592000, public, stale-while-revalidate=86400, stale-if-error=604800"
}

# 7 days
@css-js-path {
  file
  path *.css *.js
}
handle @css-js-path {
  header Cache-Control "max-age=604800, public, stale-while-revalidate=86400, stale-if-error=604800"
}
```

---

## Zdroj

- [developer.mozilla.org-1](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [developer.mozilla.org-2](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [developers.google.com](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)
- [digitalocean.com](https://www.digitalocean.com/community/tutorials/web-caching-basics-terminology-http-headers-and-caching-strategies)
- [keycdn.com](https://www.keycdn.com/blog/http-cache-headers)
- [stackoverflow.com](https://stackoverflow.com/questions/49547/how-do-we-control-web-page-caching-across-all-browsers)
