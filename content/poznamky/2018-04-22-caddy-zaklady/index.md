---
title: "Caddy v1 – základy"
date: 2018-04-22T19:44:24+01:00
draft: false
description: Základy používania webového servera Caddy verzia 1.
type: posts
tags:
  - Caddy
  - Webový server
categories:
  - Poznámky
toc: true
---

[Caddy](https://caddyserver.com/) je webový server vytvorený v jazyku Go. Zdrojový kód je otvorený a tvorí ho komunita nadšencov. Na začiatku bol tuším len jeden zanietenec [Matt Holt](https://github.com/mholt). S trochou preháňania si trúfam napísať, že čo sa týka webových serverov a nasadenia `https` môžeme kľudne dobu deliť na „pred Caddy“ a po :)

Caddy vo svojej dobe skutočne prišiel s technológiami, ktoré pri ostatných webových serveroch neboli vôbec bežné a už vôbec nie ľahko nasaditeľné. Napríklad: 

- HTTPS s autoritou `Let's Encrypt`
- HTTP/2
- QUIC
- Brotli

Ja Caddy webový server poznám a aj sa s ním hrám už niekedy od verzie 0.7.6 (najstaršia stiahnutá verzia, čo som našiel na serveri), to bola približne jeseň 2015. Prvé vydanie má číslo 0.5.0 a bolo z 28.4.2015.

## Inštalácia

Caddy tvorí jeden binárny súbor. A teda inštalácia spočíva v stiahnutí správcami už pripraveného, zostaveného a zabaleného balíčku alebo v stiahnutí zdrojákov a ich skompilovaní. Caddy je vydávaný pre rôzne operačné systémy. Sťahovať môžem z viacerých miest, ~~buď priamo zo stránky projektu~~, alebo čistú verziu Caddy v1 bez „plug-inov“ z [github.com](https://github.com/caddyserver/caddy/releases/tag/v1.0.4) -- posledné vydanie verzie 1.

Vytvorím si nový adresár, prepnem sa do novovytvoreného adresáru, stiahnem si archív s vanilkovou verziu Caddy, rozbalím archív a prekopírujem súbor caddy do adresáru `/usr/local/bin`:

```sh
mkdir ~/Downloads/Caddy/0.10.14
cd ~/Downloads/Caddy/0.10.14
wget https://github.com/caddyserver/caddy/releases/download/v0.10.14/caddy_v0.10.14_linux_amd64.tar.gz
tar -xvf *
cp caddy /usr/local/bin
```

Zmením vlastníka a skupinu na `root` a upravím prístupové práva na `755`:

```sh
sudo chown root:root /usr/local/bin/caddy
sudo chmod 755 /usr/local/bin/caddy
```

Udelím binárnemu súboru `caddy` schopnosť pracovať na privilegovaných portoch (80, 443) aj keď bude spúšťaný len bežným užívateľom (teda nie super užívateľom -- `root`):

```sh
sudo setcap 'cap_net_bind_service=+ep' /usr/local/bin/caddy
```

## Užívateľ a skupina www-data

Webové servery štandardne bežia pod iným ako bežným či super užívateľom. V Debiane a podobných to býva užívateľ/skupina `www-data`. Overím si, či mám takú v systéme:

```sh
egrep -i "^www-data" /etc/group
```

Ak už v systéme existuje, odpoveď bude niečo podobné ako: `www-data:x:33`.

Ak skupina a užívateľ ešte neexistujú, vytvorím si ich:

```sh
sudo groupadd -g 33 www-data
sudo useradd \
  -g www-data --no-user-group \
  --home-dir /var/www --no-create-home \
  --shell /usr/sbin/nologin \
  --system --uid 33 www-data
```

## Adresáre

Pre správny chod webového servera Caddy je potrebné vytvoriť zopár adresárov a nastaviť im správne prístupové práva a vlastníkov.

Najskôr si vytvorím adresár pre konfiguračný súbor a nastavím užívateľa aj skupinu na `root`:

```sh
sudo mkdir /etc/caddy
sudo chown -R root:root /etc/caddy
```

Vytvorím ďalší adresár pre certifikáty atď., nastavím užívateľa na `root` a skupinu na `www-data` a upravím prístupové práva na [0770](https://chmodcommand.com/chmod-0770/) (to znamená, že užívateľ aj skupina môžu všetko, ostatní nič):

```sh
sudo mkdir /etc/ssl/caddy
sudo chown -R root:www-data /etc/ssl/caddy
sudo chmod 0770 /etc/ssl/caddy
```

Ak ho ešte nemám, tak do tretice vytvorím adresár pre samotné webové projekty `/var/www`, nastavím užívateľa aj skupinu na `www-data` a upravím prístupové práva na veľmi bezpečné `555` (nik nemôže zapisovať):

```sh
sudo mkdir /var/www
sudo chown www-data:www-data /var/www
sudo chmod 555 /var/www
```

## Konfigurácia

Caddy webový server používa jeden konfiguračný súbor uložený v adresári `/etc/caddy`.

Ak ho ešte nemám, vytvorím si ho, zmením vlastníka aj skupinu na `root` a upravím prístupové práva na `644`:

```sh
sudo touch /etc/caddy/Caddyfile
sudo chown root:root /etc/caddy/Caddyfile
sudo chmod 644 /etc/caddy/Caddyfile
```

V konfiguračnom súbore `Caddyfile` môžem okrem iného nastaviť aj:

- adresu alebo port na ktorom webový server pracuje
- HTTPS spojenie a jeho parametre
- vlastnosť, aby adresy v adresnom riadku fungovali aj bez prípon, takzvané čisté adresy ([clean URL](https://en.wikipedia.org/wiki/Clean_URL))
- adresár so samotným webom
- adresáre kam a spôsob ako sa majú ukladať logy
- miesto kam sa majú posielať [FastCGI](/poznamky/2020-02-07-aktualizacia-php/#php-a-systemd) požiadavky
- [bezpečnostné hlavičky](/poznamky/2020-02-09-bezpecnostne-hlavicky/)

Príklad jednoduchého konfiguračného súboru pre miestny, testovací webový server bez `HTTPS`:

```
:8080 {
	gzip
	tls off
	ext .html .htm .php
	root /var/www/collector.example.com
	log /var/log/caddy/collector_caddyaccess.log
	errors /var/log/caddy/collector_caddyerror.log
	fastcgi / /run/php/php7.4-fpm.sock php
	header / {
		Server "StarTrek_cluster_dev02"
		Referrer-Policy "no-referrer-when-downgrade"
		}
}
```

## Caddy a systemd

Spúšťanie a beh Caddy zabezpečí `systemd`. Preto potrebujem takzvaný „unit“ súbor, ktorý popisuje proces spúšťania atď.

Stiahnem si unit súbor a vykonám v ňom prípadné úpravy:

```sh
wget https://raw.githubusercontent.com/caddyserver/dist/master/init/caddy.service
```

Prekopírujem ho do adresáru s jednotkami, zmením vlastníka aj skupinu na `root` a upravím prístupové práva:

```sh
sudo cp caddy.service /etc/systemd/system/
sudo chown root:root /etc/systemd/system/caddy.service
sudo chmod 644 /etc/systemd/system/caddy.service
```

Zabezpečím opakované načítanie démona `systemd` po pridaní novej jednotky:

```sh
sudo systemctl daemon-reload
```

Toto musím vykonať po každej zmene v súbore `/etc/systemd/system/caddy.service`.

Ak chcem aby bol Caddy spustený po každom reštarte operačného systému, nastavím to:

```sh
sudo systemctl enable caddy.service
```

Analogicky viem spúšťanie vypnúť pomocou `disable`.

## Spustenie

Ak už mám všetko nastavené, chcem Caddy spustiť:

```sh
sudo systemctl start caddy.service
```

S Caddy ako `systemd` jednotkou môžem vykonávať bežné operácie:

- *start* -- spustenie
- *stop* -- zastavenie
- *status* -- kontrola stavu
- *reload* -- znovu načítanie konfiguračného súboru
- *restart* -- reštart

## Aktualizácia

Po vydaní novej verzie chcem Caddy aktualizovať.

Tak ako každá nová verzia softvéru, tak aj nová verzia Caddy môže okrem zlepšení priniesť aj nové chyby. Pred nasadením na produkčných serveroch musím novú verziu Caddy **otestovať !**

Vytvorím si adresár pre novú verziu, prepnem sa do neho, stiahnem si novú verziu, rozbalím ju, zastavím Caddy webový server, prekopírujem rozbalený súbor do správneho adresáru, zmením vlastníka aj skupinu, upravím prístupové práva, znovu spustím Caddy:

```sh
mkdir ~/Downloads/Caddy/1.0.4
cd ~/Downloads/Caddy/1.0.4
wget https://github.com/caddyserver/caddy/releases/download/v1.0.4/caddy_v1.0.4_linux_amd64.tar.gz
tar -xvf *
sudo systemctl stop caddy.service
cp caddy /usr/local/bin
sudo chown root:root /usr/local/bin/caddy
sudo chmod 755 /usr/local/bin/caddy
sudo systemctl start caddy.service
```
---

## Zdroj

- [github.com](https://github.com/caddyserver/dist/tree/master/init)
- [caddy.its-em.ma](https://caddy.its-em.ma/v1/docs/)
- [digitalocean.com](https://www.digitalocean.com/community/questions/discussion-about-permissions-for-web-folders)
- [serverfault.com](https://serverfault.com/questions/357108/what-permissions-should-my-website-files-folders-have-on-a-linux-webserver)
