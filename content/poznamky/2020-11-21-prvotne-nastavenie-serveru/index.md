---
title: "Prvotné nastavenie serveru"
date: 2020-11-21T13:43:07+01:00
draft: false
description: Nastavenie a správa serverov. Prehľadný zoznam krokov, ktoré je potrebné vykonať hneď po inštalácii / spustení serveru.
type: posts
tags:
  - Linux
  - Debian
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem zjednotiť a zefektívniť proces dôležitého prvotného nastavenia servera a zároveň sa držať najlepších praktických rád a odporúčaní komunity ohľadom bezpečnosti a správy serverov. Získané poznatky a osobné skúsenosti chcem zosumarizovať.

## Riešenie



### Pridanie nového užívateľa

Potrebujem pridať nového užívateľa. Buď som zabudol alebo nechcel pridať bežného užívateľa počas inštalácie, alebo mi z akéhokoľvek dôvodu nevyhovuje štandardne vytvorený. Napríklad nechcem používať užívateľa `pi` v Raspberry Pi OS alebo užívateľa `debian` v Debian VPS.

Toto vykonám ako super užívateľ -- root, alebo ako bežný užívateľ pomocou `sudo`.

```sh
adduser username
```

Systém bude požadovať zadanie nového hesla (dva krát po sebe), heslo musí byť dostatočne komplikované a musím si ho zapamätať! Ďalšie požadované údaje môžem ponechať nevyplnené alebo prednastavené.

### Pridanie užívateľa do `sudo` skupiny

Keďže nie je vhodné používať super užívateľa `root`, ale potrebujem vykonávať činnosti ktoré požadujú oprávnenia super užívateľa, pridám novovytvoreného užívateľa do skupiny `sudo`.

Aj toto ešte vykonám ako `root`.

```sh
usermod -aG sudo username
```

### Aktualizácia systému

Systém je potrebné udržiavať aktuálny. Furt. Bezpečnosť je prvoradá. Tak isto je vhodné pred inštaláciou akéhokoľvek ďalšieho softvéru systém aktualizovať.

Keďže som svojho bežného novovytvoreného užívateľa pridal do skupiny `sudo` môžem už ďalšie administratívne úkony zadávať pomocou príkazu `sudo`.

```sh
sudo apt update &&\
sudo apt list --upgradable &&\
sudo apt upgrade &&\
sudo apt full-upgrade
```

### Pridanie verejného SSH kľúča

Pripájať sa ku vzdialenému serveru inak ako pomocou SSH kľúčov je zbytočný hazard. Verejnú časť páru SSH kľúčov je potrebné pridať na cieľový server.

Na prekopírovanie kľúča je ideálne použiť na to určený program `ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 22222 username@server.com` z lokálneho počítaču. Jeho výhoda spočíva okrem iného v tom, že na cieľovom vzdialenom serveri vytvorí požadované adresáre a súbory aj so správne nastavenými oprávneniami.

Alebo potrebné súbory a adresáre vytvorím priamo na serveri sám.

```sh
mkdir -p ~/.ssh
touch ~/.ssh/authorized_keys
chmod -R go= ~/.ssh
```

A potom prekopírujem obsah vybraného verejného kľúča napríklad zo súboru `~/.ssh/id_ed25519.pub` z lokálneho počítaču do súboru `~/.ssh/authorized_keys` na vzdialenom počítači. Každý kľúč musí byť na novom riadku.

### Zvýšenie úrovne zabezpečenia SSH

Dôležité zásady na úvod:

>1. Zmeny v konfiguračných súboroch vo všeobecnosti je vhodné vykonať až po dôkladnom premyslení a uvážení.
>2. Neuvážená zmena v nastavení OpenSSH ma môže odstrihnúť od vzdialeného serveru.
>3. Je vyslovene nevhodné bezhlavo kopírovať nejaké nastavenia či odporúčania z netu (je ich tam obrovské množstvo).
>4. Zmeny je vhodné implementovať postupne, v malých krokoch a ihneď overovať ich funkčnosť.

Prednastavenú úroveň zabezpečenia OpenSSH serveru chcem zvýšiť aby som čo najviac eliminoval riziko napadnutia systému útočníkmi. Vykonám to najskôr úpravou konfiguračného súboru.

```sh
sudo nano /etc/ssh/sshd_config
```

Po každej zmene v konfiguračnom súbore si môžem overiť syntaktickú správnosť vykonanej zmeny (chybné kľúčové slovo, preklep, chýbajúca medzera atď.).

```sh
sudo sshd -t
```

V prípade, že je tam nájdený problém, v odpovedi bude uvedené číslo riadku, chybné nastavenie aj celkový počet chýb. Príklad chybového hlásenia:

```
/etc/ssh/sshd_config: line 119: Bad configuration option: AllowUser
/etc/ssh/sshd_config: terminating, 1 bad configuration options
```

Bolo nájdené jedno chybné nastavenie `AllowUser`, správne má byť `AllowUsers`, chýba teda jediné písmenko.

V prípade, že sú všetky nastavenia správne nedostanem žiadnu odpoveď.

Po overení formálnej správnosti môžem danú zmenu konfigurácie OpenSSH servera nasadiť do prevádzky. Vykonám to zadaním príkazu pre znovu načítanie konfiguračného súboru `systemd` služby.

```sh
sudo systemctl reload ssh
```

K tomuto ešte jedna poznámka. Zmeny v konfigurácii sa zvyčajne prejavia až pri ďalšom prihlásení. Takže na otestovanie zmien je výhodné ponechať aj pôvodné pripojenie v ktorom vykonávam zmeny v konfiguračných súboroch aj otvoriť úplne nové -- v ňom sa prejavia požadované zmeny, no zároveň si overím či som vôbec schopný sa pripojiť ku serveru. Ak sa nebudem schopný pripojiť ku serveru z dôvodu nesprávnych zmien v konfigurácii, môžem stále v pôvodnom pripojení vrátiť zmeny v konfiguračných súboroch do predošlého stavu. Za každých okolností si ponechať aspoň jedno pripojenie ku vzdialenému serveru otvorené, aktívne.

---

#### Prehľad zmien v `sshd_config`:

- ***Číslo portu***

```sh
Port 22222
```

Zruším komentovanie (to znamená, že zmažem znak mriežky zo začiatku riadku) a zmením pred nastavenú hodnotu na nejaké inú. Je otázne či je toto práve zvýšením zabezpečenia, v tomto sa komunita vážne rozchádza. No každopádne to odfiltruje aspoň automatizované útoky cielené na všeobecne známy port 22.

- ***Čas na úspešné prihlásenie***

```sh
LoginGraceTime 2m
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. Ak sa užívateľ úspešne neprihlási v zadanom čase, server ho odpojí.

- ***Umožniť prihlásenie super užívateľa***

```sh
PermitRootLogin no
```

Zruším komentovanie a zmením pred nastavenú hodnotu `prohibit-password` na `no`. Týmto znemožním super užívateľovi prihlasovať sa cez SSH na vzdialený server.

- ***Maximálny počet pokusov o overenie identity***

```sh
MaxAuthTries 3
```

Zruším komentovanie a zmením pred nastavenú hodnotu 6 na 3. Po prekročení nastaveného počtu pokusov o overenie identity server ukončí spojenie. Taktiež po prekročení polovičného počtu pokusov začne zlyhané pokusy zaznamenávať.

- ***Zoznam povolených užívateľov***

```sh
AllowUsers username1 username2 username3
```

Takáto voľba sa nenachádza v pred nastavenom konfiguračnom súbore. Doplním ju na nový riadok. Vložím ju do sekcie `# Authentication:` za riadok 36 `#MaxSessions 10`. Týmto nastavením umožním prihlásiť sa do systému cez SSH len vymenovaným užívateľom a nikomu inému.

- ***Umožniť overovanie identity heslom***

```sh
PasswordAuthentication no
```

Keď chcem aplikovať túto zmenu, musím si byť absolútne istý, že som schopný sa prihlásiť do systému pomocou páru SSH kľúčov. Schopnosť prihlásiť sa bez hesla **MUSÍM** viac krát prakticky overiť.

Zruším komentovanie a zmením pred nastavenú hodnotu `yes` na `no`. Týmto znemožním užívateľovi pri prihlasovaní použiť na overenie identity heslo. Toto nastavenie je veľmi dôležité!

- ***Umožniť zadávanie prázdneho hesla***

```sh
PermitEmptyPasswords no
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. Síce som prihlasovanie sa pomocou hesla v predchádzajúcom nastavení zakázal, ale pre istotu zakážem aj prázdne heslá :)

- ***Umožniť overovanie identity systémom Kerberos***

```sh
KerberosAuthentication no
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. Systém na overovanie identity ktorý neplánujem používať je vhodné vypnúť.

- ***Umožniť overovanie identity systémom GSSAPI***

```sh
GSSAPIAuthentication no
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. Systém na overovanie identity ktorý neplánujem používať je vhodné vypnúť.

- ***Povolenie presmerovania z `X Window System`***

```sh
X11Forwarding no
```

Zmením pred nastavenú hodnotu `yes` na `no`. Keďže neplánujem používať žiadne grafické rozhranie môžem toto nastavenie zakázať.

- ***Časový interval pre overovanie či je spojenie funkčné***

```sh
ClientAliveInterval 300
```

Zruším komentovanie a zmením pred nastavenú hodnotu 0 na 300. To znamená, že ak server neprijme 300 sekúnd žiadne dáta od klienta, odošle mu kontrolnú správu na ktorú očakáva odpoveď. S týmto priamo súvisí aj nasledujúce nastavenie.

- ***Maximálny počet pokusov o kontrolu funkčnosti spojenia***

```sh
ClientAliveCountMax 3
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. To znamená, že server sa pokúsi tri krát po uplynutí istého časového limitu (viď vyššie) odoslať kontrolnú správu klientovi, na ktorú keď nedostane odpoveď, tak po poslednom pokuse  preruší spojenie.

S týmto nastavením je spojená jedna zvláštnosť, ktorej úplne nerozumiem. Ak nastavím `ClientAliveCountMax` na hodnotu menšiu ako 2 (teda na hodnoty 1 alebo 0), tak po uplynutí času nastavenom v `ClientAliveInterval` dôjde automaticky k prerušeniu spojenia zo strany servera -- toto, ale nie je zmysel týchto nastavení ?!. Respektíve ak nastavím hodnotu 2 alebo vyššiu, tak sa to nedeje -- toto je správne chovanie. Na odpájanie spojenia z dôvodu nečinnosti užívateľa môžem použiť iné nastavenie, premennú `TMOUT` v `~/.bash_profile`.

#### Ďalšie možnosti zvýšenia úrovne zabezpečenia

- vypnúť všetky nepotrebné a nepoužívané služby
- `Firewall` -- paketový filter v jadre, základný obranný val systému,  v Debiane 10 je to `nftables`, je to samostatná problematika nad rámec tejto poznámky, dobrý seriál o ňom je na [root.cz](https://www.root.cz/serialy/firewall-s-nftables/)
- `TCP Wrapper` -- filtrovanie prístupu k jednotlivým službám podľa IP klienta na užívateľskej úrovni, nie je štandardnou súčasťou všetkých distribúcii (v Ubuntu a Debiane je)
- `Port Knocking` -- otvorenie zavretého portu (úpravou konfigurácie firewallu) pre konkrétnu IP adresu zaslaním série paketov na konkrétne, vopred dohodnuté čísla portov, v určitom, vopred dohodnutom poradí
- `Single Packet Authorization` -- vylepšená technika port knockingu, bezpečnejšia, v jednom pakete, šifrované spojenie
- dvoj--faktorové overenie identity -- pridanie ďalšieho, druhého spôsobu overenia identity pri prihlasovaní
- `Fail2Ban` -- skenovanie záznamov a následné blokovanie IP adries z ktorých prichádza podozrivo veľa neúspešných pokusov o prihlásenie


### Doinštalovanie softvéru



---

## Zdroj

- [manuálové stránky](https://linux.die.net/man/5/sshd_config)
- [linuxexpres.cz](https://www.linuxexpres.cz/praxe/sprava-linuxoveho-serveru-prakticke-rady-pro-zabezpeceni-ssh)
- [linux-audit.com](https://linux-audit.com/audit-and-harden-your-ssh-configuration/)
