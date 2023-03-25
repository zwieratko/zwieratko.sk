---
title: Git (systém na správu verzii) – základy
date: 2023-01-13T11:56:38+01:00
draft: true
description: Git systém na správu verzii, objasnenie základných pojmov, inštalácia a úvodné nastavenie
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

Chcem objasniť základné pojmy a zosumarizovať poznatky ohľadom inštalácie a úvodného nastavenia systému na správu verzii Git.

### Príkazy

- git version
- git config

## Riešenie

### Základné pojmy

- `Repository` – repozitár je dátové úložisko. Obsahuje: súbory a dáta o nich, v podobe uložených snímok súborového systému v čase, záznamy o vykonaných zmenách, vytvorené vetvy, kópie vytvorené v určitom čase. Je to vlastne databáza obrazov stavu súborového systému, resp. záznamy o tom v akom stave sa nachádzali zahrnuté súbory v okamihoch keď boli vykonané záznamy o zmene (commits).

- `Remote repository` – vzdialený repozitár, zvyčajne niekde na internete, v cloude, u rôznych poskytovateľov (GitHub, GitLab, Bitbucket atď.), ale môže byť aj na vlastných serveroch.

- `Working directory` – lokálna pracovná kópia repozitáru v počítači v ktorej môžem pracovať so súbormi.

- `Stage area / Index` – vrstva medzi pracovným adresárom a lokálnym repozitárom. Je to vlastne zoznam zmien v súboroch o ktorých je možné vykonať záznam o zmene (commit).

- `Commit` – záznam o vykonanej zmene. Obsahuje informácie o tom kto a kedy vykonal zmenu, popis vykonanej zmeny a jednoznačný identifikátor zmeny a aj priamo jej predchádzajúcej zmeny.

- `Branch` – vetva, kópia repozitáru v istom čase, izolovaná od ostatných, v ktorej je možné vykonávať zmeny na súboroch, s vlastnou históriou. Medzi rôznymi vetvami sa je možné prepínať. Vetvy je možné naspäť začleňovať jednu do druhej, spájať ich.

- `Main` (~~Master~~) – zvyčajne hlavná, lokálna aj vzdialená vetva, v repozitári.

- `Head` – ukazuje na posledný záznam (commit) o zmene v každej vetve (branch).

- `Checkout` – prepína z aktuálnej do akejkoľvek inej vetvy, a podáva informácie o stave v danej vetve.

- `Clone` – vytvorenie vernej kópie repozitáru jeho stiahnutím, klonovaním do počítaču. Naklonovaný repozitár môžem udržiavať naďalej zosynchronizovaný s pôvodným pomocou sťahovania a zasielania zmien (`git pull / push`).

- `Fork` – vytvorenie vernej kópie repozitáru vytvorením ďalšieho, zvyčajne vzdialeného repozitáru. Vykoná sa pomocou `git clone`. Obsahuje tie isté súbory aj s históriou. Takto vytvorený repozitár vyzerá, ako novo vytvorený repozitár obsahujúci súbory, ako pôvodný v čase vytvárania kópie. Môže takto vzniknúť alternatívna cesta vývoja projektu.

„Forkovanie“ je koncept, klonovanie je proces. Obe činnosti využívajú príkaz `git clone`.

---

![Git - základné pojmy](git-zakladne-pojmy.png)

---

### Inštalácia

#### Linux

1. Debian / Ubuntu priamo z úložiska operačného systému pomocou `apt`.

```bash
sudo apt update
sudo apt install git
```

2. Ubuntu, najnovšiu verziu z úložiska tretej strany.

```bash
sudo add-apt-repository ppa:git-core/ppa
sudo apt update
sudo apt install git
```

3. Debian / Ubuntu zostaviť najnovšiu verziu (s použitím staršej verzie).

```bash
sudo apt update
# nástroje potrebné na stiahnutie a zostavenie
sudo apt install make libssl-dev libghc-zlib-dev libcurl4-gnutls-dev \
libexpat1-dev gettext
# naklonujem repo so zdrojákmi
git clone https://github.com/git/git.git
# prepnem sa do novovytvoreného adresára
cd git
# zostavím a nainštalujem Git
make prefix=/usr/local all
sudo make prefix=/usr/local install
```

Správnosť inštalácie overím kontrolou nainštalovanej verzie.

```bash
git version

# ak sa ešte stále hlási staršia verzia z /usr/bin
# nechám zabudnúť všetky cesty k programom
hash -r
# a znova skúsim zobraziť verziu
git version
```

Cesta ku ručne nainštalovanej verzii `/usr/local/bin` má zvyčajne vyššiu prioritu ako cesta ku verzii inštalovanej balíčkovacím systémom `/usr/bin`.

#### Windows

```powershell
winget install --id Git.Git -e --source winget
```

Úspešnosť inštalácie overím v oboch systémoch rovnako, kontrolou nainštalovanej verzie.

```bash
git version
```

---

### Úvodné nastavenie

Po nainštalovaní potrebných balíčkov nastavím základné údaje.

``` bash
git config --global user.name "John Doe"
git config --global user.email johndoe@example.com
git config --global core.editor "nano -r 72"

# alebo prítulnejší Visual Code
git config --global core.editor "code --wait"
```

Ak pracujem vo viacerých operačných systémoch, ktoré rôznym spôsobom [ukončujú riadok](https://en.wikipedia.org/wiki/Newline), je vhodné nastaviť jednotný spôsob.

```bash
# v zmiešanom prostredí MS Windows / Linux / Mac
git config --global core.autocrlf false
git config --global core.eol lf
git config --global core.filemode false

# plus v každom repozitári
git config --local core.autocrlf false
git config --local core.eol lf
git config --local core.filemode false
```

Nastavené hodnoty môžem zobraziť.

``` bash
git config --list

# alebo aj s umiestnením kde je dané nastavenie uložené
git config --list --show-origin

# a ešte aj s rozsahom pôsobnosti
git config --list --show-origin --show-scope
```

---

Konfiguráciu Gitu je možné vykonať na rôznych úrovniach, s rozdielnym rozsahom pôsobnosti:

- systémová úroveň
	- prepínač `--system`
	- na úrovni celého systému
	- platí pre všetkých užívateľov a pre všetky repozitáre
	- akákoľvek nižšia úroveň ju prepíše
	- v Linuxe je uložené nastavenie v súbore `/etc/gitconfig`
	- v MS Windows `C:\Program Files\Git\etc\gitconfig`

- globálna úroveň
	- `--global`
	- často používaná
	- platí pre všetky repozitáre daného užívateľa
	- v Linuxe `$HOME/.gitconfig`
	- v MS Windows `$env:userprofile\.gitconfig`

- lokálna úroveň
	- `--local`
	- pred nastavená úroveň, ak nie je uvedený žiadny prepínač
	- prepíše nastavenia z vyšších úrovní
	- platí len v rámci daného repozitára
	- Linux `<git-repo>/.git/config`
	- MS Windows `<git-repo>\.git\config`

- adresárová úroveň
	- `--worktree`
	- najnižšia úroveň pôsobnosti
	- prepíše všetky ostatné úrovne
	- platí len v adresári a jeho pod adresároch
	- Linux `<git-repo>/.git/config.worktree`
	- MS Windows `<git-repo>\.git\config.worktree`

---

## Zdroj

- [Pro Git](https://git-scm.com/book/cs/v2)
- [Systémy pre správu verzií](https://kurzy.kpi.fei.tuke.sk/zsi/labs/02-git.html)