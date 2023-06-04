---
title: OpenSSH – inštalácia a základné nastavenie
date: 2022-12-30T10:37:16+01:00
draft: false
description: Ako nainštalovať a nastaviť OpenSSH server a klient.
type: posts
tags:
  - OpenSSH
  - Debian
  - Linux
  - Bezpečnosť
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem nainštalovať a správne nastaviť OpenSSH server aj klient v prostredí operačného systému Debian / Ubuntu. Získané poznatky a skúsenosti chcem zosumarizovať na jednom mieste.

Okrem iného chcem OpenSSH server aj klient nastaviť tak, aby využíval výhradne silné a bezpečné šifrovacie algoritmy.

Z dôvodu spätnej kompatibility má server aj klient k dispozícii mnoho rôznych algoritmov. No z hľadiska bezpečnosti je nevyhnutné zakázať také algoritmy pri ktorých bola odhalená zraniteľnosť alebo sú z akéhokoľvek dôvodu považované za slabé či technicky zastaralé.

## Upozornenie

Nesprávnym nastavením alebo povolením či zakázaním nejakej vlastnosti či niektorého algoritmu môžem spôsobiť, že klient sa nebude schopný pripojiť ku vzdialenému serveru.

Zmeny realizujem po menších častiach, nie všetky na raz.

Nasadenie zmien vykonám znovu načítaním konfigurácie `systemctl reload ssh`. Určite nevykonať reštart OpenSSH serveru.

Vždy si ponechám aspoň jedno spojenie otvorené, aby som v prípade potreby mohol zmeny v konfigurácii, ktoré mi znemožňujú pripojenie ku serveru vrátiť do pôvodného stavu.

## Riešenie

### OpenSSH server

#### Inštalácia

Pri serverových vydaniach operačného systému je zvyčajne OpenSSH server už nainštalovaný. Ak však z akéhokoľvek dôvodu nie je, môžem ho jednoducho nainštalovať.

```bash
sudo apt update
sudo apt install openssh-server
```

OpenSSH server by mal byť po skončení inštalácie už aj spustený. Overím si to.

```bash
systemctl status ssh
```

Ak prebehla inštalácia úspešne a server je spustený, dostanem odpoveď:

```
● ssh.service - OpenBSD Secure Shell server
   Loaded: loaded (/lib/systemd/system/ssh.service; enabled; vendor preset: enabled)
   Active: active (running) since Tue 2022-12-06 00:01:03 CET; 3 weeks 3 days ago
   ...
```

#### Konfigurácia

Na domácich počítačoch, respektíve na počítačoch, ktoré nie sú vystavené otvorenými portami na internet môžem ponechať konfiguráciu OpenSSH servera bez zmeny, postačia aj pred nastavené hodnoty. No na produkčných serveroch a všetkých strojoch čo sú pripojené s načúvajúcim portom na internet je nutné pred nastavenú konfiguráciu doladiť.

Súčasťou procesu inštalácie OpenSSH servera je aj generovanie kľúčov, ktorými sa bude server prezentovať navonok pri snahe o pripojenie klientov. Tieto kľúče, minimálne však RSA kľúč je vhodné generovať nanovo. RSA kľúč by mal mať dĺžku aspoň 4096 bitov.

Pozor nasledujúce príkazy prepíšu pôvodné RSA aj ED25519 kľúče generované počas inštalácie! Toto je vhodné vykonať **ihneď po inštalácii**, ešte skôr než sa pripoja prvý klienti, lebo po zmene týchto kľúčov bude potrebné meniť záznamy aj v klientskych súboroch `~/.ssh/known_hosts`.

```bash
sudo ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -t rsa -b 4096
sudo ssh-keygen -f /etc/ssh/ssh_host_ed25519_key -N '' -t ed25519
```

Konfiguračný súbor pre OpenSSH server je uložený v adresári `/etc/ssh` a na jeho úpravu je potrebné administrátorské oprávnenie.

```bash
sudo nano /etc/ssh/sshd_config
```

Najskôr upravím použitie OpenSSH kľúčov, ktorými sa server predstavuje. Kľúč typu ECDSA je vhodné nepoužívať vôbec. V konfiguračnom súbore ponechám znak mriežka pred týmto typom. Spred kľúčov typu RSA a ED25519 znak mriežka odstránim.

```
HostKey /etc/ssh/ssh_host_rsa_key
#HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key
```

V konfiguračnom súbore môžem povoliť alebo zakázať používanie šifrovacích algoritmov použitých na vytvorenie zabezpečeného spojenia. Na základe odporúčaní (napr. [ssh-audit](https://github.com/jtesta/ssh-audit)) zakážem niektoré algoritmy. V úvodnej časti konfiguračného súboru v časti `Ciphers and keyring` doplním, respektíve upravím ak už je pasáž s algoritmami podľa verzie servera.

- OpenSSH 7.9
```
# Ciphers and keying
RekeyLimit 1G 1H
KexAlgorithms -"ecdh*,*sha1"
HostKeyAlgorithms -"ecdsa*,ssh-rsa*"
MACs umac-128-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
```

- OpenSSH 8.4
```
# Ciphers and keying
RekeyLimit 1G 1H
KexAlgorithms -"ecdh*"
HostKeyAlgorithms -"*ecdsa*,ssh-rsa*"
MACs umac-128-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
```

- OpenSSH 8.9 / 9.1
```
# Ciphers and keying
RekeyLimit 1G 1H
KexAlgorithms -"ecdh*"
HostKeyAlgorithms -"*ecdsa*"
MACs umac-128-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
```

Po každej zmene a aj po skončení úprav vykonám kontrolu správnosti.

```sh
sudo sshd -t
```

V prípade, že v konfigurácii nie sú chyby, nedostanem žiadnu odpoveď. Ak som spokojný s vykonanými zmenami, môžem ich nasadiť do prevádzky znovu načítaním konfiguračného súboru.

```sh
sudo systemctl reload ssh
```

Podrobnejšie o ďalších úpravách konfiguračného súboru viď poznámku Prvotné nastavenie serveru a jej časť:

- [Zvýšenie úrovne zabezpečenia OpenSSH](/poznamky/2020/11/prvotne-nastavenie-serveru/#zvýšenie-úrovne-zabezpečenia-openssh)

Ešte je vhodné znemožniť používanie malých prvočísel pri vytváraní spojenia. Zo súboru `/etc/ssh/moduli` odstránim riadky, ktoré boli generované s veľkosťou menšou, ako 3072 bitov (riadky, ktoré majú v stĺpci 5 číslo nižšie, ako 3071).

```bash
sudo cp /etc/ssh/moduli /etc/ssh/moduli_old
awk '$5 >= 3071' /etc/ssh/moduli > $HOME/moduli.safe
sudo mv -f $HOME/moduli.safe /etc/ssh/moduli
```

Respektíve najvhodnejšie by bolo všetky `modulus` pre všetky dĺžky kľúčov generovať nanovo.

```bash
ssh-keygen -M generate -O bits=4096 moduli-4096.candidates
ssh-keygen -M screen -f moduli-4096.candidates moduli-4096
```

Je to však časovo náročné. Na prenajatom VPS s jedným jadrom (AMD EPYC 7281) a 1 GB RAM trvalo generovanie (prvý riadok vyššie) 5 minút a následná kontrola (druhý riadok) 1,5 hodiny. A to je len pre veľkosť 4096 bitov, toto je potrebné zopakovať ešte niekoľkokrát (pre 6144, 7680 a 8192 bitov).

#### Kontrola logov

Neodmysliteľnou súčasťou správy OpenSSH servera je aj kontrola logov. Je vhodné ju vykonávať priebežne.

```bash
# Zobraziť všetky dostupné logy o OpenSSH
sudo journalctl --unit ssh
# alebo len od posledného spustenia systému
sudo journalctl -u ssh -b
# alebo len za poslednú hodinu
sudo journalctl -u ssh --since "1 hour ago"
```

Je dôležité kontrolovať kto sa pripája ku serveru.

```bash
sudo journalctl -u ssh | grep -i 'accepted key' | uniq
# alebo len za posledný týždeň
sudo journalctl -u ssh --since "7 days ago" | grep -i 'accepted key' | uniq
```

Z výpisu je zrejme kedy a pomocou ktorého kľúča sa niekto pripájal cez OpenSSH:

```
Dec 26 17:55:04 debian sshd[19055]: Accepted key ED25519 SHA256:... found at /home/user/.ssh/authorized_keys:1
```

Vidím, ktorý to bol kľúč, teda jeho odtlačok prsta a vidím tiež, ktorý riadok záznamu v `authorized_keys` obsahuje verejnú časť kľúča. (Ak je zvýšená úroveň zaznamenávania v `sshd_config` na `LogLevel VERBOSE`.)

---

### OpenSSH klient

#### Inštalácia

OpenSSH klient je bežnou súčasťou rôznych operačných systémov. V prípade, že nie je môžem ho nainštalovať.

```bash
sudo apt update
sudo apt install openssh-client
```

#### Konfigurácia

Konfiguračný súbor pre OpenSSH klienta je uložený v `/etc/ssh/ssh_config`. Ten má pôsobnosť pre celý systém a môže ho upravovať len administrátor. Je možné vytvoriť aj užívateľský konfiguračný súbor. Najskôr musím vytvoriť potrebný adresár v domovskom adresári užívateľa a nastaviť správne prístupové práva pre adresár aj súbor.

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/config
chmod 600 ~/.ssh/config
nano ~/.ssh/config
```

V konfiguračnom súbore môžem nastaviť parametre pre jednotlivé spojenia, aby som nemusel opakovane zadávať všetky parametre.

```
Host server1
	HostName adresa.servera.sk
	Port 2222
	User prohlasovacie_meno
	PubkeyAuthentication yes
	IdentityFile ~/.ssh/id_ed25519
```

Spojenie potom nadviažem jednoduchým `ssh server1`.

V konfiguračnom súbore môžem povoliť alebo zakázať používanie šifrovacích algoritmov použitých na vytvorenie zabezpečeného spojenia. Na základe odporúčaní (napr. [ssh-audit](https://github.com/jtesta/ssh-audit)) zakážem niektoré algoritmy. Toto nastavenie je vhodná vložiť až na koniec konfiguračného súboru, za všetky nastavenia jednotlivých spojení.

- OpenSSH 7.9 / 8.1
```
Host *
	KexAlgorithms -"ecdh*,*sha1"
	HostKeyAlgorithms -"ecdsa*,ssh-rsa*"
	MACs umac-128-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com	
```

- OpenSSH 8.4
```
Host *
	KexAlgorithms -"ecdh*"
	HostKeyAlgorithms -"*ecdsa*,ssh-rsa*"
	MACs umac-128-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
```

- OpenSSH 8.9 / 9.1
```
Host *
	KexAlgorithms -"ecdh*"
	HostKeyAlgorithms -"*ecdsa*"
	MACs umac-128-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
```

Na základe iného odporúčania ([whoami.filippo.io](https://github.com/FiloSottile/whoami.filippo.io)) môžem zakázať predstavovanie sa všetkými verejnými kľúčmi. Toto nastavenie je vhodná vložiť až na koniec konfiguračného súboru, za všetky nastavenia jednotlivých spojení.

```
Host *
    PubkeyAuthentication no
    IdentitiesOnly yes
```

V adresári `~/.ssh` (*chmod 700*) sú uložené teda viaceré dôležité súbory:

+ `config` (*chmod 600*) – užívateľský konfiguračný súbor OpenSSH klienta
- OpenSSH kľúče – súkromný (*chmod 600*) a verejný (*chmod 644*)
- `authorized_keys` (*chmod 600*) – zoznam verejných kľúčov užívateľov oprávnených sa prihlasovať
- `known_hosts` (*chmod 600*) – zoznam adries a verejných kľúčov dôveryhodných hostiteľov

O všetkých podrobnejšie viď nižšie.

#### Generovanie kľúčov

Bezpečný a pohodlný spôsob overovania identity pri prihlasovaní na server je overenie identity pomocou páru OpenSSH kľúčov. Generujem ich, ako bežný užívateľ. Pokiaľ nemám špeciálny dôvod na generovanie nejakého konkrétneho typu, tak generujem kľúč typu ED25519. V porovnaní s RSA kľúčom je podľa všetkého kľúč typu ED25519 modernejší, menší ale rýchlejší a bezpečnejší.

```bash
ssh-keygen -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "komentar_na_odlisenie"
# alebo aj rovno s heslom
ssh-keygen -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "komentar_na_odlisenie" -P "heslo"
# alebo rovno bez hesla
ssh-keygen -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "komentar_na_odlisenie" -N ""
```

Výsledkom je pár OpenSSH kľúčov, uložený v `~/.ssh`. Súkromná časť páru kľúčov je uložená pod zadaným menom `id_ed25519` a verejná časť, ako `id_ed25519.pub`. Kópiu verejnej časti vložím na server kam sa chcem prihlasovať, do súboru `~/.ssh/authorized_keys`. Súkromnú časť strážim jak oko v hlave.

Zvyšujúca hodnota parametru `-a` zvyšuje odolnosť súkromného kľúča voči odhaleniu hesla hrubou silou („brute force attack“). Je to počet opakovaní matematickej funkcie s generovaným kľúčom s heslom.

Ak z akéhokoľvek dôvodu potrebujem RSA kľúč, tak by mal mať aspoň 4096 bitov.

```bash
ssh-keygen -a 100 -t rsa -b 4096 -f ~/.ssh/id_rsa -C "komentar" -P "heslo"
```

Vytvorené heslo môžem zmeniť, potrebujem samozrejme vedieť aj to pôvodné.

```bash
ssh-keygen -f ~/.ssh/id_ed25519 -pP "stare_heslo" -N "nove_heslo"
```

Zmeniť môžem taktiež komentár ku kľúču, pri kľúčoch s heslom bude potrebné zadať aj heslo.

```bash
ssh-keygen -f ~/.ssh/id_ed25519 -cC "novy_komentar"
```

Kľúče či už generované alebo skopírované by mali mať nastavené správne oprávnenia, užívateľa aj skupinu.

```bash
# užívateľom aj skupinou všetkých kľúčov by som mal byť ja
sudo chown $USER:$USER ~/.ssh/id*
# všetky súkromné kľúče majú byť prístupné výhradne užívateľovi
chmod 600 ~/.ssh/id*
# verejné kľúče možu byť čitateľné všetkými
chmod 644 ~/.ssh/id*.pub
```

#### ~/.ssh/authorized_keys

Dôležitý súbor obsahujúci verejné kľúče užívateľov oprávnených prihlasovať sa do systému cez OpenSSH. Každý kľúč je na novom riadku.

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### ~/.ssh/known_hosts

Pri každej snahe o pripojenie klienta ku OpenSSH serveru, klient vykoná kontrolu záznamov v súbore `~/.ssh/known_hosts` a overí či je pre daný server už záznam a či sa zhoduje serverom prezentovaný a v súbore zaznamenaný verejný kľúč. Pokiaľ tam pre daný server záznam ešte nie je, zobrazí odtlačok prsta verejného kľúča, ktorý ponúkol server a opýta sa či som si istý, že chcem pokračovať v spojení. Ak už pre daný server síce záznam je, ale ponúknutý verejný kľúč a záznam sa nezhodujú oznámi to a spojenie nenadviaže.

Súbor `~/.ssh/known_hosts` je vlastne zoznam serverov, ktorým som sa rozhodol dôverovať. Každý riadok je jeden záznam skladajúci sa z niekoľkých informácii:

- adresa servera v podobe `hostname` alebo IPv4, IPv6 vrátane čísla portu ak je iný, ako 22
- typ kľúča
- verejná časť kľúča
- prípadne komentár ku kľúču

V závislosti od nastavenia `HashKnownHosts` v `/etc/ssh/ssh_config` môže byť prvá časť záznamu (adresa servera) uložená buď, ako obyčajný text alebo, ako `salt` a `SHA1 hash` tejto informácie.

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/known_hosts
chmod 600 ~/.ssh/known_hosts
```

Záznam do súboru nemusí byť vykonaný až pri prvom pokuse o pripojenie ku serveru, ale môžem tam vložiť informácie o dôveryhodnom serveri cielene vopred.

```bash
# uložiť s adresou v čitateľnom texte
ssh-keyscan -p 22 github.com >> $HOME/.ssh/known_hosts

# alebo uložiť so zahašovanou adresou servera
ssh-keyscan -H -p 22 github.com >> $HOME/.ssh/known_hosts
```

Alebo môžem tiež v prípade potreby záznamy o konkrétnom serveri zmazať zo súboru `~/.ssh/known_hosts` lebo napríklad server zmenil kľúče ktorými sa predstavuje.

```bash
ssh-keygen -f "$HOME/.ssh/known_hosts" -R "github.com"

# pokiaľ mám všetky záznamy len v ~/.ssh/known_hosts
ssh-keygen -R "192.168.111.48"
```

Prítomnosť záznamu o nejakom serveri v `known_hosts` môžem overiť.

```bash
ssh-keygen -v -H -F 192.168.111.48

# v prípade, že načúva na neštandardnom porte
ssh-keygen -v -H -F [192.168.111.48]:2222
```

Toto nie je správne a bezpečné, ale môže nastať situácia, že sa potrebujem pripojiť ku serveru a nevykonať túto kontrolu v súbore `~/.ssh/known_hosts`.

```bash
# ak v known_hosts nie je záznam pre daný server
ssh -o StrictHostKeyChecking=no 192.168.3.34

# ak už záznam je, ale verejné kľúče nesedia
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null 192.168.111.48
```

---

## Zdroj

- [OpenSSH](https://www.openssh.com)
- [Manpages of openssh-server in Debian bullseye](https://manpages.debian.org/bullseye/openssh-server/index.html)
- [Manpages of openssh-client in Debian bullseye](https://manpages.debian.org/bullseye/openssh-client/index.html)
