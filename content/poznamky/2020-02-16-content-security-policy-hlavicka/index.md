---
title: "Content-Security-Policy hlavička"
date: 2020-02-16T10:58:05+01:00
draft: true
description: Ako správne nastaviť bezpečnostnú hlavičku odpovede webového servera Content-Security-Policy.
type: posts
tags:
  - Caddy
  - Webový server
  - Content-Security-Policy
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem správne nastaviť `Content-Security-Policy` bezpečnostnú hlavičku odpovede webového servera.

## Upozornenie

Nesprávna implementácia bezpečnostnej hlavičky `Content-Security-Policy` môže viesť až ku úplnému znefunkčneniu webovej stránky. Implementáciu je potrebné prevádzať postupne, po malých krokoch a funkčnosť webu je potrebné kontrolovať po každej vykonanej zmene a na rôznych prehliadačoch. Rôzne časti tejto bezpečnostnej politiky sú podporované rôznym spôsobom na rôznych prehliadačoch.

## Úvod

Hlavička pomáha znížiť riziko [XSS útoku](https://cs.wikipedia.org/wiki/Cross-site_scripting) a iných útokov spočívajúcich vo vkladaní (škodlivého) obsahu do vykresľovanej stránky.

Robí to pomocou techniky explicitného povoľovania (whitelisting) zdrojov. Hlavička na to využíva množstvo parametrov (directives) rozdelených do 5 kategórii:

1. Presne vymenúva miesta odkiaľ môžu byť určité typy súborov, obsahu načítané (kategória parametrov načítania - fetch directives), teda napríklad definuje odkiaľ môže byť sťahovaný JavaScript potrebný pre správne zobrazenie obsahu stránky.

2. Upravuje tiež vlastnosti dokumentu a prostredia pre ktoré sa bezpečnostná politika uplatňuje (kategória parametrov dokumentu - document directives).

3. Určuje aj miesto kam môžu smerovať dáta alebo odkazy, alebo kde môže byť vkladaná stránka (kategória parametrov navigácie - navigation directives).

4. Určujú tiež miesto kam sa majú posielať reporty o porušení a spôsob ako riešiť porušenie týchto pravidiel (parametre reportovania - reporting directives).

5. Parametre definované v iných dokumentoch, ktoré boli začlenené do CSP.

V predvolenom stave sú všetky oblasti úplne povolené, to znamená, že ak nejaký parameter nenastavím vôbec, tak je povolený!

Všetky parametre je možné nastaviť úpravou hlavičky odpovede webového servera `Content-Security-Policy:`. Väčšinu parametrov (s výnimkou `sandbox`, `frame-ancestors`, `report-uri`, `report-to`) je možné nastaviť tiež aj pomocou HTML značky `<meta>`.

## Parametre načítania

### default-src

- definuje povolené zdroje pre viacero oblastí (JavaScript, CSS štýly, obrázky, písma, rámce, HTML5 média, AJAX požiadavky)
- parameter zahrnutý v CSP verzia 1
- používa sa ako záloha, náhrada (fallback) pre prípad, že nebudú vyslovene uvedené tieto parametre načítania (fetch directives):
  - child-src
  - connect-src
  - font-src
  - frame-src
  - img-src
  - manifest-src
  - media-src
  - object-src
  - prefetch-src
  - script-src
  - script-src-elem
  - script-src-attr
  - style-src
  - style-src-elem
  - style-src-attr
  - worker-src
- pozor, nie je však zálohou pre ostatné (rozumej nie fetch) parametre:
  - base-uri
  - form-action
  - frame-ancestors
  - plugin-types
  - report-uri
  - sandbox

### child-src

- povolené zdroje pre vnorené kontexty prehliadača (`<frame>`, `<iframe>`) a pre objekty typu `web workers`
- CSP v2
- v ďalších verziách sa upustí od používania tohto parametru a uprednostní sa používanie `worker-src` a `frame-src`, viď nižšie

### connect-src

- povolené zdroje pre spojenia cez rozhrania skriptov
- API ktoré sú regulované: `<a ping>`, `Fetch`, `XMLHttpRequest`, `Websocket`, `EventSource`, `Navigator.sendBeacon()`
- CSP v1
- napríklad pre správne overenie robots.txt v audite Lighthouse je potrebné, aby bol connect-src 'self' (ak je default-src 'none')

### font-src

- povolené zdroje pre písma
- CSP v1

### frame-src

- povolené zdroje pre vkladané rámce, ako sú HTML elementy `<frame>`, `<iframe>`
- napríklad ak chcem na stránku vložiť video zo stránky `youtube.com` pomocou HTML značky `<iframe>`, musím pri parametri uviesť túto doménu: `frame-src https://www.youtube.com/`
- CSP v1
- ako záloha `child-src`, potom `default-src`

### img-src

- povolené zdroje pre obrázky a favicon
- CSP v1

### manifest-src

- povolené zdroje pre súbory typu manifest
- CSP v3
- nie je podporované v Apple Safari prehliadači

### media-src

- povolené zdroje pre audio a video, ako sú napríklad HTML5 elementy `<audio>`, `<video>`
- CSP v1

### object-src

- povolené zdroje pre elementy ako sú `<object>`, `<embed>`, `<applet>`
- CSP v1

### prefetch-src

- povolené zdroje pre pred načítanie alebo pred vykreslenie (rôzne [techniky](https://css-tricks.com/prefetching-preloading-prebrowsing/) na urýchlenie načítania webovej stránky)
- CSP v3

### script-src

- definuje povolené zdroje pre načítanie obsahu typu JavaScript celkovo
- jemnejšie rozdelenie viď nasledujúce dva parametre
- CSP v1

### script-src-elem

- povolené zdroje pre JavaScript vložený značkami `<script>` a `</script>`
- CSP v3
- ako záloha najskôr `script-src` potom `default-src`
- podporovane len prehliadačoch postavených na Chromiu

### script-src-attr

- povolené zdroje pre `inline` JavaScript zapísaný priamo v HTML značkách (napr. `<body onload="alert('pozor !!!')">`)
- CSP v3
- ako záloha najskôr `script-src` potom `default-src`
- podporovane len prehliadačoch postavených na Chromiu

### style-src

- povolené zdroje pre CSS štýly celkovo
- jemnejšie rozdelenie viď nasledujúce dva parametre
- CSP v1

### style-src-elem

- povolené zdroje pre štýly vložené značkami `<style>`, `</style>`
- povolené zdroje pre štýly uvedené značkou `<link>` ak obsahuje aj `rel="stylesheet"`
- CSP v3
- ako záloha najskôr `style-src` potom `default-src`
- podporovane len prehliadačoch postavených na Chromiu

### style-src-attr

- povolené `inline` CSS štýly v jednotlivých HTML elementoch
- CSP v3
- ako záloha najskôr `style-src` potom `default-src` 
- žiaľ momentálne podporované tiež len v Chrome a spol.

### worker-src

- povolené zdroje pre `Worker`, `SharedWorker` alebo `ServiceWorker`
- CSP v3
- ako záloha `child-src`, potom `script-src`, potom `default-src`
- Chrome 59 a vyššie preskakujú `child-src`

## Parametre dokumentu

### base-uri

- povolené zdroje pre značku `<base>`
- CSP v2
- nemá zálohu, ak nie je uvedené, je povolená akákoľvek URL

### plugin-types

- povolené typy zdrojov, ktoré môžu byť vkladané pomocou značiek `<object>`, `<embed>`, `<applet>`
- CSP v2
- vloženie pomocou vyššie uvedených značiek zlyhá, ak:
  - to čo vkladáme nemá deklarovaný platný MIME typ
  - deklarovaný typ sa nezhoduje s typmi uvedenými v parametri `plugin-types`
  - typ preberaného objektu sa nezhoduje s deklarovaným typom
- nemá zálohu, ak nie je uvedené, je povolený akýkoľvek [MIME typ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)

### sandbox

- `sandbox` je pojem z oblasti počítačovej bezpečnosti, je to mechanizmus na oddelenie bežiacich procesov, zvyčajne kvôli zníženiu rizika zlyhania systému alebo šírenia nejakej zraniteľnosti
- ako parameter CSP obmedzuje vykonávanie niektorých konkrétnych činností na stránke 
- zabraňuje činnostiam ako sú napr. otváranie vyskakovacích okien alebo spúšťanie doplnkov a skriptov, či naopak vyžaduje aby bol sťahovaný obsah z toho istého zdroja ako stránka samotná
- ak nemá uvedené žiadne ďalšie hodnoty zapína všetky obmedzenia
- ak chcem povoliť nejakú činnosť musím ju zadať, viaceré hodnoty oddeľujem medzerou (`sandbox allow-forms allow-scripts;`)
- CSP v1
- zoznam dostupných povolení: `allow-downloads-without-user-activation`, `allow-forms`, `allow-modals`, `allow-orientation-lock`, `allow-pointer-lock`, `allow-popups`, `allow-popups-to-escape-sandbox`, `allow-presentation`, `allow-same-origin`, `allow-scripts`, `allow-storage-access-by-user-activation`, `allow-top-navigation`, `allow-top-navigation-by-user-activation`
- parameter nie je možné nastaviť pomocou značky `<meta>`

## Parametre navigácie 

### form-action

- vymedzuje adresy na ktoré môžu byť zo stránky zasielané formuláre
- CSP v2
- nemá zálohu, ak nie je uvedené, je povolená akákoľvek URL

### frame-ancestors

- povolené zdroje, ktoré môžu vkladať moju stránku pomocou HTML značiek `<frame>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`
- ak nastavím hodnotu na `none`, znamená to, že žiadna iná stránka nemôže vkladať moju stránku ako rámec
- CSP v2
- nemá zálohu, ak nie je uvedené, je povolená akákoľvek URL
- parameter nie je možné nastaviť pomocou značky `<meta>`

### navigate-to

- povolené zdroje kam môže byť iniciovaná navigácia zo stránky akýmkoľvek spôsobom (pomocou značky `<a>`, `<form>` aj pomocou metódy `window.open` alebo pomocou vlastnosti `window.location`)
- ak je nastavený parameter `form-action`, tak toto obmedzenie navigácie sa nebude vzťahovať na navigáciu spôsobenú odoslaním formuláru
- CSP v3
- tento parameter zatiaľ nie je podporovaný žiadnym prehliadačom
- nemá zálohu, ak nie je uvedené, navigácia môže smerovať kamkoľvek

## Parametre reportovania

### report-uri

- zastaraný parameter, neodporúča sa používať ho
- odporúča sa začať používať nový parameter `report-to`, viď nižšie
- no ale keďže nový parameter podporuje zatiaľ len Chrome, tak v prechodnom období je vhodné použiť oba parametre
- parameter definuje URL kam sa majú posielať hlásenia o porušení `Content Security Policy`
- hlásenia sú posielané ako JSON dokument pomocou požiadavky HTTP POST
- CSP v1
- parameter nie je možné nastaviť pomocou značky `<meta>`

### report-to

- definuje miesto kam sa majú posielať hlásenia o porušení `Content Security Policy`
- miesto je hodnota kľúča `group` z inej HTTP hlavičky odpovede [Report-To](https://developers.google.com/web/updates/2018/09/reportingapi) (zapísaná ako JSON)
- okrem kľúča `group` hlavička obsahuje povinné kľúče `max_age` a `endpoints` a nepovinný `include_subdomains`
- kľúč `endpoints` obsahuje pole objektov (dvojica kľúč `"url:"` a hodnota samotná URL)
- CSP v3
- parameter nie je možné nastaviť pomocou značky `<meta>`

## Iné parametre

### block-all-mixed-content

- zablokuje načítavanie akéhokoľvek obsahu ktorý by mal byť nahrávaný cez nezabezpečené spojenie `http:` pokiaľ bola stránka načítaná cez zabezpečené spojenie `https:`

### upgrade-insecure-request

- donúti prehliadač zvýšiť úroveň zabezpečenia HTTP požiadavky na stiahnutie nejakého obsahu z `http:` na `https:` pokiaľ bola stránka načítaná cez zabezpečené spojenie `https:`

## Zoznam dostupných zdrojov

### adresa hostiteľa

- adresa hostiteľa zdroja pre nahrávanie obsahu daného typu
- adresa môže byť uvedená v rôznych podobách:
  - kompletná URL s protokolom a doménou `https://*.zwieratko.sk`
  - doména a číslo portu `zwieratko.sk:443`
  - len typ protokolu `https:`
- napr. `frame-src https://www.google.com` -- táto politika umožňuje na stránke zobraziť okrem iného mapu vloženú pomocou HTML značky `<iframe>`, potrebný obsah môže byť nahrávaný len z adresy `https://www.google.com`
- iný príklad: `default-src https:` -- nie veľmi bezpečná politika, lebo viac menej akýkoľvek obsah (obrázky, písma, štýly, skripty, atď.) môže byť získaný odkiaľkoľvek z internetu, stačí len aby to bolo pomocou zabezpečeného spojenia `https:`

### * (znak hviezdička)

- umožní nahrávať požiadavku odkiaľkoľvek
- veľmi nebezpečné, je to aj východiskové nastavenie (ak nie je uvedené nič)
- napr. `img-src *` -- požadovaný obrázok je možné získať akokoľvek, odkiaľkoľvek

### 'none'

- zabráni nahrávať z akéhokoľvek zdroja
- odporúčané východiskové nastavenie pre všetky parametre
- napr. `default-src 'none'` -- stránka nemôže získať žiadne dodatočné zdroje pre zobrazenie obsahu (štýly, skripty, písma, média atď.)

### 'self'

- obsah môže byť stiahnutý len pomocou toho istého protokolu a z tej istej domény aj portu ako má samotná stránka
- napr. `style-src 'self'` -- stránka môže použiť pri vykresľovaní len tie štýly, ktoré sú získané z tej istej domény, portu a pomocou toho istého protokolu ako stránka samotná
- čiže pri tejto politike môže napr. prehliadač zobrazujúci stránku z adresy https://zwieratko.sk načítať potrebné súbory .css len z adresy https://zwieratko.sk/ ale už nie z adresy http://zwieratko.sk/ alebo akejkoľvek inej domény

### data:

- umožní na sťahovanie prostriedkov použiť protokol `data:`
- napr. `img-src data:` -- stránka môže zobraziť obrázky zakódované pomocou `Base64` a získané cez protokol `data:`

### 'unsafe-inline'

- umožňuje použiť prostriedky, ktoré sa nachádzajú priamo v dokumente stránky, `inline` CSS štýly alebo skripty
- napr. `style-src-attr 'unsafe-inline'` -- 

### 'unsafe-eval'

- umožňuje použiť prostriedky, ktoré sa vytvoria dynamicky, počas načítania stránky
- napr. JavaScript vytvorený z reťazca pomocou `eval()`

### 'strict-dynamic'

- umožňuje skriptom načítať ich závislosti bez toho aby tu boli vyslovene uvedené

## Riešenie

1. presne a jasne určiť všetky zdroje potrebné na správne zobrazenie stránky
2. vytvoriť prvotný návrh CSP, kde bude všetko okrem potrebných zdrojov zakázané
3. nasadiť hlavičku CSP v režime `Report-Only`
4. 

### Pokus a omyl

Jednou z metód ako implementovať CSP bezpečnostnú hlavičku je najskôr všetky zdroje zakázať, potom testovať jednotlivé časti webu vo vývojárskom doplnku prehliadača a postupne potrebné zdroje pridávať a povoľovať. Takzvaná metóda pokus a omyl :), ale aspoň sa pri nej niečo priučím.

Takže na začiatku všetky zdroje zakážem, pre prehľadnosť to nie je celá hlavička a každý parameter je na novom riadku:

```
default-src 'none'
base-uri 'none'
form-action 'none'
frame-ancestors 'none'
plugin-types 'none'
report-uri 'https://mojadomena.report-uri.com/r/d/csp/enforce'
```

Pokúsim sa stránku načítať a zobraziť v prehliadači so zapnutým doplnkom pre vývojárov (napr. v Chrome je to DevTools). V prípade, že sa stránka pokúsila pri vykresľovaní obsahu načítať niečo aj zo zdrojov ktoré sú zakázané, tak vo vývojárskom doplnku, v časti `Konzola` uvidím chybové hlásenia typu:

> Refused to load the image 'http://192.168.3.34:8080/favicon.ico' because it violates the following Content Security Policy directive: "default-src 'none'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. --- (Google Chrome DevTools Console)

> Content Security Policy: Na základe nastavení stránky bolo zablokované načítanie zdroja http://192.168.3.34:8080/favicon.ico ("default-src"). --- (Konzola vo vývojárskych nástrojoch, Mozilla Firefox)

Z takého hlásenia zistím, že nebolo možné načítať obrázok -- favicon z koreňového adresára stránky, lebo keďže nie je nastavený parameter `img-src` použil sa ako náhradný parameter `deafult-src` a ten ma hodnotu `none` a teda nie je možné nahrávať žiaden obsah zo žiadneho zdroja.

Aby som prehliadaču povolil pri zobrazovaní stránky načítať aj favicon, musím pridať parameter `img-src 'self'`. Po pridaní, zmene parametra musím stránku znovu načítať a skontrolovať hlásenia v konzole.

Takto musím prejsť každú jednu zobrazovanú stránku na celom webe a vyriešiť všetky chybové hlásenia týkajúce sa CSP. Pri rozsiahlych weboch s veľkým množstvom obsahu z rôznych zdrojov je to žiaľ veľmi pomalý proces.

---

## Zdroj

- [www.w3.org](https://www.w3.org/TR/CSP3/)
- [developers.google.com](https://developers.google.com/web/fundamentals/security/csp)
- [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [content-security-policy.com](https://content-security-policy.com/)
- [CSP Cheat Sheet](https://scotthelme.co.uk/csp-cheat-sheet/)
