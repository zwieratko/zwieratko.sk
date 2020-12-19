---
title: "Hugo – základy"
date: 2018-02-26T18:10:34+01:00
draft: false
description: Základy používania generátora statických stránok Hugo.
type: posts
tags:
  - Hugo
categories:
  - Poznámky
toc: true
---

[Hugo](https://gohugo.io/) je generátor statických stránok napísaný v jazyku Go. Podľa ich vlastného popisu najrýchlejší na svete. „Objektívne“ je vážne veľmi rýchly, ľahko použiteľný a dostatočne konfigurovateľný. Je to obdivuhodný a komunitou vyvíjaný kus softvéru s otvoreným zdrojovým kódom. Vlastne aj túto stránku má na svedomí Hugo.

Hugo spracuje adresáre s obsahom, šablónami a konfiguráciou a vytvorí z toho plnohodnotnú HTML stránku. Obsah vytvárame v textových súboroch pomocou značkovacieho jazyka [Markdown](/poznamky/2019-12-04-markdown-zaklady). Súbory majú príponu `.md`. Na začiatku súboru je časť nazvaná „front matter“, obsahujúca metadáta (dátum vytvorenia, názov, krátky popis, značky atď.), po nej nasleduje samotný obsah príspevku.

Hugo má spracovanú kvalitnú a podrobnú [dokumentáciu](https://gohugo.io/documentation/). Tento text sa ju nesnaží v žiadnom prípade nahradiť :),  má slúžiť len ako pripomienka pre mňa.

## Inštalácia

Celý Hugo je len jeden jediný spustiteľný súbor. Môžem si ho sám skompilovať, alebo použiť už skompilovanú verziu. Je vytváraný pre mnoho [platforiem](https://github.com/gohugoio/hugo/releases) (Linux, Mac, Windows) a v rôznych [formách](https://discourse.gohugo.io/t/hugo-0-64-1-released/).

Inštalovať ho je možné pomocou obľúbeného balíčkovacieho systému (brew, choco, scoop, snap), alebo aj len prekopírovaním binárky do adresáru, ktorý je zahrnutý v spustiteľnej ceste.

Najskôr si vytvorím adresár do ktorého budem Hugo sťahovať a v ňom vytvorím adresár pre konkrétnu verziu:

```sh
cd ~/Downloads
mkdir Hugo
cd Hugo
mkdir 0.36.1
cd 0.36.1
```

Stiahnem si požadovanú verziu, rozbalím archív, prekopírujem binárku:

```sh
wget https://github.com/gohugoio/hugo/releases/download/v0.36.1/hugo_0.36.1_Linux-64bit.tar.gz
tar -xvf *
cp hugo /usr/local/bin
hugo version
```

Správnosť inštalácie si overím zadaním `hugo version` v príkazovom riadku. Ak som postupoval správne, odpoveď je číslo nainštalovanej verzie:

```
Hugo Static Site Generator v0.36.1 linux/amd64 BuildDate: 2018-02-15T09:07:45Z
```

## Vytvorenie stránky

```sh
hugo new site test01
```

Na mieste odkiaľ to spúšťam vytvorí nový adresár `test01` a v ňom celú potrebnú adresárovú štruktúru pre novú stránku či blog.

## Pridanie témy

Prepnem sa do novovytvoreného adresáru. Pomocou gitu [pridám](https://discourse.gohugo.io/t/adding-a-theme-as-a-submodule-or-clone/8789) nejakú tému:

```sh
cd test01
git init
git submodule add https://github.com/Track3/hermit.git themes/hermit
```

Ďalej podľa inštrukcii ku danej téme upravím konfiguračný súbor `config.toml`.

## Pridanie obsahu

```sh
hugo new posts/prvy-prispevok.md
```

Tento príkaz vytvorí v adresári `content/posts` súbor `prvy-prispevok.md` v ktorom bude časť „front matter“ pripravená podľa vzoru v `/archetypes/default.md`. 

## Spustenie servera

Spustím webový server:

```sh
hugo server -D --bind=10.59.27.39 --baseURL=http://10.59.27.39:1313
```

Na miestnej ip adrese `10.59.27.39` je možné pomocou webového prehliadača sledovať novú stránku a testovať jej funkčnosť. Zmeny v konfiguračných súboroch, alebo v súboroch s obsahom sa prejavujú okamžite.

## Aktualizácia

Aktualizácia podobne ako samotná inštalácia spočíva vo vytvorení adresáru pre novú verziu, stiahnutí archívu, jeho rozbalení a prekopírovaní súboru `hugo` do adresáru `/usr/local/bin`:

```sh
cd ~/Downloads/Hugo
mkdir 0.64.1
cd 0.64.1
wget https://github.com/gohugoio/hugo/releases/download/v0.64.1/hugo_extended_0.64.1_Linux-64bit.tar.gz
tar -xvf *
cp hugo /usr/local/bin
```

Správnosť aktualizácie si overím zadaním `hugo version` v príkazovom riadku.

---

## Zdroj

- [gohugo.io](https://gohugo.io/getting-started/)
- [github.com](https://github.com/gohugoio/hugo)
