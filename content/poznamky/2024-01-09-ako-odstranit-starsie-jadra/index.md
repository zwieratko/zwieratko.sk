---
title: "Debian - ako odstrániť staršie jadrá"
date: 2024-01-09T13:12:46+01:00
draft: false
description: Ako bezpečne odstrániť staršie jadrá v prostredí operačného systému Debian / Ubuntu.
type: posts
tags:
  - Linux
  - Ubuntu
  - Debian
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem bezpečne odstrániť staršie jadrá a s nimi súvisiace balíčky v prostredí operačného systému Debian / Ubuntu.

## Upozornenie

Pri pridávaní alebo odoberaní softvérových balíkov s jadrom operačného systému si musím byť úplne istý jednotlivými vykonávanými krokmi.

Nesprávne alebo nepresne zadané príkazy, či príkazy zadané v nesprávnom poradí môžu viesť až k úplnému odstaveniu či znefunkčneniu celého serveru.

## Riešenie

### Kontrola stavu

Najskôr potrebujem zistiť ktoré jadrá vlastne sú v systéme nainštalovane.

Môžem to urobiť pomocou nástroja na správu softvérových balíčkov - `apt`.

```bash
apt list --installed | grep linux-image
```

Alebo to isté, ale pomocou nástroja na správu balíčkov - `dpkg`. Prečo sa grepuje 'i', vid nižšie.

```bash
dpkg --list | grep linux-image | grep '^i'
```

Alebo ešte podrobnejšie, okrem zoznamu jadier, chcem aj zoznam všetkých hlavičkových súborov ku jadrám a ešte aj zoznam jadrových modulov, z nich také, ktoré by mali byt nainštalované, len názvy balíčkov bez popisu, a aby to neboli jadra vo verzii 5 alebo generic.

```bash
dpkg --list | \
grep -i 'linux-image\|linux-headers\|linux-modules' | \
grep '^i' | \
awk '{ print $2 }' | \
grep -v -- '-5\|-generic'
```

Pri výpisoch nastroja `dpkg` je každý balíček na novom riadku a na začiatku každého riadku je pomocou dvoch písmen zobrazený stav v akom sa daný balík nachádza.

Prvé písmeno zobrazuje čo je očakávaný stav balíčku, druhé písmeno zase zobrazuje aktuálny stav balíčku.

Teda napríklad najbežnejšie dvoj kombinácie sú:

- `ii` - balíček by mal byť a aj je nainštalovaný
  - vykonané pomocou `apt install` alebo `dpkg -i`
- `rc` - balíček by mal byť odinštalovaný, ale ostali po ňom konfigy
  - výsledok po `apt remove` alebo `dpkg -r`
- `pn` - balíček by mal byť kompletne odstránený, nie je nainštalovaný vôbec
  - výsledok po `apt purge` alebo `dpkg -P`

Môžem si ešte nechať zobraziť zoznam jadier, z ktorých môžem nabootovať operačný systém.

```bash
find /boot/vmli*
```

A ešte jeden zaujímavý údaj, môžem zobraziť zoznam jadier ktoré budú ponúknuté pri zavádzaní operačného systému v `grub` menu.

```bash
sudo awk -F\' '/menuentry / {print $2}' /boot/grub/grub.cfg
```

### Odstránenie nepotrebných jadier

Ak sú teda nainštalované nejaké staršie verzie jadra, ktoré nepotrebujem a neboli odstránené pri bežnej údržbe systému, môžem ich jednoducho odinštalovať ako iné softvérové balíky.

Mal by som si ponechať ešte aspoň jedno staršie jadro okrem aktuálne bežiaceho (`uname -r`).

>Pri zadávaní nasledujúcich príkazov, ktoré kompletne odstránia všetky vymenované softvérové balíky si musím byť **úplne istý** zapisovanými verziami!

```bash
sudo apt purge linux-image-unsigned-4.19.16-041916-generic linux-image-unsigned-4.19.37-041937-generic
sudo apt purge linux-headers-4.19.16-041916 linux-headers-4.19.16-041916-generic linux-headers-4.19.37-041937 linux-headers-4.19.37-041937-generic
sudo apt purge linux-modules-4.19.16-041916-generic linux-modules-4.19.37-041937-generic
```

Pri korektnom odstránení jadier a s nimi súvisiacich balíčkov dôjde aj ku úprave zoznamu v `grub` menu ponúkaných jadier pri zavádzaní operačného systému.

---

## Zdroj

- [Debian manpage - dpkg](https://manpages.debian.org/bookworm/dpkg/dpkg.1.en.html)
