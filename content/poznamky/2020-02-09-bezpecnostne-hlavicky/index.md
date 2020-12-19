---
title: "Bezpečnostné hlavičky"
date: 2020-02-09T16:39:40+01:00
draft: false
description: Ako správne nastaviť bezpečnostné hlavičky odpovede webového servera.
type: posts
tags:
  - Caddy
  - Webový server
  - Bezpečnosť
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem správne nastaviť bezpečnostné hlavičky odpovede webového servera.

Toto je veľmi rozsiahla problematika. Furt keď mám pocit, že už je to hotové, tak sa dočítam o niečom novom, alebo pribudne ďalšia špecifikácia atď.

## Riešenie

HTTP hlavičky vo všeobecnosti umožňujú výmenu dodatočných informácii medzi webovým serverom a klientom.

Bezpečnostné hlavičky (HTTP security headers) odpovede webového servera nastavujú alebo upravujú vlastnosti a správanie webového servera -- stránky vo vzťahu ku klientovi --  prehliadaču. Snažia sa zabrániť, aby sa webový prehliadač stal terčom útoku, zabraňujú zneužitiu známych bezpečnostných zraniteľností.

Nastaviť ich môžem v konfiguračnom súbore pre daný server. Hlavička má vždy presne stanovený názov a jeden alebo viac parametrov, ktoré môžu mať nejakú hodnotu.

## Upozornenie

Nepresná alebo nesprávna implementácia bezpečnostných hlavičiek môže viesť až ku úplnému znefunkčneniu webového servera. Bezpečnostné hlavičky sú veľmi dôležité, no je tak isto veľmi dôležité ich bezchybné a správne nastavenie. Pred ich nasadením na produkčných serveroch je potrebné dôkladné testovanie.

## Strict-Transport-Security

Hlavička zabezpečí aby sa prehliadač pripájal ku webovému serveru výhradne a len cez zabezpečený protokol [HTTPS](https://cs.wikipedia.org/wiki/HTTPS) a teda nie cez nezabezpečený protokol HTTP.

Má niekoľko parametrov:

- `mag-age` -- (povinný parameter) v sekundách určí koľko si má webový prehliadač zapamätať, že daný web je dostupný výhradne cez **HTTPS** a nie cez HTTP. Hodnota má byť dostatočne vysoká. Aspoň dva roky, to je 63072000 sekúnd

- `includeSubDomains` -- (voliteľný parameter) nastaví, že pravidlo platí aj pre všetky podriadené domény

- `preload` -- (voliteľný parameter) zabezpečí, že prehliadač sa ku danému webu nebude už nikdy pripájať cez nezabezpečené HTTP. Je to vlastne [zoznam domén](https://hstspreload.org/) ku ktorým sa majú prehliadače pripájať len cez HTTPS, v ktorom si prehliadač overuje, či tam doména je uvedená, spravuje ho Google

```
Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
```

---

## X-Content-Type-Options

Hlavička oznamuje prehliadaču aby neprechádzal jednotlivé súbory na serveri a nesnažili sa odhadnúť či zmeniť [MIME typ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) jednotlivých súborov, ale riadil sa výhradne informáciou z hlavičky `Content-Type`. Hlavička zabraňuje tomu, aby prehliadač interpretoval súbory, ktoré mu server posiela inak než je deklarované.

Hlavička má jediný povinný parameter `nosniff`.

```
X-Content-Type-Options "nosniff"
```

Hlavička zablokuje požiadavky:
- ak je cieľom požiadavky CSS štýl a zároveň je jeho MIME typ iný ako text/css
- ak je cieľom požiadavky script a zároveň je jeho MIME typ iný ako:
    - application/ecmascript
    - application/javascript
    - application/x-ecmascript
    - application/x-javascript
    - text/ecmascript
    - text/javascript
    - text/javascript1.0
    - text/javascript1.1
    - text/javascript1.2
    - text/javascript1.3
    - text/javascript1.4
    - text/javascript1.5
    - text/jscript
    - text/livescript
    - text/x-ecmascript
    - text/x-javascript 

Hlavička taktiež zapína mechanizmus [Cross-Origin Read Blocking](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md) pre MIME typy:
- text/html
- text/plain
- text/json
- application/json
- */*+json (aj akýkoľvek iný typ s rozšírením JSON)
- text/xml
- application/xml
- */*+xml (aj akýkoľvek iný typ s rozšírením XML s výnimkou image/svg+xml)

---

## X-XSS-Protection

Hlavička má zabezpečiť zastavenie načítania stránky pri detekcii [XSS útoku](https://cs.wikipedia.org/wiki/Cross-site_scripting). Od jej užívania sa upúšťa, funkciu hlavičky môže nahradiť správne nastavená hlavička [Content-Security-Policy](#content-security-policy). `X-XSS-Protection` hlavička má zmysel pri snahe podporovať staršie verzie prehliadačov.

Má povinný parameter, ktorý môže mať jednu z hodnôt:
- `0` -- filter je vypnutý
- `1` -- filter je zapnutý a pri detekcii útoku sa prehliadač snaží stránku vyčistiť odobraním nebezpečných častí
- `1; mode=block` -- filter je zapnutý a pri detekcii útoku prehliadač načítanie stránky zablokuje
- `1; report=adresa.sk` -- (parameter len pre prehliadače z rodiny chromium) filter je zapnutý, pri detekcii útoku sa prehliadač snaží stránku vyčistiť a odoslať report

```
X-XSS-Protection "1; mode=block"
```

---

## X-Frame-Options

Hlavička môže zabrániť vkladaniu obsahu stránky do iných stránok pomocou elementov ako sú `frame`, `ifram`, `object`, `embed`. Mala by zabrániť útoku typu [clickjacking](https://cs.wikipedia.org/wiki/Clickjacking). Hlavička môže byť nahradená pomocou [Content-Security-Policy](#content-security-policy) a má ju zmysel zachovať opäť skôr kvôli podpore starších prehliadačov.

Hlavička má jediný povinný parameter, ktorý môže byť nastavený na jednu z hodnôt:

- `deny` -- zabráni akémukoľvek vkladaniu stránky pomocou HTML elementov
- `sameorigin` -- stránka môže byť vkladaná pomocou HTML značiek, ale len z tej istej domény ako web
- `allow-from domena.sk` -- stránka môže byť vkladaná do stránky na danej doméne (toto nie je podporované v moderných prehliadačoch)
- modernejšou verziou tejto hlavičky je CSP parameter [frame-ancestors](/poznamky/2020-02-16-content-security-policy-hlavicka/#frame-ancestors)

```
X-Frame-Options "SAMEORIGIN"
```

---

## Public-Key-Pins

Od tejto hlavičky sa chvála Bohu [definitívne upúšťa](https://scotthelme.co.uk/hpkp-is-no-more/).

Úprimne povedané nikdy som nepochopil ako ju implementovať :)

---

## Content-Security-Policy

Veľmi dôležitá hlavička. Na jej vývoji sa aktívne pracuje, momentálne existuje vo verzii 3. CSP hlavička odpovede webového servera presne vymedzuje z akých zdrojov a ako môže stránka načítať a používať rôzny obsah (napr. CSS štýly, JavaScript, písma).

Hlavička má veľké množstvo parametrov. Spôsob povoľovania zdrojov je veľmi jemne rozdelený a teda jednotlivé oblasti je možné presne vymedziť.

Je potrebné byť nanajvýš opatrný, nesprávnym nastavením tejto hlavičky je jednoduché zablokovať časť stránky, alebo ju až úplne znefunkčniť.

```
Content-Security-Policy: default-src https:
```

Kvôli množstvu parametrov podrobnejšie v samostatnej poznámke [Content-Security-Policy hlavička](/poznamky/2020-02-16-content-security-policy-hlavicka/).

---

## Permissions-Policy

Pôvodne sa táto hlavička volala `Feature-Policy` no na jeseň 2020 došlo k premenovaniu na `Permissions-Policy` a zmenil sa aj formát zápisu. Pre porovnanie viď nižšie formát zápisu oboch.

Hlavička umožňuje povoľovať, zakazovať a meniť pristup ku rôznym vlastnostiam a funkciám prehliadača. Podobne ako CSP kontroluje bezpečnosť tým, že reguluje prístup webovej stránky ku zdrojom obsahu, tak FP kontroluje bezpečnosť a súkromie tým, že reguluje prístup webovej stránky ku funkciám webového prehliadača.

Parametrom je vlastnosť prehliadača a typ povolenie pre danú vlastnosť, vlastností je mnoho, oddeľujú sa bodkočiarkou. Nie každá vlastnosť je podporovaná vo všetkých prehliadačoch.

Povolenie môže mať hodnotu:

- `none` -- funkcia prehliadača je zakázaná pre akékoľvek požiadavky
- `self` -- funkcia je povolená, ale len pre požiadavky z tej iste domény ako samotný web
- `*` -- odkiaľkoľvek
- `domena.sk` -- z konkrétnej domény

```
Feature-Policy "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; geolocation 'self'; microphone 'none'; payment 'none'"
Permissions-Policy "accelerometer=(), autoplay=(), camera=(), geolocation=(self), microphone=(), payment=()"
```

---

## Referrer-Policy

Hlavička nastavuje aké množstvo informácii o odkazujúcej stránke bude odoslaných v hlavičke `Referer` spolu so žiadosťou stránke kam smeruje požiadavka.

Jediný parameter je povinný:

- `no-referrer` -- žiadne informácie nebudú odoslané
- `no-referrer-when-downgrade` -- prednastavená hodnota v prípade, že politika nie je špecifikovaná, alebo je nastavená nesprávne, celá adresa o tom odkiaľ prichádza požiadavka bude odoslaná, ale len v prípade, že úroveň zabezpečenia protokolu je rovnaká (HTTP->HTTP, HTTPS->HTTPS), alebo sa zvyšuje (HTTP->HTTPS), no nesmie sa znížiť (HTTPS->HTTP)
- `origin` -- bude odoslaná len doména, teda nie presná a celá adresa (nebude odoslaná časť za lomkou za doménou a časť za znakom otáznik)
- `origin-when-cross-origin` -- odošle celú adresu, ale len v prípade, že odkaz smeruje niekam v rámci tej istej domény, inak pošle len doménu
- `same-origin` -- bude odoslaná celá adresa, ale len v rámci tej istej domény, ak bude odkaz smerovať mimo doménu, nebude odoslaná žiadna informácia
- `strict-origin` -- bude odoslaná len doména, teda nie presná a celá adresa a aj to len v prípade, že sa nezníži úroveň zabezpečenia protokolu
- `strict-origin-when-cross-origin` -- v rámci tej istej domény bude odoslaná celá adresa a mimo doménu len doménová časť a aj to len v prípade, že úroveň zabezpečenia sa nezníži, inak nebude odoslaná žiadna informácia
- `unsafe-url` -- odoslaná bude celá informácia (teda aj doména aj časť adresy za lomkou za doménou a aj časť za znakom otáznik) bez ohľadu na to kam smeruje požiadavka

```
Referrer-Policy "no-referrer-when-downgrade"
```

---

## Expect-CT

Hlavička núti prehliadač overiť si správnosť vydaného certifikátu pomocou mechanizmu [Certificate Transparency](https://www.certificate-transparency.org/) a umožní prehliadaču posielať report v prípade, že certifikát nie je v poriadku.

Má niekoľko parametrov:

- `max-age` -- čas v sekundách po prijatí hlavičky, počas ktorého bude prehliadač považovať odosielajúci server za známeho ECT hostiteľa
- `enforce` -- (voliteľný parameter) núti prehliadač odmietať spojenia v prípade, že vydaný certifikát nie je správny 
- `report-uri` -- (voliteľný parameter) adresa kam je potrebné posielať hlásenie o nesprávnosti vydaného certifikátu

```
Expect-CT "enforce, max-age=86400, report-uri=https://mojadomena.report-uri.com/r/d/ct/enforce"
```

---

## Server

Hlavičky s názvami a verziami používaného softvéru je naopak potrebné _**vypnúť**_, alebo ich hodnotu nastaviť zámerne na nesprávnu.

Informácia o skutočnom type a verzii webového serveru na ktorom beží stránka môžu uľahčiť prácu útočníkovi, keďže k rôznym verziám môžu byť známe rôzne bezpečnostné diery a zraniteľnosti.

Caddyfile:
```
Server "StarTrek_007"
```

.htaccess:
```
ServerSignature Off
Header unset Server
Header unset X-Powered-By
```

*Poznámka* -- `ServerSignature` nie je hlavička, ale rieši podobnú vec.

---

## Cache-Control

Hlavička určuje kde, ako dlho a ako môže či nemôže byť rôzny obsah z webového servera ukladaný do rôznych vyrovnávacích pamätí.

Z hľadiska bezpečnosti a ochrany súkromia je vhodnejšie citlivý obsah, ktorý sa môže prenášať z webového servera do prehliadača neukladať do zdieľanej vyrovnávacej pamäte `private`, alebo neukladať žiaden obsah do žiadnej vyrovnávacej pamäte `no-store`.

```
Cache-Control "private, no-cache, no-store, no-transform, must-revalidate, proxy-revalidate, max-age=0"
Pragma no-cache
Expires 0
```

Podrobnejšie o ukladaní obsahu z webového servera do vyrovnávacej pamäte v závislosti od typu obsahu v samostatnej poznámke [Cache-Control hlavička](/poznamky/2020-02-13-cache-control-hlavicka/).

---

## Overenie

Správnosť implementácie bezpečnostných hlavičiek si môžem overiť na rôznych stránkach:

- [securityheaders.com](https://securityheaders.com/)
- [observatory.mozilla.org](https://observatory.mozilla.org/)
- [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com/)

Overenie spočíva v kontrole prítomnosti hlavičky, vo vyhodnotení formálnej správnosti zápisu a vo vyhodnotení dostatočnej prísnosti jednotlivých bezpečnostných politík.

---

## Príklady

### Caddy

Caddyfile:
```sh
header / {
  Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  X-Content-Type-Options "nosniff"
  X-XSS-Protection "1; mode=block"
  X-Frame-Options "SAMEORIGIN"
  Public-Key-Pins "pin-sha256=\"sha256...=\" ; pin-sha256=\"sha256...=\" ; max-age=600 ; includeSubdomains ; report-uri=\"https://mojadomena.report-uri.com/r/d/hpkp/enforce\""
  Content-Security-Policy "upgrade-insecure-requests; block-all-mixed-content; default-src 'none' ; base-uri 'none' ; style-src 'self' 'sha256-z7zcnw/4WalZqx+PrNaRnoeLz/G9WXuFqV1WCJ129sg=' ; style-src-attr 'unsafe-inline' ; font-src 'self' data: ; img-src 'self' ; script-src 'nonce-h2q368NFu1IFU8SoxDwpsg==' 'nonce-rAnd0mNumb3r==' 'unsafe-inline' 'strict-dynamic' https: ; frame-src https://docs.google.com/ https://www.google.com/ ; child-src 'none' ; object-src 'none' ; manifest-src 'self' ; connect-src 'self' ; form-action 'self' ; frame-ancestors 'self' ; report-uri https://mojadomena.report-uri.com/r/d/csp/enforce "
  Feature-Policy "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; geolocation 'self'; microphone 'none'; payment 'none'"
  Referrer-Policy "no-referrer-when-downgrade"
  Expect-CT "enforce, max-age=600, report-uri=https://mojadomena.report-uri.com/r/d/ct/enforce"
  node "zwerina-01"
  Server "StarTrek_007"
  Cache-Control "private, no-cache, no-store, no-transform, must-revalidate, proxy-revalidate, max-age=0"
  Pragma no-cache
  Expires 0
}
```

---

### Apache

.htaccess:
```Apache
<IfModule mod_headers.c>
  Header set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header set Content-Security-Policy "default-src 'none'; font-src https://fonts.gstatic.com data:; frame-src https://www.google.com; img-src 'self' https://dummyimage.com https://picsum.photos https://i.picsum.photos; style-src 'self' https://fonts.googleapis.com ; style-src-attr 'unsafe-inline' ; script-src 'nonce-rAnd0mNumb3r==' 'unsafe-inline' 'strict-dynamic' https: ; manifest-src 'self' ; connect-src 'self' ; form-action 'self' ; frame-ancestors 'none'; base-uri 'none'; report-uri https://mojadomena.report-uri.com/r/d/csp/enforce"
  Header set Feature-Policy "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; geolocation 'self'; microphone 'none'; payment 'none'"
  Header set Referrer-Policy "no-referrer-when-downgrade"
  Header set Expect-CT "enforce, max-age=600, report-uri=https://mojadomena.report-uri.com/r/d/ct/enforce"
  Header always unset Server
  Header always unset X-Powered-By
  <filesMatch "\.(x?html?|php)$">
  Header always set Cache-Control "private, no-cache, no-store, no-transform, must-revalidate, proxy-revalidate, max-age=0"
  Header always set Pragma "no-cache"
  Header always set Expires 0
  </filesMatch>
</IfModule>
```

---

### Nginx

security.conf:
```Nginx
# security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

---

## Zdroj

- [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#Security)
- [scotthelme.co.uk](https://scotthelme.co.uk/)
- [securityheaders.cz](https://securityheaders.cz/)
- [developers.google.com](https://developers.google.com/web/updates/2018/06/feature-policy)
- [w3c.github.io](https://w3c.github.io/webappsec-permissions-policy/)
- [httpwg.org](https://httpwg.org/)
