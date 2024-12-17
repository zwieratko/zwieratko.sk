---
title: "Synchronizovať vzdialenú SQLite3 databázu"
date: 2020-11-20T10:26:45+01:00
draft: false
description: Ako zabezpečiť bezpečnú synchronizáciu (replikáciu) databáz SQLite3 na lokálnych a vzdialených serveroch s čo najmenším objemom prenášaných dát.
type: posts
tags:
  - Linux
  - Sqlite3
  - DB
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem zabezpečiť bezpečnú synchronizáciu (replikáciu) databáz SQLite3 na lokálnych a vzdialených serveroch tak, aby bolo potrebné prenášať sieťou čo možno najmenej dát.

## Riešenie

V repozitároch [Alexandra Moisseeva na Githube](https://github.com/moisseev) som našiel viac menej hotové riešenie.

### Závislosti

Najskôr si potrebujem aktualizovať systém a doinštalovať potrebné balíčky.

```sh
sudo apt update && \
sudo apt upgrade && \
sudo apt install \
rsync \
git \
build-essential \
sqlite3 \
libsqlite3-dev \
tcl \
libsqlite3-tcl
```

Len aby som nezabudol čo je načo:

- rsync -- pre sqlite3-sync
- git -- ma prácu s Githubovými archívmi
- build-essential -- na kompilovanie pre sqlite3-md5
- sqlite3 -- o nej to celé je :)
- libsqlite3-dev -- na kompilovanie pre sqlite3-md5
- tcl -- pre sqlite3-rdiff, je napísaný v Tcl
- libsqlite3-tcl -- pre sqlite3-rdiff, na zavedenie nového rozšírenia

Ďalej je potrebné aby bolo možné pristupovať z hlavného servera na vzdialený cez SSH bez hesla, teda pomocou SSH kľúčov.

### sqlite3-sync

Na server, na ktorom je hlavná databáza (tá podľa ktorej budem ostatné synchronizovať, replikovať) si naklonujem Githubový archív do novovytvoreného adresáru.

```sh
cd ~
mkdir sqlite3-tools
cd sqlite3-tools
git clone https://github.com/moisseev/sqlite3-sync.git
```

Tento software potrebujem mať nainštalovaný len na hlavnom serveri, z ktorého budem spúšťať synchronizáciu. Ďalšie závislosti už musia byť nainštalované na oboch serveroch, na hlavnom aj na vzdialenom.

Vytvorím si kópiu konfiguračného súboru, a upravím tam všetky potrebné údaje.

```sh
cd ~/sqlite3-tools/sqlite3-sync
cp sqlite3-sync.conf.sample sqlite3-sync.conf
nano sqlite3-sync.conf
```

Toto je hlavný shellový skript. V piatich krokoch porovná hlavnú a vzdialenú databázu, nájde a vypočíta rozdiely a upraví vzdialenú databázu tak aby obsahovala rovnaké záznamy ako hlavná, lokálka databáza. Na prenášanie dát medzi hlavným a vzdialeným serverom sa využíva veľmi efektívny `rsync` a prenášajú sa teda len rozdiely medzi súbormi, nie celé súbory. Celá komunikácia prebieha cez zabezpečené, šifrované SSH spojenie.

### sqlite3-rdiff

Na oba serveri si naklonujem ďalší archív.

```sh
cd ~/sqlite3-tools
git clone https://github.com/moisseev/sqlite3-rdiff.git
```

V adresári `/usr/local/bin` si vytvorím symbolický link na skript.

```sh
sudo ln -s /home/rado/sqlite3-tools/sqlite3-rdiff/sqlite3-rdiff /usr/local/bin/sqlite3-rdiff
```

Skript je napísaný v jazyku Tcl. Kľúčová časť celej zostavy. Analyzuje, vypočíta, pridá / odoberie rozdielne riadky dát v porovnávaných databázach SQLite3.

### sqlite3-md5

Opäť na oba serveri si naklonujem už posledný tretí archív s MD5 SQLite rozširujúcou knižnicou.

```sh
cd ~/sqlite3-tools
git clone https://github.com/moisseev/sqlite-md5.git
```

Inštaláciu rozširujúcej knižnice vykonám skompilovaním stiahnutých zdrojákov.

```sh
cd ~/sqlite3-tools/sqlite3-md5
make
make test
sudo make install
```

Posledný príkaz umiestni zostavenú knižnicu `libsqlitemd5.so` do adresáru `/usr/local/lib`.

Knižnica je napísaná v jazyku C a pridáva podporu kryptografickej hašovacej funkcie MD5 do SQLite3.

### Ladenie

Žiaľ v tejto podobe to ešte stále nebolo použiteľné. Skript sa ukončil s chybovou hláškou hneď na začiatku, lebo sa snažil na *vzdialenom serveri* vykonať sudo ... cez ssh spojenie.

Chybové hlásenie:

>sudo: no tty present and no askpass program specified

Chybu spôsobujú riadky 20 a 36 v skripte `sqlite3-sync`. Nápravu vykonám len na *vzdialenom serveri*, potrebujem upraviť súbor `/etc/sudoers` tak, aby mal užívateľ synchronizujúci databázy oprávnenie vykonať `ssh -p $PORT $HOST "sudo sh -s" < ./action...` bez zadávania hesla.

```sh
sudo visudo
```

Na koniec pridám riadok:

```sh
rado ALL = NOPASSWD: /bin/sh
```

A bol tu ešte jeden háčik.

Chybové hlásenie:

>libsqlitemd5.so.so: cannot open shared object file: No such file or directory

Tak isto len na vzdialenom serveri je potrebné mierne upraviť skript `sqlite3-rdiff`.

```sh
cd ~/sqlite3-tools/sqlite3-rdiff
nano sqlite3-rdiff
```

V riadku 388 je potrebné meno knižnice `libsqlitemd5.so` nahradiť úplnou cestou k nej `/usr/local/lib/libsqlitemd5.so`.

Toto by malo byť všetko.

### Použitie

Použitie je jednoduché. Priamo v adresári môžem spustiť skript. Ak sú všetky parametre v konfiguračnom súbore `sqlite3-sync.conf` nastavené správne, spustí sa synchronizácia.

```sh
cd ~/sqlite3-tools/sqlite3-sync
./sqlite3-sync
```

---

## Zdroj

- [moisseev/sqlite3-sync](https://github.com/moisseev/sqlite3-sync)
