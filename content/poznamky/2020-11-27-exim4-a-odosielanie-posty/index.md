---
title: "Exim4 a odosielanie pošty"
date: 2020-11-27T09:17:36+01:00
draft: false
description: Ako nastaviť server na odosielanie emailových správ pomocou smarthosts.
type: posts
tags:
  - Exim4
  - Debian
  - Linux
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem umožniť serveru, respektíve jeho súčastiam automaticky odosielať emailové správy, bez nutnosti rozchodiť plnohodnotný poštový server.

Je potrebné aby server mohol odosielať emaily typu hlásenie o stave alebo správy o zlyhaní a tak podobne.

## Riešenie

Keďže nechcem na serveroch inštalovať a spravovať plnohodnotné poštové servery, využijem služieb s Debianom štandardne dodávaného poštového agenta zodpovedného za prenos správ [Exim4](https://www.exim.org/) v spojení s inteligentnými poštovými servermi iných poskytovateľov -- `smarthost`.

Kvôli bezpečnosti a prehľadnosti je pre každý server vhodné vytvoriť nový, samostatný emailový účet u externého poskytovateľa emailových služieb.

### Inštalácia

Pred samotnou inštaláciou vykonám najskôr obligátnu aktualizáciu systému a potom nainštalujem balíček `exim4` ak ho ešte nemám.

```sh
sudo apt update &&\
sudo apt list --upgradable &&\
sudo apt upgrade &&\
sudo apt install exim4
```

### Konfigurácia

Spustím základné nastavenie programu `Exim4`.

```sh
sudo dpkg-reconfigure exim4-config
```

Je to interaktívny proces, potrebujem vyplniť požadované údaje alebo odpovedať na otázku:

1. Vyberiem možnosť `mail sent by smarthost; received via SMTP or fetchmail` -- základný spôsob ako bude Exim4 fungovať.
2. Ponechám pred nastavené `meno-systému` -- poštový názov počítača.
3. Zadám `127.0.0.1;::1` -- bodkočiarkami oddelený zoznam IP adries na ktorých je očakávané prichádzajúce spojenie SMTP.
4. Ponechám nevyplnené -- bodkočiarkami oddelený zoznam domén pre ktoré sa prijíma pošta.
5. Ponechám nevyplnené -- rozsah IP adries počítačov pre ktoré budeme smarthost.
6. Zadám `smtp.zoho.com::587` -- doména a dvoma dvojbodkami oddelené číslo portu inteligentného poštového serveru (smarthost) pre odchádzajúcu poštu
7. Vyberiem možnosť `No` -- skryť lokálny názov servera?
8. Vyberiem možnosť `No` -- minimalizovať počet DNS požiadaviek?
9. Vyberiem možnosť `mbox format in /var/mail/` -- spôsob ukladania lokálne prijatej pošty
10. Vyberiem možnosť `Yes` -- rozdeliť nastavenie do menších súborov?
11. Zadám meno užívateľa s ktorým pracujem

Proces je možné opakovať.

Do ďalšieho konfiguračného súboru doplním prihlasovacie údaje ku novo vytvorenému emailovému účtu, ktorý chcem použiť na odosielanie pošty.

```sh
sudo nano /etc/exim4/passwd.client
```

Doplním záznam o doméne poskytovateľa, poštovom účte a hesle k nemu v tvare:

```
*.doména.poskytovateľa.com:poštový@účet.sk:tajnéheslo
```

Údaje sú oddelené dvojbodkou.

Nastavím ešte poslednú vec. Ku jednotlivým užívateľom systému nastavím emailové adresy pre odchádzajúcu poštu.

```sh
sudo nano /etc/email-addresses
```

Záznam pre každého užívateľa na novom riadku v tvare:

```
užívateľ1: emailová@adresa.sk
užívateľ2: iná@adresa.sk
```

V [manuálových stránkach](https://manpages.debian.org/testing/exim4-config/etc-email-addresses.5.en.html#/etc/email-addresses) som sa dočítal, že: "/etc/email-addresses
is used to rewrite the email addresses of users. This is particularly useful for users who use their ISP's domain for email.", no ak tu nastavím akúkoľvek inú emailovú adresu ako tú ktorú používam na prístup ku poštovému účtu, tak nie je možné odosielať poštu.

Po úspešnom nakonfigurovaní vykonám aktualizáciu nastavení agenta `Exim4`, znovu načítam jeho službu a pokúsim sa ho donútiť odoslať aj pred tým neodoslané (zamrznuté) správy.

```sh
sudo update-exim4.conf
sudo systemctl restart exim4
sudo exim4 -qff
```

Ak je všetko v poriadku, nemal by som dostať žiadnu odpoveď. Konfigurácia poštového agenta `Exim4` je ukončená.

### Testovanie

Pokúsim sa odoslať jednoduchý email.

```sh
echo "Telo testovacieho emailu." | mail -s "Subjekt testovacieho emailu" adresat@posta.com
```

Či už sa to podarí alebo nie, nedostanem žiadnu odpoveď. Môžem skontrolovať logy poštového agenta.

```sh
sudo tail /var/log/exim4/mainlog
```

Zo záznamov môžem vyčítať informáciu o úspešnom doručení ale aj prípadnú príčinu problému.

### Nastavenie mena odosielateľa

Ako meno odosielateľa emailu je použité celé meno užívateľa zadané pri inštalácii operačného systému, alebo vytváraní nového užívateľa.

V prípade, že chcem toto celé meno zmeniť pre užívateľa s prihlasovacím menom `username` zadám:

```sh
sudo chfn -f "Nové Celé Meno" username
```

Novo nastavené celé meno môžem skontrolovať pomocou príkazu `finger`, alebo:

```sh
getent passwd username
```

Meno užívateľa je piata položka výstupu oddelená dvojbodkou.

---

## Zdroj

- [wiki.debian.org](https://wiki.debian.org/Exim4Gmail)
