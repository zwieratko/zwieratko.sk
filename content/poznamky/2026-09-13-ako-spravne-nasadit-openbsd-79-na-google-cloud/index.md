---
title: "Ako správne nasadiť OpenBSD 7.9 na Google Cloude"
date: 2026-09-13T07:16:45+02:00
draft: false
description:
type: posts
tags:
  - GCP
  - OpenBSD
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem v prostredí Google Cloudu vytvoriť dočasnú VM inštanciu:

- s oficiálnym a čo najaktuálnejším vydaním OpenBSD
- VM bez verejnej IP
- aby bol z VM prístup do Cloud Storage / Buckets
- aby bol z VM prístup na internet

---

## Upozornenie

Toto nie je oficiálny návod ani postup!

Výsledkom tohto postupu bude vytvorenie zdrojov v prostredí Google Cloud, ktoré budú spoplatnené!

Na záver je vyslovene odporúčané všetky vytvorené, nepotrebné zdroje odstrániť.

---

## Riešenie

Dostupnosť operačných systémov, ktoré je možné použiť pri vytvárani VM si viem jednoducho overiť.

```sh
gcloud compute images list \
  --project=zw-gcp-test-01 \
  --format="value(family)" | sort -u
```

A konkrétne napríklad len z rodiny OS Debian.

```sh
gcloud compute images list \
  --project=zw-gcp-test-01 \
  --filter='family~^debian' \
  --format="value(name,family,status)"
```

Keďže Google Cloud podľa všetkého neponúka obrazy OpenBSD, budem si musieť aspoň jeden vytvoriť 😎.

Pokiaľ taký obraz s aktuálnou verziou OpenBSD už mám, môžem rovno skočiť na časť o [vytváraní VM s OpenBSD](#vytvorenie-vm-s-openbsd).

---

### Vytvorenie pomocnej VM

Na vytváranie vlastného obrazu operačného systému budem potrebovať jednoduchú VM napríklad s OS Debian a so zapnutou [nested virtualization](https://docs.cloud.google.com/compute/docs/instances/nested-virtualization/enabling).

```sh
gcloud compute instances create builder-debian \
  --project=zw-gcp-test-01 \
  --zone=europe-west4-a \
  --machine-type=n2-standard-4 \
  --image-family=debian-13 \
  --image-project=debian-cloud \
  --boot-disk-size=40GB \
  --boot-disk-type=pd-balanced \
  --enable-nested-virtualization \
  --scopes=cloud-platform
```

Práve kôli potrebe vnorenej (nested) virtualizácii môžem použiť len obmedzené typy VM: N2, N1, C2.

---

### Inštalácia potrebných balíkov

Prihlásim sa do vytvorenej pomocnej VM s Debianom.

```sh
gcloud compute ssh builder-debian \
  --project=zw-gcp-test-01 \
  --zone=europe-west4-a \
  --tunnel-through-iap
```

Na vytvorenej VM môžem najskôr overiť, či má povolenú `nested virtualization`, je potrebné dostať akúkoľvek inú odpoveď, len nie `0`.

```sh
grep -cw vmx /proc/cpuinfo
```

Potom doinštalujem potrebné balíky. Debian som zvolil okrem iného aj preto, lebo balíky emulačného a virtualizačného nástroja [QEMU](https://wiki.debian.org/QEMU?pow_referer=https%3A%2F%2Fwww.google.com%2F) sú obsiahnuté priamo v hlavnom repozitári.

```sh
sudo apt-get update
sudo apt-get install -y qemu-system-x86 qemu-utils wget cloud-utils
```

Aby som nemusel qemu spúšťať s admin právami, pridám bežného užívateľa do skupiny `kvm`.

```sh
sudo usermod -aG kvm "$USER"
newgrp kvm
```

---

### Stiahnutie OpenBSD

Pokračujem ďalej v pomocnej VM s Debianom a stiahnem si aktuálny inštalačný obraz OpenBSD z ich oficiálnych stránok.

```sh
mkdir ~/openbsd-build && cd ~/openbsd-build
wget https://cdn.openbsd.org/pub/OpenBSD/7.9/amd64/install79.iso
```

---

### Vytvorenie diskového obrazu s OpenBSD

Stále z pomocnej VM. Najskôr vytvorím prázdny diskový obraz.

```sh
qemu-img create -f raw disk.raw 10G
```

Potom spustím vnorenú virtuálnu VM s pripojeným stiahnutým inštalačným obrazom OpenBSD.

```sh
qemu-system-x86_64 \
  -enable-kvm \
  -m 2048M \
  -smp 2 \
  -drive file=disk.raw,format=raw,if=virtio \
  -netdev user,id=net0 \
  -device virtio-net-pci,netdev=net0 \
  -cdrom install79.iso \
  -boot d \
  -nographic
```

Ihneď ako sa objaví vo výpise `boot>`, respektíve hneď po spustení `qemu` musím viacnásobným stláčaním klávesy medzerník prerušiť proces zavádzania OS aby som mohol vložiť príkaz na presmerovanie výstupu do terminálu.

```txt
set tty com0
```

Po vložení príkazu stlačím `enter` a po opätovnom zobrazení výzvy `boot>` stlačím `enter` ešte raz. Výpis bude vyzerať nejako takto:

```
SeaBIOS (version 1.16.3-debian-1.16.3-2)


iPXE (https://ipxe.org) 00:03.0 CA00 PCI2.10 PnP PMM+7EFC6EE0+7EF06EE0 CA00



Booting from DVD/CD...
CD-ROM: E0
Loading /7.9/AMD64/CDBOOT
probing: pc0 com0 mem[639K 2046M a20=on]
disk: fd0 hd0+* cd0
>> OpenBSD/amd64 CDBOOT 3.65
boot>  set tty com0
switching console to com>> OpenBSD/amd64 CDBOOT 3.65
boot>
```

Postupne prejdem celým procesom inštalácie OpenBSD. Buď vyberiem jednu z možností podľa písmena v okrúhlych zátvorkách, alebo predvolenú možnosť v hranatých zátvorkách, alebo vložím/napíšem požadovanú hodnotu.

- (I)nstall
- [vt220]
- openbsd79
- [vio0]
- [autoconf]
- [autoconf]
- [done]
- tajneheslo
- tajneheslo
- [yes]
- no
- [yes]
- 115200
- rado
- Rado van Zwieratko
- tajneheslo
- tajneheslo
- [no]
- [Europe/Amsterdam]
- [sd0]
- [no]
- [whole]
- [a]
- cd0
- [7.9/amd64]
- [done]
- yes
- [done]
- halt

Potom môžem po zastavení OpenBSD inštalátora qemu úplne vypnúť: `ctrl + A` a potom `X`.

Tu je celý priebeh odpovedí:

```
Welcome to the OpenBSD/amd64 7.9 installation program.
(I)nstall, (U)pgrade, (A)utoinstall or (S)hell? i
At any prompt except password prompts you can escape to a shell by
typing '!'. Default answers are shown in []'s and are selected by
pressing RETURN.  You can exit this program at any time by pressing
Control-C, but this can leave your system in an inconsistent state.

Terminal type? [vt220]
System hostname? (short form, e.g. 'foo') openbsd79

Available network interfaces are: vio0 vlan0.
Network interface to configure? (name, lladdr, '?', or 'done') [vio0]
IPv4 address for vio0? (or 'autoconf' or 'none') [autoconf]
IPv6 address for vio0? (or 'autoconf' or 'none') [autoconf]
Available network interfaces are: vio0 vlan0.
Network interface to configure? (name, lladdr, '?', or 'done') [done]
Using DNS domainname my.domain
Using DNS nameservers at 10.0.2.3

Password for root account? (will not echo)
Password for root account? (again)
Start sshd(8) by default? [yes]
Do you expect to run the X Window System? [yes] no
Change the default console to com0? [yes]
Available speeds are: 9600 19200 38400 57600 115200.
Which speed should com0 use? (or 'done') [9600] 115200
Setup a user? (enter a lower-case loginname, or 'no') [no] rado
Full name for user rado? [rado] Rado van Zwieratko
Password for user rado? (will not echo)
Password for user rado? (again)
WARNING: root is targeted by password guessing attacks, pubkeys are safer.
Allow root ssh login? (yes, no, prohibit-password) [no]
What timezone are you in? ('?' for list) [Europe/Amsterdam]

Available disks are: sd0.
Which disk is the root disk? ('?' for details) [sd0]
Encrypt the root disk with a (p)assphrase or (k)eydisk? [no]
No valid MBR or GPT.
Use (W)hole disk MBR, whole disk (G)PT or (E)dit? [whole]
Setting OpenBSD MBR partition to whole sd0...done.
The auto-allocated layout for sd0 is:
#                size           offset  fstype [fsize bsize   cpg]
  a:          1190.2M               64  4.2BSD   2048 16384     1 # /
  b:           256.0M          2437568    swap
  c:         10240.0M                0  unused
  d:          3072.0M          2961856  4.2BSD   2048 16384     1 # /usr
  e:          2048.0M          9253312  4.2BSD   2048 16384     1 # /home
Use (A)uto layout, (E)dit auto layout, or create (C)ustom layout? [a]
/dev/rsd0a: 1190.2MB in 2437504 sectors of 512 bytes
6 cylinder groups of 202.50MB, 12960 blocks, 25920 inodes each
/dev/rsd0e: 2048.0MB in 4194304 sectors of 512 bytes
11 cylinder groups of 202.50MB, 12960 blocks, 25920 inodes each
/dev/rsd0d: 3072.0MB in 6291456 sectors of 512 bytes
16 cylinder groups of 202.50MB, 12960 blocks, 25920 inodes each
/dev/sd0a (e1f775f25bb12b2d.a) on /mnt type ffs (rw, asynchronous, local)
/dev/sd0e (e1f775f25bb12b2d.e) on /mnt/home type ffs (rw, asynchronous, local, nodev, nosuid)
/dev/sd0d (e1f775f25bb12b2d.d) on /mnt/usr type ffs (rw, asynchronous, local, nodev)

Let's install the sets!
Location of sets? (cd0 disk http nfs or 'done') [http] cd0
Pathname to the sets? (or 'done') [7.9/amd64]

Select sets by entering a set name, a file name pattern or 'all'. De-select
sets by prepending a '-', e.g.: '-game*'. Selected sets are labelled '[X]'.
    [X] bsd           [X] base79.tgz    [X] game79.tgz    [X] xfont79.tgz
    [X] bsd.mp        [X] comp79.tgz    [X] xbase79.tgz   [X] xserv79.tgz
    [X] bsd.rd        [X] man79.tgz     [X] xshare79.tgz
Set name(s)? (or 'abort' or 'done') [done]
Directory does not contain SHA256.sig. Continue without verification? [no] yes
Installing bsd          100% |**************************| 32203 KB    00:17
Installing bsd.mp       100% |**************************| 32331 KB    00:17
Installing bsd.rd       100% |**************************|  4734 KB    00:02
Installing base79.tgz   100% |**************************|   510 MB    05:07
Extracting etc.tgz      100% |**************************|   269 KB    00:00
Installing comp79.tgz   100% |**************************| 88886 KB    00:57
Installing man79.tgz    100% |**************************|  8406 KB    00:05
Installing game79.tgz   100% |**************************|  2742 KB    00:01
Installing xbase79.tgz  100% |**************************| 47835 KB    00:30
Extracting xetc.tgz     100% |**************************|  8772       00:00
Installing xshare79.tgz 100% |**************************|  4562 KB    00:03
Installing xfont79.tgz  100% |**************************| 23022 KB    00:13
Installing xserv79.tgz  100% |**************************| 11815 KB    00:07
Installing BUILDINFO    100% |**************************|    54       00:00
Location of sets? (cd0 disk http nfs or 'done') [done]
Saving configuration files... done.
Making all device nodes... done.
Multiprocessor machine; using bsd.mp instead of bsd.
fw_update: add none; update none
Relinking to create unique kernel... done.

CONGRATULATIONS! Your OpenBSD install has been successfully completed!

When you login to your new system the first time, please read your mail
using the 'mail' command.

Exit to (S)hell, (H)alt or (R)eboot? [reboot] halt
syncing disks... done

The operating system has halted.
Please press any key to reboot.

QEMU: Terminated
```

Na záver skontrolujem vytvorený súbor.

```sh
ls -l disk.raw
```

A skomprimujem vytvorený súbor - obraz disku s čerstvo nainštalovaným OpenBSD, podľa [GCP špecifikácie](https://docs.cloud.google.com/compute/docs/import/import-existing-image#create_image_file).

```sh
tar --format=oldgnu -Sczf openbsd-79-v2.tar.gz disk.raw
```

---

### Nahratie do bucketu

A ešte posledný krok z pomocnej VM, nahrám vytvorený obraz disku s OpenBSD do projektového bucketu.

```sh
gcloud storage cp openbsd-79-v2.tar.gz gs://zw_test-01/custom-images/
```

---

### Registrácia nového obrazu disku

Keďže obraz disku je už v buckete, nasledujúci krok môžem vykonať aj z pomocnej VM, ale už aj z Cloud Shellu alebo odkiaľkoľvek kde mám gcloud s prístupom do tohto projektu.

```sh
gcloud compute images create openbsd-79-v2 \
  --project=zw-gcp-test-01 \
  --source-uri=gs://zw_test-01/custom-images/openbsd-79-v2.tar.gz \
  --family=openbsd
```

A môžem si aj rovno overiť či už obraz z takejto rodiny uvidím vo výpise.

```sh
gcloud compute images list \
  --project=zw-gcp-test-01 \
  --filter='family~^openbsd' \
  --format="value(name,family,status)"
```

---

### Odstránenie pomocnej VM

Po vytvorení a nahratí obrazu disku s OpenBSD môžem pomocnú VM s Debianom odstrániť.

```sh
gcloud compute instances delete builder-debian \
  --zone=europe-west4-a \
  --project=zw-gcp-test-01
```

Prípadne môžem skontrolovať, či bola pomocná VM odstránená.

```sh
gcloud compute instances list --project=zw-gcp-test-01
```

---

### Nastavenie siete v cloude

Povolím prístup z daného subnetu ku Google cloudovým API endpointom.

```sh
gcloud compute networks subnets update default \
  --region=europe-west4 \
  --enable-private-ip-google-access \
  --project=zw-gcp-test-01
```

Vytvorím [cloudový router](https://docs.cloud.google.com/sdk/gcloud/reference/compute/routers/create) vo VPC sieti/regióne.

```sh
gcloud compute routers create nat-router-euw4 \
  --network=default \
  --region=europe-west4 \
  --project=zw-gcp-test-01
```

Vo vytvorenom routri [pridám NAT](https://docs.cloud.google.com/sdk/gcloud/reference/compute/routers/nats/create) pre všetky subnety v regióne.

```sh
gcloud compute routers nats create nat-gateway-euw4 \
  --router=nat-router-euw4 \
  --region=europe-west4 \
  --auto-allocate-nat-external-ips \
  --nat-all-subnet-ip-ranges \
  --project=zw-gcp-test-01
```

Tieto vytvorené prostriedky sú už ale spoplatnené, presnejšie Cloud NAT. A teda na rozdiel od zmeny nastavenia pre prístup k interným API, ktorý môžem ponechať povolený, tak tieto prostriedky je vyslovene vhodné po ukončení používania odstrániť.

---

### Vytvorenie VM s OpenBSD

A konečne 🎉 môžem pristúpiť ku vytvoreniu dočasnej VM v Google Cloude s OS OpenBSD.

Pri výbere typu VM sa zameriam na Intel, bo pri detekcii AMD EPYC sa jadro v C funkcii `cpu_fix_msrs` pokúša zapísať bezpečnostnú opravu pre špekulatívne vykonávanie instrukcií a v GCP virtualizácii to kvôli prísnej izolácii vyvolá protection fault trap a pád do debuggeru.

```
kernel: protection fault trap, code=0
Stopped at      cpu_fix_msrs+0x13f:     wrmsr
ddb{0}>
```

Takže po prvotných pokusoch s `e2-medium` som nakoniec zvolil `n2-standard-2`.

```sh
gcloud compute instances create openbsd-server-01 \
  --project=zw-gcp-test-01 \
  --zone=europe-west4-a \
  --machine-type=n2-standard-2 \
  --image=openbsd-79-v2 \
  --boot-disk-size=10GB \
  --boot-disk-type=pd-balanced \
  --no-address \
  --scopes=cloud-platform \
  --metadata=serial-port-enable=true
```

A môžem sa ku novovytvorenej VM s OpenBSD pripojiť cez sériovú konzolu. Zatiaľ tam nie sú žiadne SSH kľúče!

```sh
gcloud compute connect-to-serial-port openbsd-server-01 \
  --zone=europe-west4-a \
  --project=zw-gcp-test-01
```

Zo sériovej konzoly sa nakoniec [odpojím](https://docs.cloud.google.com/compute/docs/troubleshooting/troubleshooting-using-serial-console#disconnecting_from_the_serial_console) kombináciou:  
`enter`, `~`, `.` (enter, potom tilda a potom bodka).

---

### Základné nastavenie po inštalácii OpenBSD

Ak sa chcem ku VM s OpenBSD prihlasovať pomocou SSH kľúčov, potrebujem počas pripojenia cez sériovú konzolu pridať verejnú časť SSH medzi autorizované kľúče daného užívateľa. Kľúč vytiahnem z meta-dát projektu.

```sh
(printf "GET /computeMetadata/v1/project/attributes/ssh-keys HTTP/1.0\r\nHost: metadata.google.internal\r\nMetadata-Flavor: Google\r\n\r\n") | nc 169.254.169.254 80 | grep '^rado:' | sed 's/^rado://' > ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

A môžem ešte bežného užívateľa pridať medzi administrátorov. Toto potrebujem vykonať ako `root` (ešte stále cez sériovú konzolu).

```sh
echo "permit keepenv :wheel" > /etc/doas.conf
usermod -G operator rado
usermod -G wheel rado
```

Teraz už by som sa mal vedieť prihlásiť aj pomocou SSH kľúčov ako bežný užívateľ.

```sh
gcloud compute ssh rado@openbsd-server-01 \
  --project=zw-gcp-test-01 \
  --zone=europe-west4-a \
  --tunnel-through-iap
```

Po opätovnom prihlásení (ako bežný užívateľ), už môžem zadávať príkazy ako admin.

```sh
# doinštalovanie chýbajúcich ovládačov
doas fw_update

# aktualizácia systému
doas syspatch
```

---

### Odstránenie VM s OpenBSD

A ak už VM s OpenBSD nepotrebujem, môžem ju odstrániť.

```sh
gcloud compute instances delete openbsd-server-01 \
  --zone=europe-west4-a \
  --project=zw-gcp-test-01
```

Ak som si odstraňovanou VM úplne istý, môžem použiť prepínač `--quiet`, `-q` a tak vypnúť interatívne potvrdenie. VM sa jednoducho zmaže pbez ďalšieho potvrdenia!

Ďalej odstránim NAT bránu.

```sh
gcloud compute routers nats delete nat-gateway-euw4 \
  --router=nat-router-euw4 \
  --region=europe-west4 \
  --project=zw-gcp-test-01
```

Odstránim aj Cloud router.

```sh
gcloud compute routers delete nat-router-euw4 \
  --region=europe-west4 \
  --project=zw-gcp-test-01
```

Na záver môžem vykonať kontrolu, či v danom projekte ešte niečo neostalo.

```sh
# Kontrola VM
gcloud compute instances list --project=zw-gcp-test-01

# Kontrola samostatných diskov
gcloud compute disks list --project=zw-gcp-test-01

# Kontrola routerov
gcloud compute routers list --project=zw-gcp-test-01
```

Všetky tri príkazy by mali vrátiť prázdny zoznam: `Listed 0 items.`.

---

## Zdroj

- [GCP - About nested virtualizoation](https://docs.cloud.google.com/compute/docs/instances/nested-virtualization/overview)
- [GCP - Create custom images](https://docs.cloud.google.com/compute/docs/images/create-custom)
- [GCP - Manually import boot disks](https://docs.cloud.google.com/compute/docs/import/import-existing-image)
- [QEMU](https://www.qemu.org/docs/master/index.html)
- [OpenBSD](https://www.openbsd.org/)
