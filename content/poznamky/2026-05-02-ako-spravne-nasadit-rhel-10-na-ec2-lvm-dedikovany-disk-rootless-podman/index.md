---
title: "Ako správne nasadiť RHEL 10 na EC2: LVM, dedikovaný disk a rootless Podman"
date: 2026-05-02T19:24:22+02:00
draft: false
description: "Ako v cloudovom prostredí AWS vytvoriť EC2 so zaregistrovaným OS RHEL 10, Podman a úložisko obrazov kontajnerov na LVM disku."
type: posts
tags:
  - AWS
  - Linux
  - RHEL
  - Kontajnery
  - Podman
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem v cloudovom prostredí AWS vytvoriť EC2 so zaregistrovaným OS RHEL 10, a na ten potom nainštalovať a nastaviť Podman tak, aby mohol kontajnery spúšťať aj bežný užívateľ a aby sa obrazy kontajnerov ukladali na separátny LVM disk.

Chcem to riešiť priamo v termináli a nie pomocou infraštruktúrnych nástrojov ako je Terraform a tiež nie pomocou CI/CD pipeline. Celý proces chcem riadiť ručne. A toto má byť ucelený prehľad krokov a postupov ako to dosiahnuť.

---

## Upozornenie

Toto nie je oficiálny návod ani postup!

Výsledkom tohto postupu bude vytvorenie zdrojov v prostredí AWS, ktoré budú spoplatnené!

Na záver je vyslovene odporúčané všetky vytvorené, nepotrebné zdroje odstrániť.

---

## Príprava

Podmienkou na legálne a riadne použitie OS RHEL je okrem iného napríklad predplatné typu "Red Hat Developer Subscription for Individuals". Podrobnejšie o predplatnom: [No-cost Red Hat Enterprise Linux Individual Developer Subscription: FAQs](https://developers.redhat.com/articles/faqs-no-cost-red-hat-enterprise-linux).

Ďalej je potrebné v [Red Hat zákazníckom portáli](https://access.redhat.com/management/cloud), v časti "Cloud Access" pridať poskytovateľa cloudu (modré tlačidlo "Enable a new provider") v ktorom chcem obrazy OS používať. Pridám tam AWS, potrebujem na to číslo účtu. Trvá to asi tak desiatky minút, maximálne hodinu pokiaľ sa stanú obrazy viditeľné v AWS účte. 

---

## Riešenie

### Vytvorenie EC2

Môžem si pozrieť aktuálny zoznam obrazov RHEL 10.1 pre 64 bitovú architektúru. Zoradené budú od najnovších.

```sh
aws ec2 describe-images \
  --owners 309956199498 \
  --filters "Name=name,Values=RHEL-10.1*Access*" "Name=architecture,Values=x86_64" \
  --query 'reverse(sort_by(Images, &CreationDate))[*].[ImageId, Name, CreationDate]' \
  --output table
```

Viem sa pozrieť aj podrobnejšie na konkrétny obraz, vrátane informácii o predvolenom type a veľkosti disku.

```sh
aws ec2 describe-images --image-ids ami-0cef2ae3905957c15
```

Nastavím všetky premenné s hodnotami potrebnými pre nasadenie EC2.

Minimálne sú to:
- Id obrazu najnovšieho vydania RHEL 10.1, alebo konkrétne id podľa výberu
- Id dvoch SG, jedna pre internú komunikáciu medzi zdrojmi a druhá pre externé pripojenie cez ssh
- zoznam diskov, opäť dva, jeden pre OS a druhý pre data/kontajnery - nesmiem sa nechať zmiasť názvami v premennej: `sda1` a `sdb`, disky po vytvorení VM budú v systéme nazvané ako `nvme0n1` a `nvme1n1`
- krátky náhodny reťazec na rozlíšenie inštancií, ak by sa nasadzovali viac ako jedna

```sh
RHEL_IMAGE_ID=$(aws ec2 describe-images \
  --owners 309956199498 \
  --filters "Name=name,Values=RHEL-10.1*Access*" "Name=architecture,Values=x86_64" \
  --query 'reverse(sort_by(Images, &CreationDate))[0].ImageId' \
  --output text)

SG_DEFAULT=sg-032e1cd3251bb7b76
SG_SSH=sg-0a20cbce81e679d79

BLOCK_DEVICES='[
  {"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}},
  {"DeviceName":"/dev/sdb","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}
]'

SUFFIX=$(openssl rand -hex 2)
printf "%s\n" "$SUFFIX"
```

S takto pripravenými premennými môžem vyskladať príkaz na vytvorenie EC2.

Okrem iného tam nastavujem ešte:
- veľkosť inštancie (t3a.large = 2 vCPU / 8 GB RAM)
- subnet/AZ (subnet-0c623214fa237427f = eu-central-1a)
- nevyžadujem žiadnu verejnú externú IPv4
- ale vyžadujem 1x IPv6
- iné potrebné nastavenia (IMDSv2, tagy)

```sh
aws ec2 run-instances \
  --image-id "$RHEL_IMAGE_ID" \
  --instance-type t3a.large \
  --key-name vm_aws_ed25519 \
  --security-group-ids "$SG_DEFAULT" "$SG_SSH" \
  --subnet-id subnet-0c623214fa237427f \
  --ipv6-address-count 1 \
  --no-associate-public-ip-address \
  --metadata-options "HttpTokens=required,HttpEndpoint=enabled" \
  --block-device-mappings "$BLOCK_DEVICES" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=RHEL10-$SUFFIX},{Key=ProvisionedBy,Value=ci}]"
```

Podrobné informácie o vytváranej EC2 sa zobrazia ihneď po zadaní príkazu.

Ak som to prehliadol, alebo to už neviem nájsť, môžem si zobraziť IPv6 adresu potrebnú na pripojenie k VM, respektíve ju rovno uložím do premennej.

```sh
IPV6=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=RHEL10-$SUFFIX" \
  --query "Reservations[*].Instances[*].Ipv6Address" \
  --output text)
printf "%s\n" "$IPV6"
```

Po necelej minúte je zvyčajne inštancia / VM vytvorená a môžem sa ku nej pripojiť.

```sh
ssh -i ~/.ssh/vm_aws_ed25519 ec2-user@"$IPV6"
```

Keďže je to oficiálne licencovaný produkt a podmienkou plnohodnotného využívania repozitárov je registrácia, tak OS RHEL zaregistrujem.

Na registráciu môžem použiť osobné prihlasovacie údaje ku Red Hat účtu, alebo aktivačný kľúč. Ak chcem použiť kľúč, potrebujem okrem názvu kľúča ešte id organizácie a to môžem nájsť v časti [Activation Keys](https://console.redhat.com/insights/connector/activation-keys) v Red Hat webovej konzole.

```sh
sudo subscription-manager register --org xxx --activationkey "activation-key-default"

sudo subscription-manager refresh

sudo subscription-manager status

sudo subscription-manager identity
```

Po úspešnej registrácii môžem na plno využívať originálny RHEL 10 aj s oficiálnymi repozitármi.

---

### Inštalácia potrebných balíkov

Po nasadení EC2 najskôr aktualizujem systém a doinštalujem sadu obľúbených a potrebných balíkov.

```sh
sudo dnf upgrade --refresh -y

sudo dnf install -y \
  unzip \
  tree \
  nmap \
  tmux \
  yum-utils \
  lvm2 \
  lsof \
  openldap-clients \
  podman \
  podman-docker \
  git \
  curl \
  wget \
  tar \
  bind-utils \
  jq \
  vim \
  policycoreutils-python-utils \
  fuse-overlayfs \
  bash-completion
```

Ak chcem používať aj automatické dopĺňanie podman príkazov alebo názvov obrazov kontajnerov tak si vytvorím konfig a na vyskúšanie ho načítam aj v aktuálnej relácii.

```sh
sudo podman completion bash | sudo tee /etc/bash_completion.d/podman > /dev/null
source /etc/bash_completion.d/podman
```

---

### Podman bez roota

Aby bolo možné spúšťať kontajnery aj s bežným užívateľom (nie root), tak je potrebné danému užívatľovi priradiť dostatočne veľké rozsahy UID/GID.

V mnou skúšaných RHEL obrazoch to už pre predvoleného užívateľa `ec2-user` bolo takto nastavené.

```sh
# sudo usermod --add-subuids 100000-165536 "$USER"
# sudo usermod --add-subgids 100000-165536 "$USER"

# môžem si to overiť:
cat /etc/subuid
cat /etc/subgid
# výstup by mal byť niečo také:
# ec2-user:524288:65536
```

Skontrolujem či je potrebný reštart EC2 a ak je potrebný, tak VM reštartujem.

```sh
needs-restarting -r

sudo reboot
```

---

### LVM

Predvolená veľkosť OS disku pre RHEL je len 10GB, ja som ju mierne zvýšil na 20GB. Obrazy kontajnerov a aj iné užívateľské dáta chcem ukladať na úplne iný disk. Na úvod bude mať ten druhý disk tiež 20GB a bude pripojený ako LVM - teda bude ho možné jednoducho podľa potreby zväčšovať, dopĺňať ďalšími diskami a podobne.

Začnem tým, že si overím aké disky mám k dispozícii a druhé (nie OS) blokové zariadenie/disk `/dev/nvme1n1` označím ako "fyzickú oblasť" pripravenú pre LVM, tú potom začlením do "skupiny oblastí - **vgdata**" a túto skupinu použijem na vytvorenie "logickej oblasti - **lvdata**".

Takto vytvorenú logickú oblasť `/dev/vgdata/lvdata` nakoniec naformátujem na súborový systém `xfs`.

```sh
lsblk
sudo pvcreate /dev/nvme1n1
sudo vgcreate vgdata /dev/nvme1n1
sudo lvcreate -l 100%FREE -n lvdata vgdata
sudo mkfs.xfs -f /dev/vgdata/lvdata
```

Ďalej vytvorím adresár `/data`, ktorý bude slúžiť ako prípojný bod pre LVM a rovno do neho pripojím novovytvorenú logickú oblasť. Keďže to vytváram ako root, nesmiem zabudnúť zmeniť vlastníctvo pre vytvorený adresár.

```sh
sudo mkdir -p /data
sudo mount /dev/vgdata/lvdata /data
sudo chown -R ec2-user:ec2-user /data
```

Aby som zabezpečil trvalosť tohto nastavenia, musím upraviť záznamy v konfiguračnom súbore `fstab`. Najskôr potrebujem zistiť jednoznačný identifikátor disku/logickej oblasti.

```sh
sudo blkid /dev/vgdata/lvdata
```

A tento údaj potom zapíšem do konfigu `sudo vim /etc/fstab` aj s nastavením kde sa má pripojiť, aký je to typ súborového systému, a predvolené nastavenia pre dané pripojenie.

```sh
UUID=<id-z-blkid> /data xfs defaults,noatime,nofail 0 2
```

Nesmiem zabudnúť na kontrolu konfigu po uložení zmien! Akýkoľvek preklep alebo chyba môže spôsobiť, že potom EC2 nebude schopná naštartovať.

```sh
sudo mount -a
# musí prebehnúť bez chyby !
```

---

### Úložisko pre kontajnery

Ten druhý disk/LV je primárne určený na dočasné ukladanie obrazov kontajnerov.

Predvolene Podman ukladá obrazy v domovskom adresári užívateľa. Toto chcem zmeniť.

Najskôr vytvorím adresár pre obrazy na druhom disku v adresári `/data`. Ďalej vytvorím ešte adresár s konfigom pre Podmana v domovskom priečinku a rovno tam vložím konfiguráciu.

```sh
mkdir -p /data/containers/storage

mkdir -p ~/.config/containers
rm -f ~/.config/containers/storage.conf

cat <<EOF > ~/.config/containers/storage.conf
[storage]
driver = "overlay"
graphroot = "/data/containers/storage"
runroot = "/run/user/1000/containers"

[storage.options]
mount_program = "/usr/bin/fuse-overlayfs"
EOF
```

---

### SELinux a kontajnery

Keďže v RHEL je predvolene zapnutá prísna bezpečnostná politika, potrebujem zmeniť SELinux typ pre cestu kde chcem ukladať obrazy, aby tam mal Podman právo zapisovať aj čítať.

```sh
sudo semanage fcontext -a -t container_var_lib_t "/data/containers/storage(/.*)?"
sudo restorecon -Rv /data/containers/storage
```

Ďalej chcem užívateľovi čo bude spúšťať kontajnery povoliť aby procesy / služby ostali bežať aj po jeho odhlásení.

```sh
# povolenie pre trvalé (linger) relácie
sudo loginctl enable-linger ec2-user
```

A nakoniec ešte odstránim zvyšky po pôvodnom predvolenom nastavení, ak tam náhodou niečo ostalo.

```sh
rm -rf /tmp/storage-run-1000
podman system reset --force
```

---

### Test

Po úspešnom nasadení a nastavení môžem overiť konfiguráciu a zobraziť kde sa budú ukladať obrazy pre zostavenie kontajnerov.

```sh
podman info | grep graphRoot
```

A ako finálnu skúšku správnosti vytvorím klasický webový server v kontajneri a zmenu vykonanú v lokálnom súbore uvidím ako zmenu v obsahu ktorý sa zobrazuje na webovej stránke. 

```sh
mkdir -p /data/test
echo "OK" > /data/test/index.html

podman run -d --name web -p 8080:80 \
-v /data/test:/usr/share/nginx/html:Z \
docker.io/library/nginx:1.30.0-trixie

curl localhost:8080
```

---

### Upratovanie

Ak už kontajnery ďalej nepotrebujem môžem ich zastaviť a všetko komplet zmazať.

```sh
podman container stop web
podman system prune -a
```

---

### Odstránenie EC2

Tak ako som EC2 vytvoril v príkazovom riadku, tak môžem EC2 aj odstrániť.

Pred samotným odstránením inštancie nesmiem zabudnúť **zrušiť registráciu RHEL!**

```sh
sudo subscription-manager unregister

sudo subscription-manager clean
```

IAM politiku som nastavil okrem iného tak, že VM musí mať priradený špecifický tag, a ten musí mať špecifickú hodnotu, aby mohla byť EC2 odstránená. Mala by to byť poistka, aby som omylom ručne neodstránil nejaké EC2.

Pre mazanie potrebujem jednoznačný `id` danej inštancie. Všetky EC2 v projekte môžem zobraziť aj s ich `id` v súhrnej tabuľke.

```sh
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].[InstanceId, State.Name, Placement.AvailabilityZone, Tags[?Key=='Name'].Value | [0]]" \
  --output table
```

Následujúci príkaz danú inštanciu odstráni **bez potvrdzovania!** Je možné odstrániť aj viacero inštancii naraz.

```sh
aws ec2 terminate-instances --instance-ids id_inštancie
```

---

## Zdroj

- [Chapter 3. Deploying a RHEL image as an EC2 instance on AWS](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/deploying_and_managing_rhel_on_amazon_web_services/deploying-a-rhel-image-as-an-ec2-instance-on-aws)
- [Red Hat Enterprise Linux Release Dates](https://access.redhat.com/articles/red-hat-enterprise-linux-release-dates)
