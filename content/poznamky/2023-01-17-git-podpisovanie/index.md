---
title: Git – podpisovanie záznamov o zmenách
date: 2023-01-17T12:38:46+01:00
draft: fasle
description: Git systém na správu verzii, podpisovanie záznamov o zmenách a značiek pomocou moderného a silného kriptografického algoritmu
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

Chcem podpisovať záznamy o zmenách (`commits`) a značky (`tags`) v systéme na správu verzii Git pomocou moderného a silného kryptografického algoritmu.

### Príkazy

- git config
- git commit
- git tag
- git verify-commit
- git verify-tag

## Riešenie

### Potrebný software

Na silné ([ECC](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)) kryptografické podpisovanie záznamov o zmenách budem potrebovať:

- [git](https://git-scm.com/) – slobodný a otvorený systém na správu verzii, minimálne vo verzii 2.0 alebo vyššej
- [GnuPG](https://gnupg.org/download/index.html) – kompletná a slobodná implementácia nástroja na šifrovanie a podpisovanie dát a komunikácie, minimálne vo verzii 2.1 alebo vyššej

---

### Generovanie páru kľúčov

Spustím generovanie nového páru kľúčov:

```sh
gpg --full-generate-key --expert
```

Vyberiem druh kľúča `(9) ECC (sign and encrypt) *default*`, eliptickú krivku `(1) Curve 25519 *default*`, dobu platnosti kľúča, určite nevyberám `0` - neobmedzená doba, zvolím rozumnú dobu platnosti, napr. `3y`, potvrdím správnosť. Ďalej zadám meno užívateľa, emailovú adresu a komentár, opätovne je potrebné potvrdiť správnosť, nakoniec zadám ešte heslo (`passphrase` – prístupovú frázu).

Heslo (prístupová fráza) **musí byť dostatočne silné** a **musím si ho zapamätať**, budem ho zadávať pri každom použití kľúča. Bez znalosti hesla je nemožné používať OpenPGP kľúče!

Môžem zobraziť informácie o vygenerovanom hlavnom kľúči pre danú emailovú adresu:

```sh
gpg --list-keys --keyid-format SHORT uzivatel@gmail.com
```

Dôležitá časť je v riadku za `pub`, po medzere nasleduje typ kľúča (`rsa4096`, `ed25519`), lomka a za ňou pokračuje jednoznačný identifikátor kľúča (`keyid`), ten je potrebný pre ďalšie nastavovanie.

Celý jednoznačný identifikátor kľúča (`fingerprint` / `keyID`) má 40 znakov (160 bitov), formát `LONG` je koncových 16 znakov (64 bitov) a formát `SHORT` je koncových 8 znakov (32 bitov).

Vytvorím pod kľúč, ale už len na podpisovanie:

```sh
gpg --expert --edit-key <keyid>
```

Zobrazí sa výzva `gpg>`, zadám `addkey`. Potom znova vyberiem druh kľúča - `(10) ECC (sign only)`, eliptickú krivku (`(1) Curve 25519 *default*`) a dobu platnosti (rovnakú, alebo kratšiu, ako má hlavný kľúč). Voľbu je potrebné dva razy opakovane potvrdiť, plus je potrebné zadať správne heslo k hlavnému kľúču. Po úspešnom vygenerovaní, proces ukončím zadaním `save`.

Verejnú časť páru podpisových kľúčov potrebujem exportovať do textového súboru (použijem `keyid` pod kľúča, nie hlavného kľúča!):

```sh
gpg --armor -o ./user-sign-commits.gpg --export <keyid>
```

Obsah tohto súboru prekopírujem do zodpovedajúceho nastavenia repozitára.

Na GitHub-e je to `Profile` -> `Settings` -> `SSH and GPG keys` -> [New GPG key](https://github.com/settings/gpg/new), do poľa `Key`. Vyplním ešte pole `Title` a stlačím tlačidlo `Add GPG key`.

Na GitLab-e je to `Profile` -> `Preferences` -> `GPG Keys` -> do poľa `Key`, potom stlačím `Add key`.

---

### Nastavenie gitu

Priradím GPG podpisový kľúč ku Git účtu. Použijem celý, dlhý alebo krátky jednoznačný identifikátor podpisového pod kľúča.  

```sh
git config --global user.signingkey <keyid>
```

V operačnom systéme MS Windows ešte nastavím program na podpisovanie.

```bash
git config --global gpg.program "C:\Program Files (x86)\GnuPG\bin\gpg.exe"
```

Ak chcem záznam o zmene podpísať GPG kľúčom pridám parameter `-S`.

```bash
git commit -S
```

Po dopísaní záznamu o zmene a uzavretí editora budem vyzvaný ku zadaniu hesla ku kľúču.

V prípade, že chcem záznamy o zmene a značky podpisovať automaticky všetky, zmením nastavenie buď pre všetky repozitáre (`--global`), alebo len v konkrétnom (`--local`) úložisku.

```bash
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

Naopak ak mám nastavené automatické podpisovanie záznamov o zmene a značiek, môžem pri jednotlivých zázanmoch túto vlastnosť vypnúť.

```bash
git commit --no-gpg-sign
git tag --no-sign v0.0.001-lw
```

---

### Spustenie agenta

V prípade ak sa pokúšam podpísať záznam o zmene a `gpg-agent` nie je spsustený dostanem hlásenie o chybe:

```bash
gpg: can`t connect to the gpg-agent: IPC connect call failed
gpg: keydb_search failed: No agent running
gpg: skipped "0123456789ABCDEF": No agent running
gpg: signing failed: No agent running
error: gpg failed to sign the data
fatal: failed to write commit object
```

Je potrebné agenta spustiť.

```bash
# v prostredí MS Windows
gpg-connect-agent -v
# následne zastaviť proces s Ctrl-Z

# alebo s parametrom /bye - spustí agenta a ukončí sa
gpg-connect-agent /bye

# alebo
gpg-connect-agent reloadagent /bye

# alebo ešte inak
gpgconf --launch gpg-agent
```

---

### Overenie podpisu

Pri výpise zoznamu záznamov o zmenách môžem zapnúť zobrazenie informácie o podpise.

```bash
git log --show-signature

# alebo len posledný záznam
git log --show-signature -1
```

Môžem overiť podpis na zázname o zmene alebo na značke.

```bash
git verify-commit cislo_zaznamu

# overiť podpísaný tag
git verify-tag cislo_tagu
```

---

### Export / import kľúčov na / zo servera

Kľúče chcem preniesť aj na iné počítače, respektíve chcem ich sprístupniť aj iným.

Verejnú časť páru kľúčov môžem odoslať na verejne dostupný server.

```bash
gpg --send-keys 0123456789ABCDEF

# alebo aj s presne zadaným serverom
gpg --keyserver https://keys.openpgp.org:443 --send-keys 0123456789ABCDEF
# alebo s iným serverom
gpg --keyserver keyserver.ubuntu.com --send-keys 0123456789ABCDEF
```

Na inom počítači môžem kľúč na serveri vyhľadať a stiahnuť.

```bash
# kľúč môžem najskôr vyhľadať
gpg --keyserver https://keys.openpgp.org:443 --search-keys uzivatel@email.sk
# aj na inom serveri
gpg --keyserver keyserver.ubuntu.com --search-keys uzivatel@email.sk
```

V prípade, že sa pre zadanú emailovú adresu nachádzajú kľúče na kľúčovom serveri, zobrazí sa ich zoznam. Zadám poradové číslo kľúča ktorý chcem importovať.

Ak poznám jednoznačný identifikátor kľúča a viem, že sa na danom serveri nachádza, môžem ho rovno stiahnuť.

```bash
gpg --keyserver https://keys.openpgp.org:443 --recv-keys 0123456789ABCDEF
# alebo opäť aj z iného serveru
gpg --keyserver keyserver.ubuntu.com --recv-keys 0123456789ABCDEF
```

Takto importovaný kľúč má neznámu mieru dôveryhodnosti (pokiaľ nie je podpísaný iným dôveryhodným kľúčom?). Ak je to mnou vydaný kľúč, alebo niekým komu dôverujem, môžem zvýšiť jeho dôveryhodnosť.

```bash
gpg --edit-key 0123456789ABCDEF
```

Po výzve `gpg>` zadám príkaz `trust` a z ponúkaneho rozsahu môžem vybrať najvyšiu mieru doveryhodnosti – 5 (`I trust ultimately`).

Pri inom ako mnou vydanom kľúči jeho dôveryhodnosť zvýšim tým, že ho podpíšm vlastným kľúčom.

```bash
gpg --lsign-key 0123456789ABCDEF
```

---

## Zdroj

- [7.4 Git Tools - Signing Your Work](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)
- [About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
- [Sign commits with GPG](https://docs.gitlab.com/ee/user/project/repository/gpg_signed_commits/)
- [Signing Git commits with GPG keys that use modern encryption](https://dev.to/benjaminblack/signing-git-commits-with-modern-encryption-1koh)
- [WINDOWS How to enable auto-signing Git commits with GnuPG...](https://gist.github.com/BoGnY/f9b1be6393234537c3e247f33e74094a)
- [GPG + Git SSH Authentication and Signing on Windows 10](https://gist.github.com/matusnovak/302c7b003043849337f94518a71df777#start-the-agent-on-startup)
- [Signing Git Commits with Your SSH Key](https://calebhearth.com/sign-git-with-ssh)
- [gpg: can't connect to the agent: IPC connect call failed](https://stackoverflow.com/a/58917527)
