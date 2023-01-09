---
title: "Prvotné nastavenie serveru"
date: 2020-11-21T13:43:07+01:00
draft: false
description: Bezpečnosť, nastavenie a správa serverov. Prehľadný zoznam krokov, ktoré je potrebné vykonať hneď po inštalácii / spustení serveru.
type: posts
tags:
  - Linux
  - Debian
  - Bezpečnosť
  - OpenSSH
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem zjednotiť a zefektívniť proces dôležitého prvotného nastavenia serveru a zároveň sa držať najlepších praktických rád a odporúčaní komunity ohľadom bezpečnosti a správy serverov. Získané poznatky a osobné skúsenosti chcem zosumarizovať.

## Riešenie

Nasledujúce kroky je vhodné vykonať ako prvé, ihneď po inštalácii. Postup je určený primárne pre operačný systém Debian, respektíve pre systémy na ňom postavené. Táto poznámka je začiatok viac dielnej série.

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
apt list --upgradable &&\
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

### Zvýšenie úrovne zabezpečenia OpenSSH

Dôležité zásady na úvod:

>1. Zmeny v konfiguračných súboroch vo všeobecnosti je vhodné vykonať až po dôkladnom premyslení a uvážení.
>2. Neuvážená zmena v nastavení OpenSSH ma môže odstrihnúť od vzdialeného serveru.
>3. Je vyslovene nevhodné bezhlavo kopírovať nejaké nastavenia či odporúčania z netu (je ich tam obrovské množstvo).
>4. Zmeny je vhodné implementovať postupne, v malých krokoch a ihneď overovať ich funkčnosť.

Prednastavenú úroveň zabezpečenia OpenSSH serveru chcem zvýšiť, aby som čo najviac eliminoval riziko napadnutia systému útočníkmi. Vykonám to úpravou konfiguračného súboru. Najskôr však pre istotu vytvorím záložnú kópiu pôvodného konfiguračného súboru.

```sh
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
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

#### Číslo portu

```sh
Port 22222
```

Zruším komentovanie (to znamená, že zmažem znak mriežky zo začiatku riadku) a zmením pred nastavenú hodnotu na nejaké inú. Je otázne či je toto práve zvýšením zabezpečenia, v tomto sa komunita vážne rozchádza. No každopádne to odfiltruje aspoň automatizované útoky cielené na všeobecne známy port 22.

---

#### Úroveň vytvárania záznamov

```sh
LogLevel VERBOSE
```

Zruším komentovanie a zmením predvolenú hodnotu `INFO` na `VERBOSE`. Mierne zvýši množstvo zaznamenávaných údajov do logov o prihlasovaných užívateľoch, napr. pridá informáciu o čísle riadku v `authorized_keys` so záznamom verejného kľúča úspešne prihláseného užívateľa.

---

#### Čas na úspešné prihlásenie

```sh
LoginGraceTime 30s
```

Zruším komentovanie a zmením pred nastavenú hodnotu `2m` na `30s`. Ak sa užívateľ úspešne neprihlási v zadanom čase, server ho odpojí.

---

#### Umožniť prihlásenie super užívateľa

```sh
PermitRootLogin no
```

Zruším komentovanie a zmením pred nastavenú hodnotu `prohibit-password` na `no`. Týmto znemožním super užívateľovi prihlasovať sa cez SSH na vzdialený server.

---

#### Maximálny počet pokusov o overenie identity

```sh
MaxAuthTries 3
```

Zruším komentovanie a zmením pred nastavenú hodnotu 6 na 3. Po prekročení nastaveného počtu pokusov o overenie identity server ukončí spojenie. Taktiež po prekročení polovičného počtu pokusov začne zlyhané pokusy zaznamenávať.

---

#### Maximálny počet SSH relácii v jednom TCP spojení

```sh
MaxSessions 2
```

Zruším komentovanie a zmením pred nastavenú hodnotu 10 na 2. OpenSSH môže použiť jedno TCP spojenie na uskutočnenie viacerých SSH relácii, takzvaný `SSH multiplexing`. Zmenou hodnoty na 1 multiplexing úplne zakážem.

---

#### Zoznam povolených užívateľov

```sh
AllowUsers username1 username2 username3
```

Takáto voľba sa nenachádza v pred nastavenom konfiguračnom súbore. Doplním ju na nový riadok. Vložím ju do sekcie `# Authentication:` za riadok `MaxSessions 2`. Týmto nastavením umožním prihlásiť sa do systému cez SSH len vymenovaným užívateľom a nikomu inému.

---

#### Umožniť overovanie identity párom SSH kľúčov

```sh
PubkeyAuthentication yes
```

Zruším komentovanie a ponechám pred nastavenú hodnotu `yes`, toto je preferovaný a bezpečný spôsob overovania identity pri prihlasovaní na vzdialený server.

---

#### Súbory obsahujúce verejné kľúče

```sh
AuthorizedKeysFile     .ssh/authorized_keys
```

Zruším komentovanie a upravím predvolenú hodnotu tak, že zmažem druhú položku `.ssh/authorized_keys2` a teda ponechám prvú `.ssh/authorized_keys`. Týmto definujem súbor, kde sú uložené verejné časti páru SSH kľúčov užívateľov oprávnených sa prihlásiť na server.

---

#### Umožniť overovanie identity heslom

```sh
PasswordAuthentication no
```

Keď chcem aplikovať túto zmenu, musím si byť absolútne istý, že som schopný sa prihlásiť do systému pomocou páru SSH kľúčov. Schopnosť prihlásiť sa bez hesla **MUSÍM** viac krát prakticky overiť.

Zruším komentovanie a zmením pred nastavenú hodnotu `yes` na `no`. Týmto znemožním užívateľovi pri prihlasovaní použiť na overenie identity heslo. Toto nastavenie je veľmi dôležité!

---

#### Umožniť zadávanie prázdneho hesla

```sh
PermitEmptyPasswords no
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. Síce som prihlasovanie sa pomocou hesla v predchádzajúcom nastavení zakázal, ale pre istotu zakážem aj prázdne heslá :)

---

#### Umožniť overovanie identity systémom výzvy a odpovede

```sh
ChallengeResponseAuthentication no
```

V operačnom systéme Debian vari od verzie 5 alebo ešte skôr je táto voľba v pred nastavenom stave `no`, ponechám ju tak. No v iných operačných systémoch môže byť predvolená hodnota iná. Napríklad v OpenBSD je predvolenou hodnotou `yes`. Keďže nie je nakonfigurovaný žiadny nástroj, ktorý by sa staral o takýto spôsob overovania identity je bezpečnejšie voľbu nepovoliť.

---

#### Umožniť overovanie identity systémom Kerberos

```sh
KerberosAuthentication no
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. Systém na overovanie identity ktorý neplánujem používať je vhodné vypnúť.

---

#### Umožniť overovanie identity systémom GSSAPI

```sh
GSSAPIAuthentication no
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. Systém na overovanie identity ktorý neplánujem používať je vhodné vypnúť.

---

#### Umožniť overovanie identity pomocou PAM

```sh
UsePAM yes
```

V Debiane ponechám voľbu ako je `yes`. Systém môže použiť rôzne iné doplnkové moduly na overovanie identity.

---

#### Povolenie presmerovania `ssh-agent`

```sh
AllowAgentForwarding no
```

Zruším komentovanie a zmením predvolenú hodnotu na `no`. Zabránim tým možnosti presmerovať požiadavku vzdialeného serveru na lokálneho ssh-agenta (sú v ňom uložené SSH kľúče) akoby bol na vzdialenom serveri. Platí jednoduchá zásada, **nikdy** nespúšťať `ssh-agent` s vlastnými kľúčmi na stroji, kde má administrátorsky prístup neznáma alebo nedôveryhodná osoba. Čiže `ssh-agent` s mojimi vlastnými kľúčmi spúšťam zásadne len na mojich vlastných počítačoch, kde som `root` len ja sám.

---

#### Povolenie presmerovanie TCP spojenia

```sh
AllowTcpForwarding no
```

Zruším komentovanie a zmením predvolenú hodnotu na `no`, ak vyslovene nepotrebujem presmerovanie TCP spojenia. Povolenie tejto možnosti je potenciálne bezpečnostné riziko, lebo umožňuje obísť napríklad firewall.

---

#### Povolenie presmerovania z `X Window System`

```sh
X11Forwarding no
```

V Debiane zmením pred nastavenú hodnotu `yes` na `no`. Keďže neplánujem používať žiadne grafické rozhranie môžem toto nastavenie zakázať. V OpenBSD je predvolenou hodnotou správne `no`.

---

#### Povolenie zobraziť tzv. správu dňa

```sh
PrintMotd no
```

V Debiane ponechám odkomentované s hodnotou `no`. V OpenBSD je predvolená hodnota `yes`. Voľba zakáže zobrazovať takzvanú správu dňa po úspešnom prihlásení. V Debiane a spol. je toto riešené inak (`/etc/update-motd.d`).

---

#### Povolenie odosielania správy na udržanie TCP spojenia

```sh
TCPKeepAlive no
```

Zruším komentovanie a zmenim predvolenú hodnotu na `no`. Zamedzím tým odosielaniu `TCP keepalive messages`, možnosť ako udržiavať, resp. overovať funkčnosť TCP spojenia. Komunikácia, ale prebieha cez nezabezpečené spojenie. Podobnú možnosť zabezpečujú bezpečnejšie voľby nižšie -- `ClientAliveInterval` a `ClientAliveCountMax`, komunikácia prebieha v rámci zabezpečeného spojenia.

---

#### Povolenie použiť kompresiu

```sh
Compression no
```

Zruším komentovanie a zmenim predvolenú hodnotu na `no`. Keďže internetové linky sú dostatočne rýchle a akákoľvek zraniteľnosť v kompresnom algoritme môže kompromitovať celé spojenie, je bezpečnejšie túto voľbu zakázať.

---

#### Časový interval pre overovanie či je spojenie funkčné

```sh
ClientAliveInterval 300
```

Zruším komentovanie a zmením pred nastavenú hodnotu 0 na 300. To znamená, že ak server neprijme 300 sekúnd žiadne dáta od klienta, odošle mu kontrolnú správu na ktorú očakáva odpoveď. S týmto priamo súvisí aj nasledujúce nastavenie.

---

#### Maximálny počet pokusov o kontrolu funkčnosti spojenia

```sh
ClientAliveCountMax 2
```

Zruším komentovanie a ponechám pred nastavenú hodnotu. To znamená, že server sa pokúsi tri krát po uplynutí istého časového limitu (viď vyššie) odoslať kontrolnú správu klientovi, na ktorú keď nedostane odpoveď, tak po poslednom pokuse  preruší spojenie.

S týmto nastavením je spojená jedna zvláštnosť, ktorej úplne nerozumiem. Ak nastavím `ClientAliveCountMax` na hodnotu menšiu ako 2 (teda na hodnoty 1 alebo 0), tak po uplynutí času nastavenom v `ClientAliveInterval` dôjde automaticky k prerušeniu spojenia zo strany servera -- toto, ale nie je zmysel týchto nastavení ?!. Respektíve ak nastavím hodnotu 2 alebo vyššiu, tak sa to nedeje -- toto je správne chovanie. Na odpájanie spojenia z dôvodu nečinnosti užívateľa môžem použiť iné nastavenie, premennú `TMOUT` v `~/.bash_profile`.

---

#### Oznam pred prihlásením

```sh
Banner /etc/issue.net
```

Zruším komentovanie a zmenim predvolenú hodnotu `none` na `/etc/issue.net`. Upravím obsah súboru `/etc/issue.net` tak, aby obsahoval oznam o tom, že pokračovaním v pripájaní sa, užívateľ vstupuje na zabezpečený server atď. Obsah súboru sa zobrazí ako prvá vec pri začatí nadväzovania spojenia.

---

#### Povolené premenné klienta

```sh
#AcceptEnv LANG LC_*
```

V Debiane pridám znak mriežky na začiatok riadku, ak vyslovene nepotrebujem predávať nejaké premenné prostredia z klienta prebiehajúcej relácii. OpenBSD má predvolenú voľbu neakceptovať žiadne premenné.

---

#### Konfigurovanie externého subsystému

```sh
#Subsystem      sftp    /usr/lib/openssh/sftp-server
```

V Debiane pridám znak mriežky na začiatok riadku ak vyslovene nepotrebujem `sftp-server`, teda zakážem ho. OpenBSD nemá prednastavený žiadny subsystém.

---

Všetky nastavenia zhrnuté na jednom mieste, použil som východiskový konfiguračný súbor `/usr/share/openssh/sshd_config`, z Debian ~~Buster (OpenSSH_7.9p1)~~ Bullseye (OpenSSH_8.4p1) do ktorého som zapracoval všetky vyššie uvedené zmeny:

```sh
#       $OpenBSD: sshd_config,v 1.103 2018/04/09 20:41:22 tj Exp $

# This is the sshd server system-wide configuration file.  See
# sshd_config(5) for more information.

# This sshd was compiled with PATH=/usr/bin:/bin:/usr/sbin:/sbin

# The strategy used for options in the default sshd_config shipped with
# OpenSSH is to specify options with their default value where
# possible, but leave them commented.  Uncommented options override the
# default value.

Include /etc/ssh/sshd_config.d/*.conf

Port 22222
#AddressFamily any
#ListenAddress 0.0.0.0
#ListenAddress ::

HostKey /etc/ssh/ssh_host_rsa_key
#HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# Ciphers and keying
#RekeyLimit default none

# Logging
#SyslogFacility AUTH
LogLevel VERBOSE

# Authentication:

LoginGraceTime 30s
PermitRootLogin no
#StrictModes yes
MaxAuthTries 3
MaxSessions 2
AllowUsers username1 username2 username3

PubkeyAuthentication yes

# Expect .ssh/authorized_keys2 to be disregarded by default in future.
AuthorizedKeysFile     .ssh/authorized_keys

#AuthorizedPrincipalsFile none

#AuthorizedKeysCommand none
#AuthorizedKeysCommandUser nobody

# For this to work you will also need host keys in /etc/ssh/ssh_known_hosts
#HostbasedAuthentication no
# Change to yes if you don't trust ~/.ssh/known_hosts for
# HostbasedAuthentication
#IgnoreUserKnownHosts no
# Don't read the user's ~/.rhosts and ~/.shosts files
#IgnoreRhosts yes

# To disable tunneled clear text passwords, change to no here!
PasswordAuthentication no
PermitEmptyPasswords no

# Change to yes to enable challenge-response passwords (beware issues with
# some PAM modules and threads)
ChallengeResponseAuthentication no

# Kerberos options
KerberosAuthentication no
#KerberosOrLocalPasswd yes
#KerberosTicketCleanup yes
#KerberosGetAFSToken no

# GSSAPI options
GSSAPIAuthentication no
#GSSAPICleanupCredentials yes
#GSSAPIStrictAcceptorCheck yes
#GSSAPIKeyExchange no

# Set this to 'yes' to enable PAM authentication, account processing,
# and session processing. If this is enabled, PAM authentication will
# be allowed through the ChallengeResponseAuthentication and
# PasswordAuthentication.  Depending on your PAM configuration,
# PAM authentication via ChallengeResponseAuthentication may bypass
# the setting of "PermitRootLogin without-password".
# If you just want the PAM account and session checks to run without
# PAM authentication, then enable this but set PasswordAuthentication
# and ChallengeResponseAuthentication to 'no'.
UsePAM yes

AllowAgentForwarding no
AllowTcpForwarding no
#GatewayPorts no
X11Forwarding no
#X11DisplayOffset 10
#X11UseLocalhost yes
#PermitTTY yes
PrintMotd no
#PrintLastLog yes
TCPKeepAlive no
#PermitUserEnvironment no
Compression no
ClientAliveInterval 300
ClientAliveCountMax 2
#UseDNS no
#PidFile /var/run/sshd.pid
#MaxStartups 10:30:100
#PermitTunnel no
#ChrootDirectory none
#VersionAddendum none

# no default banner path
#Banner none

# Allow client to pass locale environment variables
#AcceptEnv LANG LC_*

# override default of no subsystems
#Subsystem       sftp    /usr/lib/openssh/sftp-server

# Example of overriding settings on a per-user basis
#Match User anoncvs
#       X11Forwarding no
#       AllowTcpForwarding no
#       PermitTTY no
#       ForceCommand cvs server
```

---

### Ďalšie možnosti zvýšenia úrovne zabezpečenia

- odinštalovať nepotrebný a nepoužívaný softvér
- vypnúť všetky nepotrebné a nepoužívané služby
- zakázať slabé algoritmy v OpenSSH
- vypnúť / zakázať nepotrebné moduly jadra
- upraviť / sprísniť nastavenia jadra
- `Firewall` -- paketový filter v jadre, základný obranný val systému,  v Debiane 10 je to `nftables`, je to samostatná problematika nad rámec tejto poznámky, dobrý seriál o ňom je na [root.cz](https://www.root.cz/serialy/firewall-s-nftables/)
- `TCP Wrapper` -- filtrovanie prístupu k jednotlivým službám podľa IP klienta na užívateľskej úrovni, nie je štandardnou súčasťou všetkých distribúcii (v Ubuntu a Debiane je)
- `Port Knocking` -- otvorenie zavretého portu (úpravou konfigurácie firewallu) pre konkrétnu IP adresu zaslaním série paketov na konkrétne, vopred dohodnuté čísla portov, v určitom, vopred dohodnutom poradí
- `Single Packet Authorization` -- vylepšená technika port knockingu, bezpečnejšia, v jednom pakete, šifrované spojenie
- dvoj--faktorové overenie identity -- pridanie ďalšieho, druhého spôsobu overenia identity pri prihlasovaní
- `Fail2Ban` -- skenovanie záznamov a následné blokovanie IP adries z ktorých prichádza podozrivo veľa neúspešných pokusov o prihlásenie

---

## Zdroj

- [OpenBSD manuálové stránky](https://man.openbsd.org/sshd_config)
- [Debian manuálové stránky](https://manpages.debian.org/buster/openssh-server/sshd_config.5.en.html)
- [linuxexpres.cz](https://www.linuxexpres.cz/praxe/sprava-linuxoveho-serveru-prakticke-rady-pro-zabezpeceni-ssh)
- [linux-audit.com](https://linux-audit.com/audit-and-harden-your-ssh-configuration/)
