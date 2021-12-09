---
title: "Prehľadať riadky a doplniť reťazce"
date: 2020-02-21T08:00:44+01:00
draft: false
description: Ako prehľadať súbor, na základe kritéria v ňom nájsť riadky a doplniť na začiatok takých riadkov nejaký reťazec.
type: posts
tags:
  - Reťazce
  - Bash
  - Linux
categories:
  - Poznámky
toc: false
---

## Cieľ

Chcem prehľadať súbor, na základe kritéria v ňom nájsť riadky a doplniť na začiatok takých riadkov nejaký reťazec.

Pri vytváraní logov nastala zmena (z ničoho nič, sama od seba :) a od istého dátumu sa riadok nezačína IP adresou, ale inými dvoma údajmi. Pri analýze logu viem niektoré údaje preskočiť. A keďže chcem v jednom kroku spracovať širšie časové rozpätie a postupnosť informácii nie je rovnaká v každom riadku, potrebujem všetky riadky nezačínajúce sa IP adresou doplniť o dva ľubovoľné reťazce, aby som zjednotil formu postupnosti údajov vo všetkých riadkoch v logu. Následne môžem logy štandardne spracovať.

## Riešenie

Použijem príkaz `sed`. Prepínač `-i` určí, že sa operácia vykoná priamo na mieste v zadanom súbore.

```sh
/bin/sed -i '/^2020/! s/^/hmm hmm /' /home/uzivatel/TEMP/temp.log
```

Prehľadám celý súbor `temp.log` a do každého riadku, ktorý sa nezačína `/^..../!` reťazcom `2020` vložím na začiatok `s/^/` reťazec `hmm hmm `.

Hmmm, no neviem či je toto práve najčistejšie riešenie, ale funguje :). Zatiaľ.

---

## Zdroj

- [www.gnu.org](https://www.gnu.org/software/sed/manual/sed.html)
