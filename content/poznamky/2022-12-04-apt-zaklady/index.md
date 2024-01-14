---
title: APT (Advanced package tool) – základy
date: 2022-12-04T22:29:06+01:00
draft: false
description: Ako používať APT (Advanced package tool) správne a efektívne.
type: posts
tags:
  - Debian
  - Linux
  - APT
  - Správca balíčkov
categories:
  - Poznámky
series:
  - APT
toc: true
---

## Cieľ

Chcem zosumarizovať získané poznatky o správnom a efektívnom používaní systému na správu softvérových balíčkov (APT) v operačnom systéme Debian / Ubuntu.

## Upozornenie

Táto poznámka je len môj osobný a veľmi zjednodušený pohľad na prácu s APT. Nie je to v žiadnom prípade pokus o oficiálny a ani neoficiálny preklad dokumentácie. Neúmyselne tu môžu byť uvedené nepresné informácie alebo chyby!

Príkaz `apt` je vyslovene určený na prácu v terminály a nie je vhodný na použitie v skriptoch, v tých je vhodné v prípade potreby použiť `apt-get`, `apt-cache`.

## Riešenie

### Aktualizácia údajov

- `apt update` – aktualizuje údaje o dostupných softvérových balíčkoch

```bash
sudo apt update
```

Spustenie vyžaduje administrátorské oprávnenie, preto je potrebné použiť `sudo`.

Údaje o balíčkoch je potrebné aktualizovať priebežne na dennej báze, po každej zmene v nastavení repozitárov (pridanie, odobranie, zmena) aj pred každou inštaláciou nového softvéru.

---

### Informácie o balíkoch

- `apt show` – zobrazí súhrne informácie o softvérovom balíčku dostupnom z nastavených úložísk.

```bash
apt show caddy
```

V prípade, že požadovaný balíček nie je dostupný, systém odpovie jasne `N: Unable to locate package caddy`, ak je dostupný, výstup sú informácie o ňom (názov, verzia, správca, veľkosť atď.):

```
Package: caddy
Version: 2.6.2
Priority: optional
Maintainer: Matthew Holt <mholt@users.noreply.github.com>
Installed-Size: 38.1 MB
Homepage: https://caddyserver.com
Download-Size: 14.4 MB
APT-Manual-Installed: yes
APT-Sources: https://apt.fury.io/caddy  Packages
Description: Caddy - Powerful, enterprise-ready, open source web server with automatic HTTPS written in Go
```

- `apt list` – zobrazí dostupné verzie zadaného balíčku

```bash
apt list -a hugo
```

Ak použijem aj prepínač `-a` budú zobrazené všetky dostupné verzie požadovaného balíčku. Na konci riadku s názvom balíčku môže byť v hranatých zátvorkách uvedené `[installed]` ak je už daný balíček nainštalovaný.

```
Listing... Done
hugo/bullseye-backports 0.104.3-1~bpo11+1 amd64
hugo/stable 0.80.0-6+b5 amd64
```

- `apt-cache policy` – zobrazí zoznam dostupných verzii zadaného balíčku aj s prioritou repozitárov v ktorých sa nachádza.

```bash
apt-cache policy hugo
```

Systém zobrazí informáciu o verzii, ktorá už je (`Installed:`) resp. bude (`Candidate:`) nainštalovaná plus tabuľku všetkých dostupných verzii balíčku z nastavených repozitárov (jednotlivé repozitáre môžu mať nastavenú rôznu [prioritu](https://debian-handbook.info/browse/stable/sect.apt-get.html#sect.apt.priorities)). Prednosť pri inštalácii má balíček z úložiska s najvyšším číslom – najvyššou prioritou:

```
hugo:
  Installed: (none)
  Candidate: 0.80.0-6+b5
  Version table:
     0.104.3-1~bpo11+1 100
        100 http://deb.debian.org/debian bullseye-backports/main amd64 Packages
     0.80.0-6+b5 500
        500 http://deb.debian.org/debian bullseye/main amd64 Packages
```

- `apt-cache depends` – zobrazí zoznam balíčkov na ktorých je zadaný balík závislý, a teda bude potrebné ich nainštalovať spolu s ním

```bash
apt-cache depends htop
```

Odpoveď je zoznam balíkov zoradený podľa [stupňa závislosti](https://www.debian.org/doc/debian-policy/ch-relationships.html#binary-dependencies-depends-recommends-suggests-enhances-pre-depends.)

```
htop
  Depends: libc6
  Depends: libncursesw5
  Depends: libtinfo5
  Suggests: lsof
  Suggests: strace
```

V predvolenom nastavení, budú balíky označené `Depends` a `Recommends` nainštalované spolu so zadaným balíkom, ostatné nie. `Suggests` označuje balíky, ktoré môžu rozšíriť funkcie požadovaného balíka, ale nie sú nevyhnutne nutné pre jeho správne fungovanie. `Enhances` označuje naopak balíky, ktorých funkcie môžu byť rozšírené zadaným balíkom. Znak zvislá čiara `|` (pipe) je vyjadrením „alebo“, teda balík na novom riadku za zvislou čiarou je alternatívou ku balíku pred čiarou. Medzi znakmi `<>` je uvedený tzv. virtuálny balík a za ním sú na odsadených riadkoch uvedené balíky poskytujúce túto činnosť.

- `apt-rdepends` – podobne, ako predchádzajúci príkaz zobrazí súvisiace balíčky, ale závislosti prehľadáva rekurzívne, teda ak nejaký balík vyžaduje ďalší a ten vyžaduje zase ďalší atď., zobrazia sa takto všetky balíky (nie len priamo závislé na požadovanom balíčku).

```bash
apt-rdepends -p htop
```

Tento príkaz nie je súčasťou štandardnej distribúcie, preto je ho potrebné do inštalovať. Prepínač `-p` zabezpečí zobrazenie stavu, či už je balík v zozname nainštalovaný alebo ešte nie.

```
Reading package lists... Done
Building dependency tree
Reading state information... Done
htop
  Depends: libc6 (>= 2.15) [Installed]
  Depends: libncursesw5 (>= 6) [Installed]
  Depends: libtinfo5 (>= 6) [NotInstalled]
libc6
  Depends: libgcc1 [Installed]
libgcc1
  Depends: gcc-8-base (= 8.3.0-6+rpi1) [Installed]
  Depends: libc6 (>= 2.4) [Installed]
gcc-8-base
libncursesw5
  Depends: libc6 (>= 2.7) [Installed]
  Depends: libtinfo5 (= 6.1+20181013-2+deb10u3) [NotInstalled]
libtinfo5
  Depends: libc6 (>= 2.16) [Installed]
```

---

### Pridávanie balíkov

- `apt install` – pridá, nainštaluje požadovaný balíček a s ním aj všetky ďalšie potrebné balíčky, ktorých závislosť je na úrovni `Depends` a `Recommends`.

```bash
sudo apt install curl
```

Inštalovať nové balíky môže len hlavný administrátor systému, preto je potrebné sa buď prihlásiť, ako `root`, alebo príkaz zadávať so `sudo`.

Prepínačom `--install-suggests` je možné docieliť nainštalovanie aj balíkov so závislosťou na úrovni `Suggests`

```bash
sudo apt install --install-suggest curl
```

Môžem si overiť nastavenie, ktorá úroveň závislosti bude nainštalovaná:

```bash
apt-config dump | grep -i :install-
```

---

### Odoberanie balíkov

- `apt remove` – odoberie, odinštaluje požadovaný balík
- `apt purge` – odoberie, odinštaluje požadovaný balík a s ním odoberie aj všetky konfiguračné súbory
- `apt autoremove` – odoberie, odinštaluje všetky balíky, ktoré boli pridané automaticky, ako závislosti pri inštalovaní iných balíčkov a medzi tým sa závislosti zmenili alebo boli tieto iné balíčky odinštalované

Taktiež všetky tieto príkazy môže vykonávať len super užívateľ, preto je ich potrebné zadávať so `sudo`.

---

### Aktualizácia balíkov

- `apt upgrade` – všetky balíčky dostupné v novšej verzii pre inštaluje na novšiu, vyššiu verziu
- `apt full-upgrade` – všetky balíčky dostupné v novšej verzii pre inštaluje na novšiu verziu a navyše ak to vyžadujú závislosti, tak aj pridá ďalšie nové, resp. odoberie už nepotrebné balíčky

Rutina, ktorú je potrebné vykonávať pravidelne a pred každým pridaním ďalšieho, nového softvérového balíčku:

- stiahnuť najnovšie dáta o balíčkoch zo všetkých nastavených APT repozitárov
- zobraziť zoznam balíčkov dostupných vo vyššej verzii
- nainštalovať všetky dostupné novšie verzie balíčkov

```bash
sudo apt update
apt list --upgradable
sudo apt upgrade
sudo apt full-upgrade
```

Aj aktualizáciu môže spúšťať len administrátor systému, preto je potrebné príkazy zadávať so `sudo`.

---

### Čistenie lokálneho úložiska

- `apt clean` – vymaže všetky inštalačné balíčky z lokálneho úložiska s výnimkou súboru `lock`, zmaže teda kompletne všetky súbory v adresároch `/var/cache/apt/archives` a `/var/cache/apt/archives/partial` okrem súboru `lock`
- `apt autoclean` – vymaže z lokálneho úložiska tie inštalačné balíčky, ktoré už nie sú ďalej potrebné, lebo boli napríklad odinštalované alebo už bol odinštalovaný balík, ktorý bol na nich závislý

Tiež môže vykonať len administrátor `root`, čiže zadávať so `sudo`.

---

### Pomôcky

Zobrazenie zoznamu všetkých nastavených a dostupných repozitárov použiteľných na inštaláciu a aktualizáciu softvérových balíčkov:

```bash
egrep -v '^#|^ *$' /etc/apt/sources.list /etc/apt/sources.list.d/*
```

Zobrazenie všetkých nainštalovaných balíčkov:

```bash
dpkg -l
# alebo ich počet
dpkg -l | grep "^ii" | wc -l
# alebo zoznam pomocou apt-mark
# zoznam automaticky nainštalovaných balíčkov
apt-mark showauto
# zoznam ručne nainštalovaných balíčkov
apt-mark showmanual
# to isté, ale pomocou apt list (nevhodné do skriptov)
# všetky nainštalované
apt list --installed
# nainštalované manuálne
apt list --manual--installed=true
# ešte jedna možnosť, ale len za posledný rok, z logov
zgrep " installed " /var/log/dpkg.log* | wc -l
```

---

## Zdroj

- [Chapter 8. The Debian package management tools](https://www.debian.org/doc/manuals/debian-faq/pkgtools.en.html#apt-get)
- [6.2. aptitude, apt-get, and apt Commands](https://debian-handbook.info/browse/stable/sect.apt-get.html)
- [Debian Policy Manual](https://www.debian.org/doc/debian-policy/)
- [apt(8) - Debian manpages](https://manpages.debian.org/bullseye/apt/apt.8.en.html)
- [apt-get(8) - APT package handling utility](https://manpages.debian.org/bullseye/apt/apt-get.8.en.html)
