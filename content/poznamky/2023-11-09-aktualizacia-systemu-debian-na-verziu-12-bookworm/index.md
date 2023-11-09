---
title: "Aktualizácia systému Debian na verziu 12 Bookworm"
date: 2023-11-09T20:22:12+01:00
draft: false
description: Ako aktualizovať serverový operačný systém Debian z verzie 10 Bullseye na najnovšiu stabilnú verziu 11 Bookworm.
type: posts
tags:
  - Debian
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem aktualizovať serverový operačný systém Debian z verzie 11 Bullseye na najnovšiu stabilnú verziu 12 Bookworm. Aktualizáciu chcem uskutočniť počas normálnej prevádzky serveru, bez odstávky, respektíve s minimálnym časom nedostupnosti jednotlivých služieb.

Debian 12 „Bookworm“ bol vydaný 10. júna 2023, posledná aktualizácia – Debian 12.2 bola uvoľnená 7. októbra.

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
sudo apt --purge autoremove
sudo apt autoclean
```

Skontrolujem či v systéme neostali predsa zvyšky po predchádzajúcich aktualizáciách, kópie konfiguračných súborov a tak podobne.

```sh
sudo find /etc -name '*.dpkg-*' -o -name '*.ucf-*' -o -name '*.merge-error'
```

Skontrolujem aj osamotené a lokálne vytvorené balíčky (Obsolete and Locally Created Packages) a prípadne ich odstránim.

```sh
apt list '~o'
# ak to nie je zásadný problém, odstránim ich
sudo apt purge '~o'
```

A ešte skontrolujem aj balíčky tretích strán, nainštalované z úplne iných repozitárov. Je taktiež vhodné odstrániť všetky takéto balíčky.

```sh
sudo apt list '?narrow(?installed, ?not(?origin(Debian)))'

# napr. odstranenie všetkého čo sa týka MongoDB
sudo apt purge mongodb-*
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
# alebo
sudo apt-mark showhold
```

### Záloha

Vykonám zálohu podľa najlepšieho vedomia a svedomia :)

### Aktualizácia repozitárov

Vytvorím záložné kópie zoznamov zdrojov softwaru.

```sh
mkdir ~/aptbackup_2023-10-22
sudo cp -v /etc/apt/sources.list ~/aptbackup_2023-10-22
sudo cp -rv /etc/apt/sources.list.d/ ~/aptbackup_2023-10-22

# môžem overiť, čo som prekopíroval
tree aptbackup_2023-10-22/
```

V originálnych zoznamoch zdrojov nahradím repozitáre pre Debian 11 Bullseye repozitármi pre novší Debian 12 Bookworm.

```sh
sudo sed -i 's/bullseye/bookworm/g' /etc/apt/sources.list
# a tiež aj v Ďalších softwarových zdrojoch
sudo sed -i 's/bullseye/bookworm/g' /etc/apt/sources.list.d/*
# môžem skontrolovať ako to vyzerá
sudo vi /etc/apt/sources.list
```

Na záver tohto kroku vykonám aktualizáciu repozitárov.

```sh
sudo apt update
```

### Minimálna aktualizácia systému

Najskôr vykonám aktualizáciu už nainštalovaných súčasti operačného systému, bez pridávania nových balíčkov.

```sh
sudo apt upgrade --without-new-pkgs
```

### Povýšenie systému na Debian 12 Bookworm

Následne vykonám kompletnú aktualizáciu operačného systému na najnovšiu verziu.

```sh
sudo apt full-upgrade
```

Po úspešnom ukončení aktualizácie vykonám reštartovanie operačného systému. Najskôr však môžem pre istotu skontrolovať správnosť konfigurácie OpenSSH servera, aby som sa mohol po reštarte znova pripojiť.

```sh
# kontrola konfiguraácie OpenSSH servera, ak je nainštalovaný
sudo sshd -t
# ak nenájde chyby môžem reštartovať
sudo systemctl reboot
```

### Odstránenie nepotrebných balíčkov

Po úspešnom povýšení systému môžem odstrániť skôr nainštalované, ale ďalej už nie potrebné balíčky. Odstránim aj všetky stiahnuté balíčky.

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

- [Debian “bookworm” Release Information](https://www.debian.org/releases/bookworm/)
- [How To Upgrade To Debian 12 Bookworm From Debian 11 Bullseye](https://ostechnix.com/upgrade-to-debian-12-from-debian-11/)
- [How to upgrade Debian 11 to Debian 12 bookworm using CLI](https://www.cyberciti.biz/faq/update-upgrade-debian-11-to-debian-12-bookworm/)
- [How to Upgrade Debian 11 to Debian 12 (Bookworm) via CLI](https://www.tecmint.com/upgrade-debian-11-to-12/)