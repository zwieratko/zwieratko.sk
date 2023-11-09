---
title: "Aktualizácia systému Debian na verziu 11 Bullseye"
date: 2021-11-29T19:10:12+01:00
draft: false
description: Ako aktualizovať serverový operačný systém Debian z verzie 10 Buster na najnovšiu stabilnú verziu 11 Bullseye.
type: posts
tags:
  - Debian
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem aktualizovať serverový operačný systém Debian z verzie 10 Buster na najnovšiu stabilnú verziu 11 Bullseye. Aktualizáciu chcem uskutočniť počas normálnej prevádzky serveru, bez odstávky, respektíve s minimálnym časom nedostupnosti jednotlivých služieb.

Debian 11 „Bullseye“ bol vydaný 14. augusta 2021, posledná aktualizácia -- Debian 11.8 bola uvoľnená 7. októbra 2023.

## Upozornenie

Proces povýšenia operačného systému je delikátna záležitosť zložená z viacerých po sebe nasledujúcich krokov. Je veľmi dôležité úplne porozumieť jednotlivým krokom a dodržať ich presné poradie.

Nesprávne alebo nepresne zadané príkazy, či príkazy zadané v nesprávnom poradí môžu viesť až k úplnému odstaveniu či znefunkčneniu celého serveru.

## Riešenie

### Bežná aktualizáciu systému

Pred samotnou aktualizáciou operačného systému na novšiu verziu vykonám tradičnú aktualizáciu všetkých nainštalovaných súčastí.

```sh
sudo apt update
apt list --upgradable
sudo apt upgrade
sudo apt full-upgrade
```

Odstránim všetky skôr nainštalované, ale už nepotrebné balíčky a ich súčasti a odstránim aj všetky pred tým stiahnuté balíčky.

```sh
sudo apt autoremove
sudo apt autoclean
```

Skontrolujem či v systéme neostali predsa zvyšky po predchádzajúcich aktualizáciách, kópie konfiguračných súborov a tak podobne.

```sh
sudo find /etc -name '*.dpkg-*' -o -name '*.ucf-*' -o -name '*.merge-error'
```

Ak som s výsledkom spokojný, reštartujem počítač, aby sa všetky vykonané zmeny naplno prejavili.

```sh
sudo systemctl reboot
```

### Kontrola stavu pred povýšením

Skontrolujem stav jednotlivých nainštalovaných balíčkov a ich pripravenosť na aktualizáciu. Výstup nasledujúceho príkazu zobrazí všetky balíčky, ktoré sa nepodarilo správne nainštalovať (majú príznaky ako napr. `Half-Installed` alebo `Failed-Config`).

```sh
sudo dpkg --audit
```

Skontrolujem či nemajú niektoré balíčky nastavený príznak `hold` (pozdržať pred aktualizáciou).

```sh
sudo dpkg --get-selections | grep 'hold$'
sudo apt-mark showhold
```

### Záloha

Vykonám zálohu podľa najlepšieho vedomia a svedomia.

### Aktualizácia repozitárov

Vytvorím záložné kópie zoznamov zdrojov softwaru.

```sh
mkdir ~/aptbackup
sudo cp -v /etc/apt/sources.list ~/aptbackup
sudo cp -rv /etc/apt/sources.list.d/ ~/aptbackup
```

V originálnych zoznamoch zdrojov nahradím repozitáre pre Debian 10 Buster repozitármi pre novší Debian 11 Bullseye.

```sh
sudo sed -i 's/buster/bullseye/g' /etc/apt/sources.list
sudo sed -i 's/buster/bullseye/g' /etc/apt/sources.list.d/*
```

Debian 11 mierne pozmenil spôsob pomenovania repozitáru s bezpečnostnými opravami. Pôvodný názov repozitáru napríklad `buster/updates` sa zmenil na `bullseye-security`. Viď bod 5.1.3 [zoznamu možných problémov](https://www.debian.org/releases/bullseye/amd64/release-notes/ch-information.sk.html#security-archive) pri prechode na Bullseye.

Preto si ako administrátor otvorím konfiguračný súbor so zoznamom softwarových zdrojov.

```sh
sudo nano /etc/apt/sources.list
```

Potom v nich vyhľadám (v zoznamoch zdrojov) riadky končiace sa reťazcom `bullseye/updates main` a upravím ich na:

```
deb http://deb.debian.org/debian-security bullseye-security main
deb-src http://deb.debian.org/debian-security bullseye-security main
```

Po všetkých úpravách by nakoniec zoznam zdrojov mal vyzerať takto:

```
deb http://deb.debian.org/debian bullseye main
deb-src http://deb.debian.org/debian bullseye main

deb http://deb.debian.org/debian-security/ bullseye-security main
deb-src http://deb.debian.org/debian-security/ bullseye-security main

deb http://deb.debian.org/debian bullseye-updates main
deb-src http://deb.debian.org/debian bullseye-updates main
```

Na záver tohto kroku vykonám aktualizáciu repozitárov.

```sh
sudo apt update
```

### Minimálna aktualizácia systému

Najskôr vykonám aktualizáciu už nainštalovaných súčasti operačného systému. Aktualizujú sa také balíčky, ktoré je možné aktualizovať bez toho aby sa pridávali alebo odstraňovali ďalšie súvisiace balíčky.

```sh
sudo apt upgrade --without-new-pkgs
```

### Povýšenie systému na Debian 11 Bullseye

Následne vykonám kompletnú aktualizáciu operačného systému na najnovšiu verziu.

```sh
sudo apt full-upgrade
```

Po úspešnom ukončení aktualizácie vykonám reštartovanie operačného systému.

```sh
sudo systemctl reboot
```

### Odstránenie nepotrebných balíčkov

Po vydarenom povýšení systému môžem odstrániť skôr nainštalované, ale ďalej už nie potrebné balíčky. Odstránim aj všetky stiahnuté balíčky.

```sh
sudo apt --purge autoremove
sudo apt autoclean
```

### Príprava na ďalšie vydanie

Na záver vykonám kontrolu, nechám si vypísať zoznam odstránených balíčkov po ktorých mohlo v systéme niečo ostať (napr. konfiguračné súbory a podobne).

```sh
sudo dpkg -l | awk '/^rc/ { print $2 }'
```

Ak mi je jasné o aké balíčky ide a som si istý, že ich môžem kompletne so všetkým odstrániť, vykonám to:

```sh
sudo apt purge $(dpkg -l | awk '/^rc/ { print $2 }')
```

Ešte posledný reštart.

```sh
sudo systemctl reboot
```

A to by už malo byť vážne všetko.

---

## Zdroj

- [Debian “bullseye” Release Information](https://www.debian.org/releases/bullseye/)
- [Upgrades from Debian 10 (buster)](https://www.debian.org/releases/stable/mips64el/release-notes/ch-upgrading.en.html)
- [How To Upgrade To Debian 11 Bullseye From Debian 10 Buster](https://ostechnix.com/upgrade-to-debian-11-bullseye-from-debian-10-buster/)
