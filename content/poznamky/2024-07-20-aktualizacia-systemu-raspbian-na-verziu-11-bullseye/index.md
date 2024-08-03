---
title: "Aktualizácia systému Raspbian na verziu 11 Bullseye"
date: 2024-07-20T18:09:12+02:00
draft: false
description: Ako aktualizovať serverový operačný systém Raspbian z verzie 11 Bullseye na novšiu verziu 11 Bullseye.
type: posts
tags:
  - Debian
  - Raspbian
  - Raspberry Pi
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem aktualizovať serverový operačný systém Raspbian z verzie 10 Buster na novšiu verziu 11 Bullseye. Aktualizáciu chcem uskutočniť počas normálnej prevádzky serveru, bez odstávky, respektíve s minimálnym časom nedostupnosti jednotlivých služieb.

Raspbian 11 „Bullseye“ (postavený na Debiane 11) bol vydaný 3. decembra 2021, posledná aktualizácia -- Raspbian 11.10 bola uvoľnená 12. marca 2024.

Názov operačného systému bol zmenený z pôvodného Raspbian na Raspberry Pi OS.

## Upozornenie

Proces povýšenia operačného systému je delikátna záležitosť zložená z viacerých po sebe nasledujúcich krokov. Je veľmi dôležité úplne porozumieť jednotlivým krokom a dodržať ich presné poradie.

Nesprávne alebo nepresne zadané príkazy, či príkazy zadané v nesprávnom poradí môžu viesť až k úplnému odstaveniu či znefunkčneniu celého serveru.

## Riešenie

Tento postup som použil konkrétne na Raspberry Pi 3 Model B Rev 1.2.

### Bežná aktualizáciu systému

Pred samotnou aktualizáciou operačného systému na novšiu verziu vykonám tradičnú aktualizáciu všetkých nainštalovaných súčastí.

```sh
sudo apt update
apt list --upgradable
sudo apt upgrade
sudo apt full-upgrade
```

Odstránim všetky skôr nainštalované, ale už nepotrebné balíčky a ich súčasti a odstránim aj všetky pred tým stiahnuté balíčky.

```sh
sudo apt autoremove
sudo apt autoclean
```

Skontrolujem či v systéme neostali predsa zvyšky po predchádzajúcich aktualizáciách, kópie konfiguračných súborov a tak podobne.

```sh
sudo find /etc -name '*.dpkg-*' -o -name '*.ucf-*' -o -name '*.merge-error'
```

Ak som s výsledkom spokojný, reštartujem počítač, aby sa všetky vykonané zmeny naplno prejavili.

```sh
sudo systemctl reboot
```

### Aktualizácia jadra/firmvéru - voliteľne

Na vlastne riziko môžem použiť nastroj `rpi-update` určený na aktualizáciu firmvéru a jadra Linuxu.

Tento krok obzvlášť môže spôsobiť nečakané problémy, keďže novšie verzie ovládačov alebo jadra môžu priniesť aj nové problémy. Je vhodné vykonať zálohu.

Samotný krok je jednoduchý, ako administrátor zavolám utilitu a odsúhlasím pokračovanie.

```sh
sudo rpi-update
```

Po úspešnej aktualizácii reštartujem počítač, aby sa novy firmvér aj jadro začali používať.

```sh
sudo systemctl reboot
```

Na mojom obstarožnom Raspberry Pi 3 to prebehlo našťastie bez problémov a z jadra 5.14 som sa posunul rovno na radu 6.6, konkrétne verzia 6.6.39-v7+.

### Kontrola stavu pred povýšením

Skontrolujem stav jednotlivých nainštalovaných balíčkov a ich pripravenosť na aktualizáciu. Výstup nasledujúceho príkazu zobrazí všetky balíčky, ktoré sa nepodarilo správne nainštalovať (majú príznaky ako napr. `Half-Installed` alebo `Failed-Config`).

```sh
sudo dpkg --audit
```

Skontrolujem či nemajú niektoré balíčky nastavený príznak `hold` (pozdržať pred aktualizáciou).

```sh
sudo dpkg --get-selections | grep 'hold$'
sudo apt-mark showhold
```

### Záloha

Vykonám zálohu podľa najlepšieho vedomia a svedomia.

### Aktualizácia repozitárov

Vytvorím záložné kópie zoznamov zdrojov softwaru.

```sh
mkdir ~/aptbackup
sudo cp -v /etc/apt/sources.list ~/aptbackup
sudo cp -rv /etc/apt/sources.list.d/ ~/aptbackup
```

V pôvodných zoznamoch zdrojov `/etc/apt` nahradím repozitáre pre Raspbian 10 Buster repozitármi pre novší Raspbian 11 Bullseye. Mohol by som to vykonať aj hromadne, napríklad `sed -i 's/buster/bullseye/g' /etc/apt/sources.list.d/*`, no pre istotu budem upravovať každý záznam zvlášť a ručne.

```sh
sudo vi /etc/apt/sources.list
sudo vi /etc/apt/sources.list.d/caddy-fury.list
sudo vi /etc/apt/sources.list.d/raspi.list
sudo vi /etc/apt/sources.list.d/php.list
sudo vi /etc/apt/sources.list.d/ansible.list
sudo vi /etc/apt/sources.list.d/expressvpn.list
sudo vi /etc/apt/sources.list.d/vscode.list
```

Na záver tohto kroku vykonám aktualizáciu repozitárov, ale už pre Raspberry Pi OS 11 Bullseye.

```sh
sudo apt update
```

### Povýšenie systému na Raspberry Pi OS 11 Bullseye

Pred samotným povýšením je ešte potrebne nainštalovať ďalšie balíky, bez nich by proces neprebehol úspešne.

```sh
sudo apt install libgcc-8-dev gcc-8-base
```

Po doinštalovaní vykonám povýšenie operačného systému, ale bez reštartovania systému.

```sh
sudo apt full-upgrade
```

### Úprava konfiguračných súborov a reštart

Skôr než Raspberry Pi reštartujem, upravím ešte konfiguračný súbor pre DHCP, bez tejto úpravy by som s veľkou pravdepodobnosťou nezískal IP adresu a nevedel by som sa ku Pi pripojiť pomocou ssh. Skontrolujem či daný konfiguračný súbor existuje.

```sh
sudo stat /etc/systemd/system/dhcpcd.service.d/wait.conf
```

Ak existuje, tak ho upravím, zmením cestu ku `dhcpcd`.

```sh
sudo vi /etc/systemd/system/dhcpcd.service.d/wait.conf
```

V Raspbian 10 bol cesta ku `dhcp` klientovi `/usr/lib/dhcpcd5/dhcpcd`, no v Raspbian 11 sa zmenila na `/usr/sbin/dhcpcd`. Takže správne upravený riadok ma vyzerať takto:

```
ExecStart=/usr/sbin/dhcpcd -q -w
```

V prípade, že túto opravu nevykonám a systém reštartujem, s veľkou pravdepodobnosťou sa ku systému nebudem vedieť pripojiť cez sieť. Budem sa musieť teda pripojiť lokálne a vykonať opravu:

```sh
sudo vi /etc/systemd/system/dhcpcd.service.d/wait.conf
sudo systemctl start systemd-networkd
networkctl list
sudo networkctl up enxb827eb553d7f
sudo systemctl start dhcpcd
```

Ďalej je možné zapnúť KMS. Toto som nevykonal.

```sh
sudo sed -i 's/dtoverlay=vc4-fkms-v3d/#dtoverlay=vc4-fkms-v3d/g' /boot/config.tx
sudo sed -i 's/\[all\]/\[all\]\ndtoverlay=vc4-kms-v3d/' /boot/config.txt
```

Na záver môžem systém reštartovať, musím dúfať, že nabehne v poriadku.

```sh
sudo systemctl reboot
```

### Odstránenie nepotrebných balíčkov

Po vydarenom povýšení systému môžem odstrániť skôr nainštalované, ale ďalej už nie potrebné balíčky. Odstránim aj všetky stiahnuté balíčky.

```sh
sudo apt --purge autoremove
sudo apt autoclean
```

### Príprava na ďalšie vydanie - voliteľne

Na záver môžem ešte vykonať kontrolu, nechám si vypísať zoznam odstránených balíčkov po ktorých mohlo v systéme niečo ostať (napr. konfiguračné súbory a podobne).

```sh
sudo dpkg -l | awk '/^rc/ { print $2 }'
```

Ak mi je jasné o aké balíčky ide a som si istý, že ich môžem kompletne so všetkým odstrániť, vykonám to:

```sh
sudo apt purge $(dpkg -l | awk '/^rc/ { print $2 }')
```

Ešte posledný reštart.

```sh
sudo systemctl reboot
```

## Zdroj

- [Raspberry Pi OS wiki](https://en.wikipedia.org/wiki/Raspberry_Pi_OS)
- [rpi-update](https://github.com/raspberrypi/rpi-update/blob/master/README.md)
- [The Idiot-Proof Guide to Upgrading Raspberry Pi from Buster to Bullseye](https://blues.com/blog/guide-upgrade-raspberry-pi-buster-bullseye/)
- [How To Upgrade To Raspberry Pi OS 11 Bullseye](https://www.linuxuprising.com/2021/11/how-to-upgrade-raspberry-pi-os-10.html#comment-5890807444)
- [Upgrading to Raspberry Pi OS Bullseye](https://pimylifeup.com/upgrade-raspberry-pi-os-bullseye/)
