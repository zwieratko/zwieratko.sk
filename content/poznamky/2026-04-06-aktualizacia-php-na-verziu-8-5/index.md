---
title: "Aktualizácia PHP na verziu 8.5"
date: 2026-04-06T13:19:21+02:00
draft: false
description: Ako aktualizovať PHP na najnovšiu dostupnú verziu 8.5 v prostredí operačného systému Debian / Ubuntu.
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

Chcem aktualizovať PHP na najnovšiu dostupnú verziu v prostredí operačného systému z rodiny Debian.

PHP je populárny, obľúbený a výkonný serverový programovací jazyk. [Aktívna podpora](https://www.php.net/supported-versions.php) pre PHP verziu 8.4 potrvá ešte do konca roka 2026, potom už bude dostávať len bezpečnostné opravy. Posledný Debian 13 má predvolenú verziu 8.4 a Ubuntu 24.04 LTS má PHP dokonca vo verzii 8.3. Ja by som však chcel nainštalovať alebo aktualizovať systém na najnovšiu dostupnú verziu [PHP 8.5](https://www.php.net/releases/8.5/en.php).

---

## Upozornenie

Novšie verzie PHP prinášajú zlepšenia, opravy a zrýchlenie, no môžu tiež odstrániť niektoré vlastnosti alebo priniesť nové chyby. Prechod na novú verziu PHP môže narušiť funkčnosť systému! Na toto nesmiem zabudnúť. Pred prechodom je potrebné vyskúšať novšiu verziu na neprodukčných serveroch.

---

## Riešenie

Najskôr nainštalujem potrebné pomocné programy, ďalej podpisový kľúč k repozitáru, potom pridám [Ondrejov](https://deb.sury.org/) repozitár medzi zdroje (ak ho ešte nemám) a nakoniec zdroje aktualizujem. Ak som už mal nainštalovanú nejakú verziu PHP, s veľkou pravdepodobnosťou bude k dispozícii množstvo aktualizácií.

```sh
sudo apt install apt-transport-https lsb-release curl

# OpenPGP kľúč k repozitáru
curl -fsSL https://packages.sury.org/php/apt.gpg | sudo gpg --dearmor -o /usr/share/keyrings/deb.sury.org-php.gpg

# Pridanie repozitára
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'

sudo apt update
```

V ďalšom kroku si overím, aké moduly PHP som mal nainštalované v poslednej používanej verzii.

```sh
dpkg --get-selections | grep -i php8.4
```

Odpoveďou bude zoznam všetkých nainštalovaných modulov pre PHP 8.4:

```
php8.4            install
php8.4-cli        install
php8.4-common     install
php8.4-curl       install
php8.4-fpm        install
php8.4-opcache    install
php8.4-readline   install
php8.4-sqlite3    install
```

Podľa tohto zoznamu viem, ktoré moduly používam a potrebujem. Môžem teraz vyfiltrovať moduly dostupné v novej verzii:

```sh
dpkg --get-selections | grep -i php8.4 | cut -f1 | sed 's/8\.4/8\.5/g' | while read pkg; do
  apt-cache show "$pkg" &>/dev/null && echo "OK: $pkg" || echo "MISSING: $pkg"
done
```

A nainštalovať všetky požadované a dostupné moduly v jednom kroku:

```sh
dpkg --get-selections | grep -i php8.4 | cut -f1 | sed 's/8\.4/8\.5/g' | while read pkg; do
  apt-cache show "$pkg" &>/dev/null && echo "$pkg"
done | xargs sudo apt install
```

Správnosť inštalácie si overím pomocou `php -v`. Predvolené CLI vypíše číslo verzie:

```
PHP 8.5.4 (cli) (built: Mar 30 2026 19:28:17) (NTS)
Copyright (c) The PHP Group
Built by Debian
Zend Engine v4.5.4, Copyright (c) Zend Technologies
    with Zend OPcache v8.5.4, Copyright (c), by Zend Technologies
```

Ak mám nainštalovaných viacero verzií PHP, predvolenú verziu môžem podľa potreby zmeniť pomocou:

```sh
sudo update-alternatives --config php
```

Výstupom je zoznam nainštalovaných verzií, z ktorých je možné si jednu vybrať.

---

## PHP a systemd

Z PHP ma najviac zaujíma modul `php8.5-fpm.service - The PHP 8.5 FastCGI Process Manager`. Ten je v Debiane spúšťaný a riadený pomocou `systemd` – démona na správu systému.

Môžem si zobraziť zoznam všetkých spustených inštancií `php-fpm`:

```sh
ss -x -a | grep fpm
```

PHP-FPM môže byť spustené vo viacerých verziách súčasne:

```
u_str LISTEN 0      4096                     /run/php/php8.4-fpm.sock
u_str LISTEN 0      4096                     /run/php/php8.5-fpm.sock
```

Ďalej môžem skontrolovať stav novonainštalovanej verzie:

```sh
systemctl status php8.5-fpm.service
```

Staršie verzie môžem zastaviť a zakázať:

```sh
sudo systemctl stop php8.4-fpm.service
sudo systemctl disable php8.4-fpm.service
```

Analogicky môžem v prípade potreby opätovne uviesť do prevádzky takto zastavené staré `php-fpm`:

```sh
sudo systemctl enable php8.4-fpm.service
sudo systemctl start php8.4-fpm.service
```

V prípade, že nové `php-fpm` funguje podľa očakávaní, môžem zmeniť konfiguráciu webového servera tak, aby používal novšiu verziu PHP.

---

## Poznámky

### Prenos konfigurácie

V prípade, že mám upravené konfiguračné súbory pre PHP a som si istý, že ich môžem použiť aj v novej verzii, skopírujem ich. Pôvodné by som mal pre istotu zálohovať.

```sh
sudo cp /etc/php/8.5/fpm/php.ini /etc/php/8.5/fpm/php.ini.bck
sudo cp /etc/php/8.4/fpm/php.ini /etc/php/8.5/fpm/php.ini

sudo cp /etc/php/8.5/fpm/pool.d/www.conf /etc/php/8.5/fpm/pool.d/www.conf.bck
sudo cp /etc/php/8.4/fpm/pool.d/www.conf /etc/php/8.5/fpm/pool.d/www.conf
```

Po akejkoľvek úprave konfiguračných súborov PHP je potrebné službu reštartovať. Zmeny sa prejavia až po reštarte.

```sh
sudo systemctl restart php8.5-fpm
```

### Časové pásmo

Ak potrebujem zmeniť predvolené časové pásmo, odkomentujem riadok s `date.timezone` v konfiguračnom súbore `php.ini` a za znamienko rovnosti doplním požadovanú hodnotu. Potom službu znova načítam s novým nastavením.

```sh
sudo vi /etc/php/8.5/fpm/php.ini

# Komentár zruším zmazaním bodkočiarky na začiatku riadku
date.timezone = Europe/Berlin

# Znovunačítanie konfiguračného súboru
sudo systemctl reload php8.5-fpm.service
```

---

## Zdroje

- [php.net](https://www.php.net)
- [deb.sury.org](https://deb.sury.org/)
- [default_timezone](https://www.php.net/manual/en/function.date-default-timezone-get.php)
