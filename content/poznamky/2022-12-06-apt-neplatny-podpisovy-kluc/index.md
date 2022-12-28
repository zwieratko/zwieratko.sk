---
title: APT – neplatný podpisový kľúč
date: 2022-12-06T08:31:37+01:00
draft: false
description: Ako obnoviť platnosť OpenPGP podpisového kľúča ku APT úložisku
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

Chcem obnoviť platnosť neplatného podpisového kľúča ku neoficiálnemu APT úložisku v prostredí operačných systémov Debian / Ubuntu. Chybný kľúč znemožňuje vykonať obnovu všetkých zdrojov a následne znemožňuje vykonať aktualizáciu balíčkov z postihnutých repozitárov.

## Upozornenie

Táto poznámka je len môj osobný a veľmi zjednodušený pohľad na prácu s APT. Nie je to v žiadnom prípade pokus o oficiálny a ani neoficiálny preklad dokumentácie. Neúmyselne tu môžu byť uvedené nepresné informácie alebo chyby!

Toto riešenie je zastaralé! Je možné ho použiť maximálne po vydania Debian 11 alebo Ubuntu 22.04 alebo distribúcie z nich odvodené. Pre novšie vydania uvedených operačných systémov je potrebné použiť novšiu metódu pri manipulácii s OpenPGP kľúčmi ku repozitárom.

## Riešenie

Repozitáre na inštaláciu softvéru sú zvyčajne podpísané OpenPGP kľúčom, ktorý má cielene obmedzenú životnosť. Po [exspirácii](https://jazykovaporadna.sme.sk/q/1233/) takého kľúča, resp. po jeho zneplatnení (`revocation`), sa pri snahe o obnovu zdrojov (`sudo apt update`) objaví chybové hlásenie:

```
...
W: An error occurred during the signature verification. The repository...
...The following signatures were invalid: EXPKEYSIG 97BD1A0133449C3D...
...
```

Znamená to, že pre daný repozitár je uložený neplatný podpisový kľúč a je potrebné ho obnoviť.

Môžem zobraziť všetky kľúče:

```bash
sudo apt-key list
```

Odpoveďou je zoznam všetkých dôveryhodných kľúčov aj s ich „odtlačkom prsta“, snažím sa nájsť tie pri ktorých je uvedené `expired`:

```
pub   rsa3072 2020-05-17 [SC] [expired: 2022-05-17]
      C03B 4888 7D5E 56B0 4671  5D32 97BD 1A01 3344 9C3D
uid           [ expired] Gerardo Orellana <goaccess@prosoftcorp.com>
```

Práve 8 posledných znakov z odtlačku prsta (stredný riadok) jednoznačne identifikujú kľúč (`keyID`) s vypršanou dobou platnosti.

Následne môžem požiadať spoľahlivý server s kľúčmi o obnovu údajov o danom kľúči:

```bash
sudo apt-key adv --keyserver hkps://keyserver.ubuntu.com --recv-keys 33449C3D
```

V prípade, že požadovaný kľúč je uložený na zadanom serveri, dostanem odpoveď o úspešnom importovaní kľúča:

```
Executing: /tmp/apt-key-gpghome.3IB7cKQh12/gpg.1.sh --keyserver hkps://keyserver.ubuntu.com --recv-keys 33449C3D
gpg: key 97BD1A0133449C3D: public key "Gerardo Orellana <goaccess@prosoftcorp.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

Môžem spustiť obnovu zdrojov `sudo apt update` a proces by mal prebehnúť už bez chybového hlásenia.

> Nástroj na správu kľúčov `apt-key` je zastaralý (`deprecated`) a bude dostupný už len vo verziách Debian 11 a Ubuntu 22.04 (a z nich odvodených distribúciách)!

---

## Zdroj

- [How to Solve an Expired Key (EXPKEYSIG) with Apt](https://tecadmin.net/expired-key-expkeysig-with-apt/)
