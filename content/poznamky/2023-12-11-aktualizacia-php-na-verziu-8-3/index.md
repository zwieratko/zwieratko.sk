---
title: "Aktualizácia PHP na verziu 8.3"
date: 2023-12-11T19:16:33+01:00
draft: false
description: Ako aktualizovať PHP na najnovšiu dostupnú verziu 8.3 v prostredí operačného systému Debian / Ubuntu.
type: posts
tags:
  - PHP
  - Linux
  - Debian
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem aktualizovať PHP na najnovšiu dostupnú verziu na počítači s operačným systémom z rodiny Debian.

PHP je populárny, obľúbený a silný programovací jazyk. Pred par dnami (25. november 2023) sa skončila [aktívna podpora](https://www.php.net/supported-versions.php) pre PHP verziu 8.1, oficiálne už bude dostávať len bezpečnostné opravy. Aktívna podpora je pre verzie 8.2 (do 8.12.2024) a 8.3 (do 23.11.2025). Predposledný Debian 11 má predvolenú verziu 7.4, Debian 12 má verziu 8.2 a Ubuntu 22.04 LTS má PHP verziu 8.1, ja by som chcel však inštalovať / aktualizovať na najnovšiu dostupnú verziu [PHP 8.3](https://www.php.net/releases/8.3/en.php).

## Upozornenie

Novšie verzie PHP prinášajú zlepšenia a zvyčajne aj opravy a zrýchlenie, no môžu tak isto odstrániť niektoré vlastnosti, alebo priniesť chyby nové. Takže prechod na novú verziu PHP môže rozbiť funkčnosť systému! Na toto nesmiem zabudnúť. Pred prechodom je potrebné vyskúšať novšiu verziu na neprodukčných serveroch.

## Riešenie

Najskôr si doinštalujem potrebné pomocné programy, ďalej podpisový kľúč k repozitáru, potom pridám [Ondrejov](https://deb.sury.org/) repozitár medzi zdroje a nakoniec zdroje aktualizujem. Ak už som mal nejakú verziu PHP nainštalovanú tak s veľkou pravdepodobnosťou bude dostupných mnoho aktualizácii.

```sh
sudo apt install apt-transport-https lsb-release curl

# OpenPGP kluc ku repozitaru
curl -fsSL https://packages.sury.org/php/apt.gpg | sudo gpg --dearmor -o /usr/share/keyrings/deb.sury.org-php.gpg

# Pridanie repa
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'

sudo apt update
```
V ďalšom kroku si overím aké moduly PHP som mal už nainštalované s poslednou používanou verziou.

```sh
dpkg --get-selections | grep -i php8.2
```

Odpoveď bude zoznam všetkých nainštalovaných modulov pre PHP 8.2:

```
php8.2-cli                                      install
php8.2-common                                   install
php8.2-curl                                     install
php8.2-fpm                                      install
php8.2-opcache                                  install
php8.2-readline                                 install
php8.2-sqlite3                                  install
```

Podľa tohto zoznamu viem, aké moduly potrebujem / používam.

Môžem nainštalovať všetky požadované moduly aj s novou verziou v jednom kroku:

```sh
sudo apt install $(dpkg --get-selections | grep -i php8.2 | cut -f1 | xargs | sed 's/8.2/8.3/g')
```

Správnosť inštalácie si overím pomocou `php -v`, predvolená CLI odpovie číslom verzie:

```
PHP 8.3.0 (cli) (built: Nov 25 2023 14:38:38) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.0, Copyright (c) Zend Technologies
    with Zend OPcache v8.3.0, Copyright (c), by Zend Technologies
```

Ak mám nainštalovaných viacero verzii PHP, predvolenú verziu môžem zmeniť podľa potreby pomocou:

```sh
sudo update-alternatives --config php
```

Odpoveďou je zoznam nainštalovaných verzii, z ktorých je možné jednu vybrať.

## PHP a systemd

Z PHP ma najviac zaujíma modul `php-fpm` -- „The PHP 8.3 FastCGI Process Manager“ a ten je v Debiane spúšťaný a riadený pomocou `systemd` - démona pre správu systému.

Môžem zobraziť zoznam všetkých spustených `php-fpm`:

```sh
ss -x -a | grep fpm
```

PHP-FPM smie byt spustené v rôznych verziách súčasne:

```
u_str LISTEN 0      4096                     /run/php/php8.3-fpm.sock 3308708
u_str LISTEN 0      511                      /run/php/php8.1-fpm.sock 2340209
u_str LISTEN 0      4096                     /run/php/php8.2-fpm.sock 2340231
```

Ďalej môžem skontrolovať stav novo nainštalovanej verzie:

```sh
systemctl status php8.3-fpm.service
```

Staršie verzie môžem zastaviť a vypnúť:

```sh
sudo systemctl stop php8.1-fpm.service
sudo systemctl disable php8.1-fpm.service
```

Analogicky môžem opätovne uviesť do prevádzky takto zastavené `php-fpm`:

```sh
sudo systemctl enable php8.1-fpm.service
sudo systemctl start php8.1-fpm.service
```

## Poznámky

### listen.owner / user

V prípade, že webový server, ktorý používa `php-fpm` beží pod iným ako zvyčajne používaným užívateľom (www-data) je potrebné buď zmeniť užívateľa webového serveru na `www-data` alebo upraviť konfiguračný súbor PHP-FPM. Na úpravu konfigurácie potrebujem administrátorsky prístup.

```sh
sudo nano /etc/php/8.1/fpm/pool.d/www.conf
```

Aby server mohol vôbec vykonávať PHP skripty, zmením prednastavenú hodnotu používateľa unixového socketu z `www-data` na meno užívateľa pod ktorým beží webový server. Zmenu vykonám na riadku, ktorý začína s `listen.owner`.

```
listen.owner = webserver_user_name
```

Taktiež zmením prednastavenú hodnotu používateľa FPM procesu z `www-data` na meno užívateľa, ktorý má právo zapisovať do databázy. Zmenu vykonám na riadku, ktorý začína so slovom `user`. 

```
user = db_user_name
```

Po akejkoľvek úprave, zmene v konfiguračných súboroch PHP (napr. `/etc/php/8.3/fpm/pool.d/www.conf`) je potrebné službu reštartovať. Zmeny vykonané v konfiguračných súboroch sa prejavia až po reštarte.

```sh
sudo systemctl restart php8.3-fpm
```

### Časové pásmo

V prípade ak potrebujem zmeniť predvolene časové pásmo, od komentujem riadok s `date.time` v konfiguračnom súbore `php.ini` a doplním za znamienko rovná sa požadované časové pásmo. Potom službu znova spustím s novým nastavením.

```sh
sudo vi /etc/php/8.3/fpm/php.ini

# komentar zrusim zmazanim znaku bodkociarka zo zaciatku riadku
date.timezone = Europe/Berlin

# znovu nacitanie konfiguracneho suboru
sudo systemctl reload php8.3-fpm.service
```

---

## Zdroj

- [php.net](https://www.php.net)
- [deb.sury.org](https://deb.sury.org/)
- [default_timezone](https://www.php.net/manual/en/function.date-default-timezone-get.php)
