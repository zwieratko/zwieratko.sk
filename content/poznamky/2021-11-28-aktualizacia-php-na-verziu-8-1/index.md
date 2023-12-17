---
title: "Aktualizácia PHP na verziu 8.1"
date: 2021-11-28T09:42:24+01:00
draft: false
description: Ako aktualizovať PHP na najnovšiu podporovanú verziu 8.1 v prostredí operačného systému Debian.
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

Chcem aktualizovať PHP na najnovšiu podporovanú verziu na počítači s operačným systémom z rodiny Debian.

PHP je populárny, obľúbený a silný programovací jazyk. Momentálne (november 2021) sa skončila [aktívna podpora](https://www.php.net/supported-versions.php) pre PHP verziu 7.4, oficiálne už bude dostávať len bezpečnostné opravy. Aktívna podpora je pre verzie 8.0 (do 26.11.2022) a 8.1 (do 25.11.2023). Predposledný Debian 10 má predvolenú verziu 7.3 a Debian 11 aj Ubuntu 20.04 LTS majú PHP verziu 7.4, ja by som chcel však aktualizovať na najnovšiu dostupnú verziu [PHP 8.1](https://www.php.net/releases/8.1/en.php).

### Aktualizácia na novšiu verziu viď [Aktualizácia PHP na verziu 8.3](/poznamky/2023/12/aktualizacia-php-na-verziu-8.3/).

## Upozornenie

Novšie verzie PHP prinášajú zlepšenia a zvyčajne aj opravy a zrýchlenie, no môžu tak isto odstrániť niektoré vlastnosti, alebo priniesť chyby nové. Takže prechod na novú verziu PHP môže rozbiť funkčnosť systému! Na toto nesmiem zabudnúť. Pred prechodom je potrebné vyskúšať novšiu verziu na neprodukčných serveroch.

## Riešenie

Najskôr si stiahnem potrebné pomocné programy, potom podpisový kľúč, potom pridám [Ondrejov](https://deb.sury.org/) repozitár medzi zdroje a nakoniec zdroje aktualizujem. Ak už som mal nejakú verziu PHP nainštalovanú tak s veľkou pravdepodobnosťou bude dostupných mnoho aktualizácii.

```sh
sudo apt install apt-transport-https lsb-release wget
sudo wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
sudo sh -c 'echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'
sudo apt update
```

V ďalšom kroku si overím aké moduly PHP som mal už nainštalované s poslednou používanou verziou

```sh
dpkg --get-selections | grep -i php8.0
```

Odpoveď bude zoznam všetkých nainštalovaných modulov pre PHP 8.0:

```
php8.0                                          install
php8.0-cli                                      install
php8.0-common                                   install
php8.0-curl                                     install
php8.0-fpm                                      install
php8.0-opcache                                  install
php8.0-readline                                 install
php8.0-sqlite3                                  install
```

Podľa tohto zoznamu viem, aké moduly potrebujem nainštalovať:

```sh
sudo apt install php8.1 php8.1-cli php8.1-common php8.1-curl php8.1-fpm php8.1-opcache php8.1-readline php8.1-sqlite3
```

Správnosť inštalácie si overím pomocou `php -v`, predvolená CLI odpovie číslom verzie:

```
PHP 8.1.0 (cli) (built: Nov 25 2021 20:49:35) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.1.0, Copyright (c) Zend Technologies
    with Zend OPcache v8.1.0, Copyright (c), by Zend Technologies
```

Ak mám nainštalovaných viacero verzii PHP, predvolenú verziu môžem zmeniť podľa potreby pomocou:

```sh
sudo update-alternatives --config php
```

Odpoveďou je zoznam nainštalovaných verzii, z ktorých je možné vybrať:

```
There are 5 choices for the alternative php (providing /usr/bin/php).

  Selection    Path             Priority   Status
------------------------------------------------------------
  0            /usr/bin/php8.1   81        auto mode
  1            /usr/bin/php7.0   70        manual mode
  2            /usr/bin/php7.3   73        manual mode
* 3            /usr/bin/php7.4   74        manual mode
  4            /usr/bin/php8.0   80        manual mode
  5            /usr/bin/php8.1   81        manual mode

Press <enter> to keep the current choice[*], or type selection number:
```

## PHP a systemd

Z PHP ma najviac zaujíma modul `php-fpm` -- „The PHP 8.1 FastCGI Process Manager“ a ten je v Debiane ako aj mnoho iných služieb spúšťaný a riadený pomocou démona `systemd`.

V predvolenom nastavení `php-fpm` načúva na unixovom „sockete“.

Môžem zobraziť zoznam všetkých spustených `php-fpm`:

```sh
ss -x -a | grep fpm
```

Výstup na mojom testovacom Raspberry Pi ukazuje, že PHP-FPM tam beží v piatich rôznych verziách:

```
u_str  LISTEN  0       0            /run/php/php7.0-fpm.sock 457417
u_str  LISTEN  0       0            /run/php/php7.3-fpm.sock 459851
u_str  LISTEN  0       0            /run/php/php7.4-fpm.sock 477314
u_str  LISTEN  0       0            /run/php/php8.0-fpm.sock 731138
u_str  LISTEN  0       0            /run/php/php8.1-fpm.sock 1109623
```

Ak chcem po nainštalovaní novšej verzie PHP tú staršiu prestať používať, službu najskôr zastavím a potom ju vypnem:

```sh
sudo service php8.0-fpm stop
sudo systemctl disable php8.0-fpm.service
```

Analogicky môžem opätovne uviesť do prevádzky takto zastavené `php-fpm`:

```sh
sudo systemctl enable php8.0-fpm.service
sudo service php8.0-fpm start
```

## Poznámky

V prípade, že webový server, ktorý používa `php-fpm` beží pod iným ako zvyčajne používaným užívateľom (www-data) je potrebné buď zmeniť užívateľa webového serveru na `www-data` alebo upraviť konfiguračný súbor PHP-FPM. Na úpravu konfigurácie potrebujem administrátorsky prístup.

```sh
sudo nano /etc/php/8.1/fpm/pool.d/www.conf
```

Aby server mohol vôbec vykonávať php skripty, zmením prednastavenú hodnotu používateľa unixového socketu z `www-data` na meno užívateľa pod ktorým beží webový server. Zmenu vykonám na riadku, ktorý začína s `listen.owner`.

```
listen.owner = webserver_user_name
```

Taktiež zmením prednastavenú hodnotu používateľa FPM procesu z `www-data` na meno užívateľa, ktorý má právo zapisovať do databázy. Zmenu vykonám na riadku, ktorý začína so slovom `user`. 

```
user = db_user_name
```

Po akejkoľvek úprave, zmene v konfiguračných súboroch PHP (napr. `/etc/php/8.1/fpm/pool.d/www.conf`) je potrebné službu reštartovať. Zmeny vykonané v konfiguračných súboroch sa prejavia až po reštarte.

```sh
sudo service php8.1-fpm restart
```

---

## Zdroj

- [php.net](https://www.php.net)
- [packages.debian.org](https://packages.debian.org/search?searchon=names&keywords=php-fpm)
- [tecmint.com](https://www.tecmint.com/list-php-modules-in-linux/)