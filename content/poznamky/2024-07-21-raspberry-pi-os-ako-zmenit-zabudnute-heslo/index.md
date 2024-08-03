---
title: "Raspberry Pi Os - ako zmeniť zabudnuté heslo"
date: 2024-07-21T17:13:48+02:00
draft: false
description: Ako zmeniť respektíve znovu nastaviť heslo pre užívateľa operačného systému Raspbian / Raspberry Pi OS.
type: posts
tags:
  - Raspbian
  - Raspberry Pi
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem zmeniť respektíve znovu nastaviť heslo pre užívateľa operačného systému Raspbian / Raspberry Pi OS na jednodoskovom počítači Raspberry Pi.

Nedopatrením som to heslo zabudol a to čo som mal poznamenané nefungovalo a jedine ako sa dalo ku Pi prihlásiť bolo lokálne, takže bez hesla to nešlo, musel som ho zmeniť.

## Riešenie

Tento postup som použil konkrétne na Raspberry Pi 3 Model B Rev 1.2.

Z rôznych nájdených / dostupných metód som zvolil metódu dočasného pridania ďalšieho parametru `init=/bin/sh` jadru pri najbližšom spúšťaní OS.

Raspberry Pi OS používa na takéto odovzdanie parametrov jadru súbor `/boot/cmdline.txt`.

Tento parameter nastaví bootovanie do administrátorskej konzoly.

### Dočasná úprava `cmdline.txt`

Takže kartu s OS do ktorého sa neviem prihlásiť kvôli zabudnutému heslu, vyberiem z Raspberry Pi a vložím do iného počítača (Windows/Linux).

Pomocou textového editoru upravím súbor `/boot/cmdline.txt`.

Súbor by mal obsahovať jediný riadok s rôznymi parametrami, jednotlivé parametre sú oddelené medzerou, na koniec riadku vložím `init=/bin/sh`. Riadok bude po úprave teda vyzerať nejako takto:

```txt
dwc_otg.lpm_enable=0 console=serial0,115200 console=tty1 root=PARTUUID=d6b6d6b6-42 rootfstype=ext4 elevator=deadline fsck.mode=force fsck.repair=yes rootwait cgroup_memory=1 cgroup_enable=memory init=/bin/sh
```

### Nastavenie hesla

Pamäťovú kartu s takto upraveným súborom, vložím späť do Raspberry Pi, je potrebné pripojiť aj monitor a klávesnicu a môžem Pi zapnúť. Spustí sa proces bootovania, ale ten by sa mal v istom kroku zastaviť.

Po stlačení klávesy `enter` by sa mala zobraziť výzva operačného systému - znak mriežka.

Zadám postupne príkazy v presnom poradí, primountujem koreňový adresár, nastavím heslo pre požadovaného užívateľa, zapíšem zmeny do súborového systému a opätovne spustím zavádzanie OS.

```sh
mount -o remount, rw /
passwd pi
sync
exec /sbin/init
```

Po zadaní posledného príkazu sa znovu spustí proces bootovania, ale jednorazovo sa nebude brať ohľad na parameter `init=/bin/sh` a teda operačný systém nabootuje ako zvyčajne. Môžem si overiť správnosť novo vytvoreného hesla.

### Úprava `cmdline.txt` do pôvodného stavu

Ak som so zmenou hesla spokojný je potrebné konfiguračný súbor opraviť, odobratím posledného pridaného parametru.

Toto už môžem vykonať priamo na Raspberry Pi.

```sh
sudo vi /boot/cmdline.txt
```

Súbor by mal obsahovať jediný riadok s rôznymi parametrami, jednotlivé parametre sú oddelené medzerou, na konci riadku by mal byť ako posledný parameter `init=/bin/sh` - ten odstránim.

Na záver reštartujem Raspberry Pi.

```sh
sudo systemctl reboot
```

---

## Zdroj

- [How to reset forgotten password and/or retrieve forgotten username](https://forums.raspberrypi.com/viewtopic.php?t=319398)
