---
title: Git – zaznamenávanie zmien
date: 2023-01-16T10:38:46+01:00
draft: false
description: Git systém na správu verzii, pridávanie súborov a adresárov do prípravnej oblasti a vykonávanie záznamu o zmenách v úložisku
type: posts
tags:
  - Git
  - Linux
  - Windows
categories:
  - Poznámky
series:
  - Git
toc: true
---

## Cieľ

Chcem zosumarizovať poznatky o spôsobe pridávania súborov do prípravnej oblasti a aj o vykonávaní záznamu o zmenách v úložisku v systéme na správu verzii Git.

### Príkazy

- git add
- git mv
- git rm
- git commit
- git reset

## Riešenie

Ak vykonám akékoľvek zmeny v súboroch, ktoré sú pod kontrolou systému na správu verzii, môžem o tom vykonáť záznam, no najskôr musím presne určiť, ktoré zmeny to sú.

Toto je vlastne kľúčová úloha systému Git, uchovávať presné záznamy o tom čo presne a kým presne bolo pozmenené. V prípade potreby je teda možné „jednoducho“ zmeny zvrátiť. A preto je veľmi dôležité pridávať a následne zaznamenávať zmeny po nejakých zmysluplných, logických častiach.

Ak napríklad na danom projekte vykonám zmeny v dokumentácii, vo vzhľade aplikácie, vo vnútornej logike, a ešte aj v spôsobe ukladania dát, tak je vyslovene nevhodné všetky tieto nesúvysiace zmeny pridať spolu do prípravnej oblasti  a vykonať o nich jeden spoločný záznam o zmene. Na to presne využijem pridávanie do prípravnej oblasti. Pridám tam len tie súbory, alebo ich časti, ktoré spolu súvisia a tvoria jeden logický celok, pridajú jednu vlastnosť alebo odstránia jeden problém. Dodržiavať túto zásadu o pridávani zmien po menších častiach je veľmi dôležité pravidlo!

---

### Pridanie súborov do prípravnej oblasti

Zmenené súbory, alebo ich časti možem pridať do zoznamu zmien – prípravnej oblast (`index` alebo `staging area`) pomocou príkazu `git add`.

```bash
# súbory môžem pridať jednotlivo podľa mien
git add subor01 subor02

# alebo podľa časti mena
git add subor*

# môžem pridať všetky nové a modifikované, ale nie zmazané
git add .
# na konci je bodka

# všetky modifikované a zmazané, ale nie nové
git add -u

# úplne všetky, aj nové, aj modifikované aj zmazané
git add -A
```

Môžem pridať len časť zmien, nie celé súbory.

```bash
git add --interactiv

# alebo len pre konkrétny súbor
git add --patch nazov_suboru

# alebo 
git add -p nazov_suboru
```

Zobrazí sa vybraná časť zmeny (zelenou farbou) a ponuka možností:

- `y` – pridať túto časť (hunk) do prípravnej oblasti
- `n` – nepridať túto časť do prípravnej oblasti
- `q` – skončiť a nepridať nič viac
- `a` – pridať túto a všetky následujúce časti
- `d` – nepridať túto ani žiadnu následujúcu časť
- `g` – vybrať časť kam sa presunúť
- `/` – nájsť časť podľa zadaného vzoru (regex)
- `j` – ponechať túto časť nevybratú a prejsť na ďalšiu nevybratú
- `k` – ponechať túto časť nevybratú a prejsť na predošlú nevybratú
- `K` – ponechať túto časť nevybratú a prejsť na predošlú časť
- `s` – rozdeliť túto časť na menšie
- `e` – ručne rozhodnúť o tejto časti
	- nahradiť znak mriežka `#` znakom pre pridanie `+` / odobratie `-`
- `?` – vytlačiť pomoc

Po skončení výberu častí, môžem skontrolovať správnosť tým, že zobrazím zmeny, ktoré sú pridané do prípravnej oblasti.

```bash
git diff --cached

# alebo to isté
git diff --staged
```

V prípade, že chcem odobrať z prípravnej oblasti omylom pridaný súbor alebo jeho časť, môžem to urobiť tiež aj interaktívne.

```bash
# odbratie celého suboru
git reset -- subor

# interaktívne odobratie
git reset --patch

# alebo skrátene
git reset -p
```

Zobrazia sa časti pridané do prípravnej oblasti označené zelenou a ponuka možností podobná ako vyššie pri pridávaní. Požadované časti môžem odoberať z prípravnej oblasti.

---

### Odobratie  / presunutie súborov v úložisku

V prípade potreby odstránenia súboru z repozitáru alebo jeho presunu na iné miesto v repozitári nevykonám to na úrovni manipulácie so súbormi v súborovom systéme (príkazy cp, mv, alebo grafický správca súborov), ale takúto zmenu vykonám pomocou príkazov git.

```bash
# na presun suboru do adresára
git mv stara/cesta/subor novy/adresar

# na presun viacerých súborov do adresára
git mv subor1 subor2 adresar

# na odstránenie
git rm subor
```

---

### Zaznamenanie zmien v úložisku

Ak už mám v prípravnej oblasti pridané (odstránené, presunuté) požadované súbory, alebo ich časti, môžem o tom vykonať záznam - záznam o zmene v úložisku (`commit`).

```bash
git commit
```

Po zadaní príkazu sa spustí predvolený editor v ktorom je potrebné napísať doplňujúce informácie ohľadom zaznamenávanej zmeny.

Záznam o zmene by mal obsahovať aspoň dve časti:

- subjekt - nadpis, stručné zhrnutie
- telo - podrobnejšie vysvetlenie

Odporúčania ako správne napísať správu o zmene (commit message):

- Nepoužívať prepínač `-m` a `--message=`
- Oddeliť subjekt a telo jednym prázdnym riadkom
- Obmedziť subjekt na maximálne 50 znakov
- Začať subjekt veľkým písmenom
- Neukončiť subjekt bodkou
- Použiť rozkazovací spôsob v subjekte
- Zalamovať riadky v tele na 72 znakov
- Využiť telo na vysvetlenie čo a prečo namiesto ako

Takto zaznamenaná zmena má svoj jednoznačný identifikátor, ktorý sa vypočíta ako SHA-1 (kryptografická hašovacia funkcia) z objektu ktorý obsahuje tieto informácie:

- pripojená správa o zmene
- údaje o osobe ktorá zmenu aplikovala (meno a email)
- dátum a čas aplikovania zmeny
- údaje o autorovi, osobe ktorá zmenu napísala (meno a email)
- dátum a čas napísania zmeny
- SHA-1 vypočítaná z celého pracovného adresáru
- jednoznačný identifikátor priamo predchádzajúcej zaznamenanej zmeny

Výsledkom výpočtu je 160 bitový reťazec (20 bytov), ktorý je možné zapísať pomocou 40 znakov. Z toho už prvých sedem znakov postačuje na jednoznačné odlíšenie uložených verzii.

Z toho vyplýva, že aj sebe menšia zmena akéhokoľvek z vyššie uvedených údajov spôsobí vygenerovanie nového, iného a jednoznačného identifikátora.

---

### Odstránenie / zmena záznamov o zmene (lokálne)

Pre následujúce platí zásadna podmienka, že vykonané záznamy o zmene (`git commit`) ešete neboli odolsané na vzdialené úložisko!

Ak potrebujem len zmeniť text v poslednom zázname o zmene, ktorý ešte nebol odoslaný na vzdialený repozitár.

```bash
git commit --amend
```

Pokiaľ nebol ešte záznam o zmene odoslaný na vzdialené úložisko (`git push`), môžem takýto záznam odstrániť tak, že ponechám zmenené súbory v prípravnej oblasti a odstránim len záznam o zmene.

```bash
git reset --soft HEAD~
```

Alebo môžem spolu s odstránením záznamu o zmene odobrať aj pozmenené súbory z prípravnej oblasti (`unstage`).

```bash
git reset HEAD~

# alebo tiež
git reset --mixed HEAD~
```

Alebo ešte môžem aj okrem odstránenia posledného záznamu o zmene a odobratí pozmenených súborov z prípravnej oblasti, zvrátiť aj zmeny na tých súboroch. Čiže pracovný adresár sa ocitne ako v stave tesne po predposlednom zázname o zmene.

```bash
git reset --hard HEAD~

# môžem kompletne odstrániť aj viac posledných zmien !!
git reset --hard HEAD~3
# odstráni 3 posledné záznamy o zmene aj so všetkými zmenami v súboroch
# plus odstrání všetky súbory pridané počas posledných 3 záznamov !!
```

Pozor! Toto teda odstráni aj novo pridané súbory, nie len zmeny na starých! A taktiež odstráni **nevratne** všetky zmeny o ktroých nebol vykonaný záznam o zmene!

Preto ak potrebujem vykonať `git reset --hard` je vyslovene vhodné zmeny ktoré ešte nie sú zaznamenané a chcem ich uchovať odložiť bokom - `git stash`.

---

#### Doplniť:

- zaznamenanie zmien v submoduloch
- pred vyplneny vzor pre správu v zázname o zmene

---

## Zdroj

- [The anatomy of a Git commit](https://blog.thoughtram.io/git/2014/11/18/the-anatomy-of-a-git-commit.html)
- [How to Write a Git Commit Message](https://cbea.ms/git-commit/)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
