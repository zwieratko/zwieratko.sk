---
title: APT – neoficiálne repozitáre
date: 2022-12-07T17:20:21+01:00
draft: false
description: Ako pridať neoficiálne APT úložisko podľa osvedčených postupov
type: posts
tags:
  - Debian
  - Linux
  - Apt
categories:
  - Poznámky
series:
  - APT
toc: true
---

## Cieľ

Chcem do systému pridať neoficiálne (externé) APT úložisko (repozitár), čo možno najpresnejšie podľa [odporúčaní](https://wiki.debian.org/DebianRepository/UseThirdParty) a osvedčených a zaužívaných postupov v prostredí operačných systémov Debian / Ubuntu.

Chcem zabezpečiť, aby boli pri inštalácii softvéru z tohto repozitára do systému pridané len požadované a očakávané softvérové balíčky a zároveň boli prenášané do systému bezpečným spôsobom.

## Upozornenie

Táto poznámka je len môj osobný a veľmi zjednodušený pohľad na prácu s APT. Nie je to v žiadnom prípade pokus o oficiálny a ani neoficiálny preklad dokumentácie. Neúmyselne tu môžu byť uvedené nepresné informácie alebo chyby!

Pridávanie repozitárov tretích strán so sebou nesie vždy istú mieru rizika. Pridávanie repozitárov, respektíve inštalovanie softvéru z nich môže viesť k nevratnému poškodeniu operačného systému!

## Riešenie

### Pridanie nového APT repozitára

- Každý pridávaný repozitár musí byť podpísaný s OpenPGP kľúčom
- Kľúč musí byť možné získať cez zabezpečené spojenie `https`
- Kľúč musí byť v systéme uložený výhradne na mieste, do ktorého môže zapisovať len hlavný administrátor (`root`)
- Kľúč nesmie byť uložený v `/etc/apt/trusted.gpg.d`
- Kľúč nesmie byť nahrávaný pomocou zastaralého `apt-key add`
- Kľúč by mal byť stiahnutý a uložený do `/usr/share/keyrings`

Najskôr potrebujem stiahnuť z overeného zdroja a cez zabezpečené spojenie OpenPGP kľúč pre požadovaný repozitár:

```bash
curl -fsSL https://nejaky.repozitar/kluc.gpg |\
sudo gpg --dearmor -o /usr/share/keyrings/kluc.gpg
```

Následne potrebujem vytvoriť záznam v [zoznamoch](https://manpages.debian.org/bullseye/apt/sources.list.5.en.html) použitých zdrojov pre nový repozitár. Na výber mám dve možnosti, ako môžem pridať záznam v podobe novovytvoreného súboru v adresári `/etc/apt/sources.list.d/`:

- `nazov_repozitara.list` – pôvodný, jednoriadkový záznam:
```
deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ buster main
```

- `nazov_repozitara.sources` – novší, viacriadkový záznam (Deb822):
```
Types: deb
URIs: https://packages.sury.org/php/
Suites: buster
Components: main
Signed-By: /usr/share/keyrings/deb.sury.org-php.gpg
```

Pre každý repozitár pridám samostatný súbor. Cesta v položke `Signed-By` musí viesť priamo k súboru s kľúčom, nie ku odtlačku prsta.



Konečne je možné vykonať aktualizáciu zdrojov, aby sa zohľadnilo pridanie nových repozitárov a potom je možné z nich inštalovať požadované balíčky:

```bash
sudo apt update
sudo apt install názov_nového_balíčku
```

---

### Úprava starým spôsobom pridaného APT repozitára

Ak som v minulosti pridal APT repozitár ku zdrojom systému pomocou `add-apt-repository`, alebo kľúč k nemu pomocou `apt-key add` je potrebné to opraviť.

Najskôr zistím pomocou `apt-key list`, ktoré kľúče boli takto pridané:

```bash
apt-key list
```

Výstupom je zoznam pridaných dôveryhodných kľúčov uložených v `/etc/apt/trusted.gpg`, tie chcem zmazať, alebo uložených v `/etc/apt/trusted.gpg.d/php.gpg`:

```
/etc/apt/trusted.gpg
--------------------
pub   rsa3072 2020-05-17 [SC]
      C03B 4888 7D5E 56B0 4671  5D32 97BD 1A01 3344 9C3D
uid           [ unknown] Gerardo Orellana <goaccess@prosoftcorp.com>
sub   rsa3072 2020-05-17 [E]
```

Na identifikáciu kľúča, ktorý chcem zmazať potrebujem jeho „odtlačok prsta“ – riadok medzi riadkami začínajúcimi s `pub` a `uid`, je to 10 skupín po 4 znaky vrátane medzier, alebo postačuje aj posledných 8 znakov bez medzery (`keyID`):

```bash
sudo apt-key del "C03B 4888 7D5E 56B0 4671  5D32 97BD 1A01 3344 9C3D"
# alebo
sudo apt-key del 33449C3D
```

Odpoveďou je jednoduché `OK`.

Ak sú záznamy o repozitári uložené v `/etc/apt/sources.list`, tak tam ich zakážem vložením znaku mriežka `#` na začiatok zodpovedajúceho riadku, teda zo záznamu spravím komentár.

Ďalej postupujem akoby som pridával nový repozitár, viď kapitola vyššie. Stiahnem a uložím kľúč pre dané úložisko do `/usr/share/keyrings` a pridám záznam o úložisku, vytvorením nového súboru v adresári `/etc/apt/sources.list.d/`.

Proces zakončím aktualizáciou zdrojov, aby sa vykonané zmeny prejavili:

```bash
sudo apt update
```

---

## Zdroj

- [DebianRepository UseThirdParty](https://wiki.debian.org/DebianRepository/UseThirdParty)
- [Fix the apt-key deprecation error in Linux](https://opensource.com/article/22/9/deprecated-linux-apt-key)
- [How To Handle apt-key and add-apt-repository Deprecation...](https://www.digitalocean.com/community/tutorials/how-to-handle-apt-key-and-add-apt-repository-deprecation-using-gpg-to-add-external-repositories-on-ubuntu-22-04)
- [apt-key Is Deprecated. How To Add OpenPGP Repository Signing Keys](https://www.linuxuprising.com/2021/01/apt-key-is-deprecated-how-to-add.html)
