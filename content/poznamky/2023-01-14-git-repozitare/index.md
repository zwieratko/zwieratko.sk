---
title: Git – práca s repozitármi
date: 2023-01-14T17:02:21+01:00
draft: false
description: Git systém na správu verzii, základy práce so vzdialenými aj miestnymi repozitármi, ich vytváranie, pripájanie a klonovanie
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

Chcem zosumarizovať poznatky o základnej práci so vzdialenými a lokálnymi repozitármi, ich vytváranie, pripájanie a klonovanie v systéme na správu verzii Git.

### Príkazy

- [git init](https://git-scm.com/docs/git-init)
- [git clone](https://git-scm.com/docs/git-clone)
- [git submodule](https://git-scm.com/docs/git-submodule)
- [git remote](https://git-scm.com/docs/git-remote)

## Riešenie

### Vytvorenie vzdialeného úložiska vo webovom rozhraní

Poskytovateľ Bitbucket má túto možnosť na [adrese](https://bitbucket.org/repo/create).

- z rozbaľovacieho menu vybrať jednu z možností `Workspace`
- z rozbaľovacieho menu vybrať jednu z možností `Project`
- vyplniť pole `Repository name`
- nechať zaškrtnuté / odškrtnúť políčko `Access level`
- pri `Include a README?` vybrať jednu z možností `No` / `Yes`
- pri `Deafult branch name` dopísať predvolené meno vetvy
- pri `Include .gitignore` vybrať jednu z možností

Stlačiť tlačidlo `Create repository` / `Cancel`

Poskytovateľ GitLab má túto možnosť na [adrese](https://gitlab.com/projects/new#blank_project)

- vyplniť pole `Project name`
- vybrať z rozbaľovacieho menu `Project URL`
- vyplniť pole `Project slug`
- vybrať z rozbaľovacieho menu `Project deployment target (optional)`
- vybrať jednu z možností `Visibility level` – `Private` / `Public`
- nechať zaškrtnuté / odškrtnúť `Initialize repository with a README`
- nechať odškrtnuté / zaškrtnúť `Enable Static Aplication Security Testing (SAST)`

Stlačiť tlačidlo `Create project` / `Cancel`

Poskytovateľ GitHub má túto možnosť na [adrese](https://github.com/new)

- z rozbaľovacieho menu vybrať jednu z možností `Owner`
- vyplniť pole `Repository name`
- vyplniť pole `Description (optional)`
- vybrať jednu z možností `Public` / `Private`
- nechať odškrtnuté / zaškrtnúť `Add a README file`
- vybrať z rozbaľovacieho menu `.gitignore template`
- vybrať z rozbaľovacieho menu `License`

Stlačiť tlačidlo `Create repository`

---

### Vytvorenie lokálneho úložiska

Na ľubovoľnom mieste v adresárovej štruktúre môžem vytvoriť lokálny repozitár.

```bash
git init názov_úložiska
```

V prípade, že daný adresár už existuje, prepnem sa do neho a tam inicializujem nové úložisko.

```bash
cd nové_úložisko
git init
```

Lokálne úložisko môžem vytvoriť aj klonovaním. Je to metóda vytvorenia lokálneho úložiska vytvorením vernej kópie vzdialeného úložiska priamo na mojom disku.

```bash
git clone git@bitbucket.org:uzivatel/repo.git cielovy_adresar
```

Klonovaním sa v miestnom úložisku vytvorí len hlavná vetva vzdialeného úložiska. V prípade, že vzdialený repozitár obsahuje aj ďalšie vetvy a aj tie chcem klonovať do lokálneho repozitára, musím jednotlivé vetvy stiahnuť osobitne.

O práci s vetvami podrobnejšie viď neskôr v časti [Vetvenie].

Klonovať úložisko môžem aj s ďalšími vnorenými repozitármi (`submodules`).

```bash
git clone git@bitbucket.org:uzivatel/repo.git cielovy_adresar
cd cielovy_adresar
git submodule init
git submodule update
```

V novších verziách Gitu je klonovanie s vnorenými repozitármi jednoduchšie.

- verzie 1.9 a vyššie – `--recursive`
- verzie 2.8 a vyššie – `-j8` (až 8 modulov naraz)
- verzie 2.13 a vyššie – `--recurse-submodules`

```bash
git clone --recurse-submodules -j8 git@bitbucket.org:uzivatel/repo.git adresar
```

---

### Pripojenie lokálneho ku vzdialenému úložisku

Ak som vytvoril lokálne úložisko klonovaním tak pripojenie na vzdialené úložisko je už nastavené. Ak som však vytvoril lokálny repozitár pomocou `git init` potrebujem ho pripojiť ku vzdialenému repozitáru ručne.

```bash
git remote add origin git@gitlab.com:uzivatel/repo.git
```

Lokálne úložisko môžem pripojiť ku viacerým vzdialeným úložiskám.

```bash
git remote set-url origin --add git@github.com:uzivatel/repo.git
```

Po pripojení viacerých repozitárov `git push` odošle zaznamenané zmeny do všetkých takto nastavených vzdialených repozitárov, ale `git fetch / merge / pull` bude sťahovať zmeny len z pôvodného.

Môžem zobraziť všetky vzdialené pripojené repozitáre.

```bash
git remote -v
```

Odpoveď je zoznam plus informácia, ktoré úložiská budú použité na sťahovanie / odosielanie zmien.

```
origin  git@github.com:zwieratko/ssh-a-speed.git (fetch)
origin  git@github.com:zwieratko/ssh-a-speed.git (push)
origin  git@bitbucket.org:zwieratko/ssh-a-speed.git (push)
origin  git@gitlab.com:zwieratko/ssh-a-speed.git (push)
```

---

### Zmena typu pripojenia úložiska

V prípade, že bol repozitár pripojený cez HTTPS (autorizácia ~~heslom~~ / tokenom) môžem zmeniť pripojenie na SSH (autorizácia OpenSSH kľúčom).

```bash
git remote set-url origin git@gitlab.com:uzivatel/repo.git
```

Respektíve naopak zo SSH na HTTPS.

```bash
git remote set-url origin https://gitlab.com/uzivatel/repo.git
```

Zmeniť typ pripojenia môžem aj pre vnorený repozitár (`submodules`).

```bash
git submodule set-url vnoreny/adresar git@github.com:uzivatel/repo.git
```

---

## Zdroj

- [Push commits to an additional Git repository](https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-mirror-repo-pushes.html)
- [Git: Push to / Pull from Both Github and Bitbucket](https://blog.kevinlee.io/blog/2013/03/11/git-push-to-pull-from-both-github-and-bitbucket/)
- [How to “git clone” including submodules?](https://stackoverflow.com/questions/3796927/how-to-git-clone-including-submodules)
