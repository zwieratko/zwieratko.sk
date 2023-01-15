---
title: Čas poslednej zmeny príspevku – Hugo
date: 2022-12-28T07:05:34+01:00
draft: false
description: Ako implementovať zobrazenie dátumu a času poslednej zmeny príspevku do témy v generátore statických stránok Hugo.
type: posts
tags:
  - Hugo
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem pridať možnosť zobraziť čas poslednej zmeny príspevku do používanej témy v generátore statických stránok [Hugo](https://gohugo.io/). Správny dátum a čas poslednej zmeny by mal byť doplnený aj pri lokálnom generovaní stránky, ale aj pri automatickom generovaní a nasadzovaní v prostredí GitHub Actions.

Ako čas poslednej zmeny príspevku chcem použiť dátum a čas vykonania záznamu o zmene (`commit`) v systéme na správu verzii Git.

## Riešenie

Mohol by som dátum poslednej zmeny zadávať ručne, v úvodnej časti príspevku `frontmatter` by som vytvoril ďalšiu položku `lastmod`, kde by som po vykonanej zmene zakaždým ručne zadal dátum a čas tej zmeny, no toto je prácne riešenie. Využijem radšej dátum a čas zmeny uchovaný v systéme na správu verzii Git.

Podmienkou je aby bol v systéme kde sa zostavuje stránka nainštalovaný Git, aby bol adresár so stránkou pod správou systému na správu verzii a do tretice je potrebné túto vlastnosť povoliť v samotnom generátore Hugo.

### Povoliť vlastnosť generátora Hugo

V prvom rade musím umožniť generátoru Hugo pristupovať ku informáciám v úložisku Git.

Môžem túto vlastnosť zapnúť v hlavnom konfiguračnom súbore stránky `config.toml`, v jeho úvodnej časti, popri základnej URL, názve, téme atď., pridaním riadku:

```toml
enableGitInfo = "true"
```

Alebo môžem túto vlastnosť zapínať pridaním voľby `--enableGitInfo` priamo v príkazovom riadku pri spúštaní procesu zostavovania stránky, napríklad:

```bash
hugo --enableGitInfo --minify --buildDrafts
```

### Nastaviť parametre stránky

Ďalej musím upraviť nastavenie, ako bude Hugo priraďovať dátumy ku generovanému obsahu stránky. Úpravu vykonám opäť v hlavnom konfiguračnom súbore projektu `config.toml`, v časti `[frontmatter]`:

```toml
[frontmatter]
  date = [ "date", "publishDate", "lastmod"]
  lastmod = ["lastmod" ,":git", "date", "publishDate"]
  publishDate = ["publishDate", "date"]
  expiryDate = ["expiryDate"]
```

Jednotlivé položky majú samo vysvetľujúce názvy, využijem len prvé dva.

- `date` – dátum a čas vytvorenia príspevku, bude doplnený v poradí:
	- `date` – dátum a čas uvedený v záhlaví (`frontmatter`) príspevku
	- `publishDate` – ak nebude uvedený `date`
	- `lastmod` – použije sa ak nebude v záhlaví ani `publishDate`

- `lastmod` – dátum a čas poslednej zmeny príspevku:
	- `lastmod` – použije sa údaj uvedený v záhlaví príspevku
	- `:git` – ak nebude v záhlaví uvedený `lastmod` použije sa údaj z Gitu
	- `date` – ak nebude dostupný údaj z Gitu, použije sa `date` v záhlaví
	- `publishDate` – ak nebude uvedený ani `date` v záhlaví príspevku

Čas vytvorenia je štandardne uvedený v záhlaví príspevku (`frontmatter`), záznam vzniká automaticky pri vytváraní príspevku. A pokiaľ je projekt v Gite, tak čas poslednej zmeny sa získa z histórie záznamov o zmene v repozitári. Takže obe hodnoty budú dopĺňané automaticky.

### Vložiť čas poslednej zmeny na stránku

V prípade, že použitá téme už má niekde pri príspevku umiestnenú informáciu o čase poslednej zmeny, môžem tento krok preskočiť.

Ak téma nepridáva tieto dáta ku príspevku a som rozhodnutý kam na vygenerovanú stránku chcem umiestniť informáciu o čase poslednej zmeny, upravím súbor so šablónou pre príspevok `single.html`. Je umiestnený v adresári s témou, do neho pridám na požadované miesto riadok, kde sa má zobraziť čas zmeny. Môžem tiež určiť formát v akom sa má dátum a čas `.Lastmod` zobraziť.

`themes/názov-témy/layouts/posts/single.html`

```go
{{ dateFormat "2006-01-02 15:04 -0700" .Lastmod.Local }}
```

### Doplniť parametre v CI/CD

Pokiaľ ide o lokálne zostavenie a nasadenie stránky na hosting z osobného počítača, je to všetko, pri každom príspevku bude okrem tradičného času vzniku uvedený aj čas poslednej zmeny vychádzajúci z dátumu a času posledného záznamu o zmene ku danému príspevku.

Ak však zostavovanie a nasadzovanie prebieha automaticky (CI/CD) v GitHub Actions, je potrebné ešte upraviť jeden parameter v konfiguračnom súbore `.github/workflows/workflow-01.yml`:

```yml
    steps:
    - name: Checkout the branch with submodules
      uses: actions/checkout@v3
      with:
        ref: 'test3'
        submodules: 'true'
        fetch-depth: '0'
```

V úvodnej časti konfiguračného súboru `actions/checkout@v3` zodpovednej za prípravu repozitára a prepnutie do zvolenej vetvy v prostredí `$GITHUB_WORKSPACE` doplním v časti `with` parameter `fetch-depth` a hodnotu `0`, aby bol umožnený prístup k celej histórii zmien zvolenej vetvy.

Takže po každom odoslaní zmien do úložiska (`git push`) a následne spustenom zostavovaní stránky, bude pri každom príspevku doplnený posledný čas zmeny podľa času posledného záznamu o zmene (`git commit`) pre daný príspevok.

---

## Zdroj

- [Git Info Variables – Hugo](https://gohugo.io/variables/git/)
- [Page Variables – Hugo](https://gohugo.io/variables/page/)
- [.Format – Hugo](https://gohugo.io/functions/format/)
- [Problems with GitInfo in CI](https://discourse.gohugo.io/t/problems-with-gitinfo-in-ci/22480)
