---
title: "Scoop - správca balíčkov"
date: 2024-01-13T10:07:04+01:00
draft: false
description: Ako pomocou nástroja Scoop pridávať, odoberať a celkovo spravovať softvérové balíčky v prostredí operačného systému MS Windows.
type: posts
tags:
  - PowerShell
  - Windows
  - Správca balíčkov
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem pomocou nástroja [Scoop](https://scoop.sh/) pridávať, odoberať a celkovo spravovať softvérové balíčky v prostredí operačného systému MS Windows.

## Riešenie

Momentálne v prostredí MS Windows existuje niekoľko rôznych [správcov balíčkov](https://en.wikipedia.org/wiki/List_of_software_package_management_systems#Windows) / inštalátorov, len na ilustráciu:

- MS Store
- Winget
- Chocolatey
- Scoop

Mňa vyslovene zaujal posledný menovaný. `Scoop` je zaujímavý okrem iného aj preto, že:

- v predvolenom nastavení všetko inštaluje do domáceho adresára
- nevyžaduje administrátorské oprávnenia
- nie je potrebne pridávať po každej inštalácii novu cestu ku binárkam do premennej prostredia, bo všetky nainštalované spustiteľné súbory sú v jednom adresári `~\scoop\shims\`
- nemali by vznikať problémy so vzájomnými závislosťami, keďže nainštalované programy sú izolované a nezávisle na sebe navzájom

### Inštalácia nástroja Scoop

Správcu balíčkov `Scoop` môžem nainštalovať stiahnutím a vykonaním inštalačného skriptu. Samozrejme zdroju by som mal dôverovať, respektíve skript si môžem kuknúť na zadávanej adrese alebo na [gite](https://github.com/ScoopInstaller/Install) ešte pred jeho spustením. Nasledujúce príkazy musím zadávať v prostredí PowerShell vo verzii 5.1 a vyššie.

```sh
# mozem si najskor overit ci mam povolene vykonavat skripty
Get-ExecutionPolicy

# ak este nie, mozem povolit
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# stiahnem a vykonam instalacny skript
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# alebo to iste, ale v skratenej podobe
irm get.scoop.sh | iex
```

V prípade ak chcem inštalovať na iné ako predvolené miesto (`C:\Users\<meno>\scoop`), môžem inštalačný skript len stiahnuť a spustiť ho neskôr aj s vlastnými parametrami.

```sh
irm get.scoop.sh -outfile 'installScoop.ps1'

# alebo ak musim stahovat cez proxy
irm get.scoop.sh -Proxy 'http://127.0.0.1:3128' -OutFile 'installScoop.ps1'

# dalsie parametre mozem kuknut na gite:
# https://github.com/ScoopInstaller/Install/blob/master/install.ps1 
./installScoop.ps1 -ScoopDir 'D:\App\Scoop'

# alebo aj instalovat cez proxy
./installScoop.ps1 -ScoopDir 'C:\App\Scoop' -Proxy 'http://127.0.0.1:3128'
```

Ak potrebujem komunikovať cez proxy stále, aj pri ďalšom používaní `Scoop`, môžem ho nastaviť.

```sh
scoop config proxy 127.0.0.1:3128
```

### Softvérové katalógy

Zoznamy softvérových balíkov, ktoré si môžem nainštalovať, sa tuná nazývajú, že `bucket`.

V predvolenom nastavení `Scoop` využíva len jeden softvérový katalóg / bucket - `main`.

```sh
# zobrazi dostupne buckety/katalogy
scoop bucket known

# zobrazi zoznam pridanych bucketov
scoop bucket list
```

Existuje veľké množstvo bucketov, momentálne ich stránka zobrazuje 1447, niektoré obsahujú tisíce aplikácii, no niektoré len jednu :)

Prehlaď oficiálnych katalógov:

- `main` - jednoduché programy, bez grafického rozhrania, slobodný softvér
- `extras` - aplikácie, ktoré nespĺňajú kritéria pre zaradenie do bucketu main
- `versions` - rôzne verzie programov (alfa, beta, nočné vydania, atď..)
- `php` - prakticky všetky vydania PHP od 5.2.10 až po najnovšie
- `nerd-fonts` - nádherné fonty vhodne obzvlášť do terminálu alebo do vývojového prostredia
- `games` - hry a herne emulátory
- `nirsoft` - plne priehrštie nástrojov vyvinutých Nirom Soferom
- `java` - všetko okolo Javy (OpenJDK, Alibaba Dragonwell, Eclipse Temurin, Amazon Corretto)

V prípade záujmu môžem bucket jednoducho pridať či neskôr odstrániť.

```sh
# pridanie bucketu
scoop bucket add nerd-fonts

# zoznam pridanych bucketov
scoop bucket list

# odobratie bucketu
scoop bucket rm nerd-fonts
```

### Vyhľadanie balíčkov

Po pridaní softvérového katalógu môžem požadovanú aplikáciu vyhľadávať - `scoop search`.

```sh
scoop search php
```

Výstupom je zoznam nájdených balíkov plus buckety odkiaľ sa prípadne nainštalujú.

```
Results from local buckets...

Name          Version Source Binaries
----          ------- ------ --------
php-nts       8.3.1   main
php           8.3.1   main
php5.2.10-nts 5.2.10  php
php5.2.10     5.2.10  php
php5.2.11-nts 5.2.11  php
php5.2.11     5.2.11  php
...
php8.1-nts    8.1.27  php
php8.1        8.1.27  php
php8.2-nts    8.2.14  php
php8.2        8.2.14  php
php8.3-nts    8.3.1   php
php8.3        8.3.1   php
```

Balíčky môžem vyhľadávať aj priamo stránke projektu [Scoop - Buckets](https://scoop.sh/#/buckets).

Ak sa požadovaná aplikácia nachádza v jednom z pridaných bucketov, môžem o nej zobraziť podrobnejšie informácie príkazom `scoop info`.

```sh
scoop info php8.3
```

Výstupom je tabuľka s informáciami ako: presná verzia, bucket, licencia, nainštalované binárky atď.

```
Name        : php8.3
Version     : 8.3.1
Bucket      : php
Website     : https://windows.php.net/downloads/releases
License     : PHP-3.01
Updated at  : 20. 12. 2023 17:40:41
Updated by  : github-actions[bot]
Binaries    : php.exe | php-cgi.exe
Environment : PHP_INI_SCAN_DIR = <root>;<root>\conf.d;
Suggestions : extras/vcredist2019
```

### Správa balíčkov

Požadovanú aplikáciu môžem nainštalovať pomocou príkazu `scoop install`.

```sh
# ak uz je bucket pridany, mozem rovno instalovat
scoop install python

# alebo najskor pridam bucket
scoop bucket add versions
scoop install versions/python27
```

Nainštalovanú aplikáciu môžem neskôr odinštalovať príkazom `scoop uninstall`.

```sh
scoop uninstall googlechrome
```

Nainštalované aplikácie môžem ďalej zobraziť (`scoop list`) alebo ich jednotlivo alebo naraz všetky aktualizovať na novšie verzie (`scoop update`).

```sh
# zobrazi zoznam vsetkych nainstalovanych aplikacii
scoop list

# mozem aktualizvat len jednu, konkretnu aplikaciu
scoop update jq

# alebo mozem aktualizovat vsetky nainstalovane aplikacie
scoop update *

# zobrazi stav samotneho scoopu a aktualnost bucketov
scoop status
```

---

## Zdroj

- [Scoop wiki](https://github.com/ScoopInstaller/Scoop/wiki)
