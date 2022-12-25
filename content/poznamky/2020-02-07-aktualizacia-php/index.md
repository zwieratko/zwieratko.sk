---
title: "Aktualizácia PHP na verziu 7.4"
date: 2020-02-07T19:51:43+01:00
draft: false
description: Ako aktualizovať PHP na najnovšiu podporovanú verziu.
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

PHP je populárny, obľúbený a silný programovací jazyk. Momentálne (február 2020) sa pomaly končí podpora pre PHP verziu 7.2, oficialne už len bezpečnostné opravy. Aktívna podpora je pre verzie 7.3 (do 6.12.2020) a 7.4 (do 28.11.2021). Debian 9 má vo svojich repozitároch verziu 7.0 a Debian 10 má verziu 7.3, ja by som chcel však aktualizovať na najnovšiu verziu 7.4.

### Aktualizácia na novšiu verziu PHP 8.1 viď [ďalšiu poznámku](/poznamky/2021/11/aktualizacia-php-na-verziu-8.1/).

## Upozornenie

Novšie verzie PHP prinášajú zlepšenia a zvyčajne aj opravy a zrýchlenie, no môžu tak isto odstrániť niektoré vlastnosti, alebo priniesť chyby nové. Takže prechod na novú verziu PHP môže rozbiť funkčnosť systému! Na toto nesmiem zabudnúť. Pred prechodom je potrebné vyskúšať novšiu verziu na neprodukčných serveroch.

## Riešenie

Najskôr si stiahnem pomocné programy, potom podpisový kľúč, potom pridám [Ondrejov](https://deb.sury.org/) repozitár medzi zdroje a nakoniec zdroje zaktualizujem. Ak už som mal nejakú verziu PHP nainštalovanú tak s veľkou pravdepodobnosťou bude dostupných mnoho aktualizácii.

```sh
sudo apt install apt-transport-https lsb-release
sudo wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
sudo sh -c 'echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'
sudo apt update
```

V ďalšom kroku si overím aké moduly PHP som mal už nainštalované `dpkg --get-selections | grep -i php`, odpoveď bude zoznam všetkých nainštalovaných modulov pre všetky verzie PHP:

```
php-common                                      install
php5-cli                                        install
php5-common                                     install
php5-fpm                                        install
php5-json                                       install
php5-readline                                   install
php5-sqlite                                     install
php7.0-cli                                      install
php7.0-common                                   install
php7.0-fpm                                      install
php7.0-json                                     install
php7.0-opcache                                  install
php7.0-readline                                 install
php7.0-sqlite3                                  install
php7.4                                          install
php7.4-cli                                      install
php7.4-common                                   install
php7.4-fpm                                      install
php7.4-json                                     install
php7.4-opcache                                  install
php7.4-readline                                 install
php7.4-sqlite3                                  install
```

Podľa tohto zoznamu viem, aké moduly potrebujem nainštalovať:

```sh
sudo apt install php7.4 php7.4-common php7.4-cli php7.4-fpm php7.4-json php7.4-opcache php7.4-readline php7.4-sqlite3
```

Správnosť inštalácie si overím pomocou `php -v`, predvolená CLI odpovie číslom verzie:

```
PHP 7.4.2 (cli) (built: Feb  2 2020 07:56:32) ( NTS )
Copyright (c) The PHP Group
Zend Engine v3.4.0, Copyright (c) Zend Technologies
    with Zend OPcache v7.4.2, Copyright (c), by Zend Technologies
```

Ak mám nainštalovaných viacero verzii PHP, predvolenú verziu môžem zmeniť podľa potreby pomocou:

```sh
sudo update-alternatives --config php
```

## PHP a systemd

Z PHP ma najviac zaujíma modul `php-fpm` -- „The PHP 7.4 FastCGI Process Manager“ a ten je v Debiane ako aj mnoho iných služieb spúšťaný a riadený pomocou démona `systemd`.

V predvolenom nastavení `php-fpm` načúva na unixovom „sockete“. Zoznam všetkých počúvajúcich si môžem zobraziť pomocou [ss](https://linux.die.net/man/8/ss):

```sh
ss -x -a | grep LISTEN
```

Podobne si môžem zobraziť len zoznam všetkých počúvajúcich `php-fpm`:

```sh
ss -x -a | grep php
```

Výstup na mojom testovacom Raspberry Pi ukazuje, že PHP-FPM tam beží v troch rôznych verziách:

```
u_str  LISTEN  0       0            /run/php/php7.0-fpm.sock 457417
u_str  LISTEN  0       0            /run/php/php7.3-fpm.sock 459851
u_str  LISTEN  0       0            /run/php/php7.4-fpm.sock 477314
```

Ak chcem po nainštalovaní novšej verzie PHP tú staršiu prestať používať, službu najskôr zastavím a potom ju vypnem:

```sh
sudo service php7.0-fpm stop
sudo systemctl disable php7.0-fpm.service
```

Analogicky môžem opätovne uviesť do prevádzky takto zastavené `php-fpm`:

```sh
sudo systemctl enable php7.0-fpm.service
sudo service php7.0-fpm start
```

Po zmene v konfiguračných súboroch je potrebné službu reštartovať:

```sh
sudo service php7.0-fpm restart
```

---

## Zdroj

- [php.net](https://www.php.net/supported-versions.php)
- [packages.debian.org](https://packages.debian.org/search?searchon=names&keywords=php-fpm)
- [jesusamieiro.com](https://www.jesusamieiro.com/update-debian-to-php-7-4/)
- [tecmint.com](https://www.tecmint.com/list-php-modules-in-linux/)
- [dynacont.net](https://dynacont.net/documentation/linux/Useful_SystemD_commands/)
