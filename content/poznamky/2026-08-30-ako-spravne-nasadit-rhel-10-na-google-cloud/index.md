---
title: "Ako správne nasadiť RHEL 10 na Google Cloude"
date: 2026-08-30T11:26:12+02:00
draft: false
description: "Ako v cloudovom prostredí GCP vytvoriť VM bez verejnej IP s aktuálnym oficiálnym OS RHEL 10 a s prístupom na internet."
type: posts
tags:
  - GCP
  - Linux
  - RHEL
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem v prostredí Google Cloudu vytvoriť dočasnú VM inštanciu:
- VM bez verejnej IP
- s oficiálnym a čo najaktuálnejším vydaním RHEL 10
- OS na LVM disku
- aby bol z VM prístup do Cloud Storage / Buckets
- aby bol z VM prístup na internet
- operačný systém chcem riadne zaregistrovať

Chcem to riešiť priamo v termináli a nie pomocou infraštruktúrnych nástrojov ako je napríklad Terraform, a tiež bez využitia CI/CD pipeline. Celý proces chcem riadiť ručne. A toto má byť ucelený prehľad krokov a postupov ako to dosiahnuť.

---

## Upozornenie

Toto nie je oficiálny návod ani postup!

Výsledkom tohto postupu bude vytvorenie zdrojov v prostredí Google Cloud, ktoré budú spoplatnené!

Na záver je vyslovene odporúčané všetky vytvorené, nepotrebné zdroje odstrániť.

---

## Príprava

Postupy súvisiace s objednaním a nastavením [predplatného](https://console.redhat.com/subscriptions/inventory) pre legálne používanie operačného systému Red Hat Enterprise Linux, ako aj so sledovaním spotreby/použitia [licencii](https://console.redhat.com/subscriptions/usage/rhel), alebo s nastavením [prístupu](https://access.redhat.com/management/cloud) ku oficiálnym obrazom RHEL pre dané cloudové prostredie je nad rámec tejto poznámky.

---

## Riešenie

Celý postup je možné vykonávať buď z prostredia GCP Cloud Shell vo webovej kozole, alebo aj lokálne pomocou [gcloud](https://docs.cloud.google.com/sdk/docs/install-sdk) z vlastného počítača.

Podmienkou je riadne nainštalovaný, a autorizovaný [Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/initialize).

Celý postup vykonáme pomocou jeho kľúcovej časťi, príkazu [gcloud](https://docs.cloud.google.com/sdk/docs/cheatsheet).

---

### Overenie identity

Najskôr si môžeme overiť autorizáciu - teda pod akým účtom budeme zadávať následujúce príkazy.

```sh
gcloud auth list
```

Odpoveď by mal byť zoznam autorizovaných Google účtov - emailov, a jeden z nich aktívny, označený hviečkou. A teda všetky následujúce príkazy budeme zadávať ako užívateľ prihlásený s touto emailovou adresou. 

---

### NumPy

Ak sa budeme ku vytváranej VM bez verejnej IP adresy pripájať cez IAP tunel, tak je vhodné podľa [odporúčania](https://cloud.google.com/iap/docs/using-tcp-forwarding#increasing_the_tcp_upload_bandwidth) doinštalovať ešte Python knižnicu [NumPy](https://numpy.org/), na zvýšenie pripeustnosti tunela.

Najskôr si do dočasnej premennej uložím cestu ku gcloud Pythonu.

```sh
GCLOUD_PYTHON=$(gcloud info --format="value(basic.python_location)")
```

Môžem si overiť, či už balík nie je nainštalovaný.

```sh
$GCLOUD_PYTHON -c "import numpy; print(numpy.__version__)"
```

Ak už nainštalovaný je, odpoveďou bude verzia balíka NumPy, ak ešte nie je nainštalovaný, odpoveď bude chybová hláška:  
`ModuleNotFoundError: No module named 'numpy'`

Potom balík doinšatlujem či už s `pip`.

```sh
$GCLOUD_PYTHON -m pip install numpy
```

Alebo s modernejším a rýchlejším `uv`.

```sh
uv pip install numpy --python $GCLOUD_PYTHON
```

Prípadne ak už mám NumPy nainštalovaná a chcem ho aktualizovať.

```sh
uv pip install --upgrade numpy --python $GCLOUD_PYTHON
```

---

### Nastavenie siete v cloude

V predvolenom nastavení je prístup z vytvorenej VM (bez verejnej IP) veľmi obmedzený, nie je možné pristupovať dokonca ani ku interným Google službám, a teda napríklad ani ku cloudovému úložisku.

Nastavenie si môžem najskôr overiť.

```sh
gcloud compute networks subnets describe default \
  --region=europe-west4 \
  --project=zw-gcp-test-01 \
  --format="yaml(name, region, ipCidrRange, privateIpGoogleAccess)"
```

Vo výstupe vidím názov subnetu, región, rozsah interných IP pre daný región a hlavne hodnotu parametra: [privateIpGoogleAccess: false](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/subnets/update#--[no-]enable-private-ip-google-access) - a toto potrebujeme zmeniť na "true", čiže povoliť prístup z daného subnetu ku Google cloudovým API endpointom.

```sh
gcloud compute networks subnets update default \
  --region=europe-west4 \
  --enable-private-ip-google-access \
  --project=zw-gcp-test-01
```

Toto nastavenie môžem ponechať trvalo povolené, pokiaľ nepotrebujem z nejakých dôvodov zakázať prístup z daného subnetu `default` k interným Google službám.

A tak isto z takejto VM bez verejnej IP nie je možné pristupovať ani na voľný internet. Jednou z možností ako to VM v danom subnete umožniť je vytvoriť cloudový router, ktorý umožňuje dynamicky meniť smerovanie vo VPC sieťach.

Najskôr si teda vytvorím [cloudový router](https://docs.cloud.google.com/sdk/gcloud/reference/compute/routers/create) v danej VPC sieti/regióne.

```sh
gcloud compute routers create nat-router-euw4 \
  --network=default \
  --region=europe-west4 \
  --project=zw-gcp-test-01
```

A potom vo vytvorenom routri [pridám NAT](https://docs.cloud.google.com/sdk/gcloud/reference/compute/routers/nats/create) pre všetky subnety v danom regióne.

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

### Vytvorenie VM

V tomto okamihu by som už mal mať všetko potrebné pripravené a nastavené, tak môžem pristúpiť ku vytvoreniu VM.

```sh
gcloud compute instances create test-vm-01 \
  --project=zw-gcp-test-01 \
  --zone=europe-west4-a \
  --machine-type=e2-medium \
  --image-family=rhel-10-lvm-byos \
  --image-project=rhel-byos-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-balanced \
  --no-address \
  --scopes=cloud-platform
```

Vytváram VM:
- v konkrétnom projekte `zw-gcp-test-01`
- v jednej z 3 dostupných zón regiónu `europe-west-4` (Holandsko)
- s veľkosťou VM `e2-medium` (2vCPU / 4GB RAM)
- s OS RHEL 10 z projektu `rhel-byos-cloud`
- s jediným 50 GB diskom typu [pd-balanced](https://docs.cloud.google.com/compute/docs/disks/performance)
- bez verejnej IP
- s prístupom ku cloudovému úložisku (bucketu)

---

### Prístup ku VM

Keďže vytvorená VM nemá verejnú IP, tak nie je možné pripojiť sa pomocou bežného `ssh` ale budeme musieť použiť [IAP tunel](https://docs.cloud.google.com/sdk/gcloud/reference/compute/ssh#--tunnel-through-iap).

```sh
gcloud compute ssh test-vm-01 \
  --project=zw-gcp-test-01 \
  --zone=europe-west4-a \
  --tunnel-through-iap
```

---

### Registrácia OS

Keďže je to oficiálne licencovaný produkt a podmienkou plnohodnotného využívania repozitárov je registrácia, tak OS RHEL zaregistrujem.

Na registráciu môžem použiť osobné prihlasovacie údaje ku Red Hat účtu, alebo aktivačný kľúč. Ak chcem použiť kľúč, potrebujem okrem názvu kľúča ešte id organizácie a to môžem nájsť v časti [Activation Keys](https://console.redhat.com/insights/connector/activation-keys) v Red Hat webovej konzole.

```sh
sudo subscription-manager register --org xxx --activationkey "activation-key-default"

sudo subscription-manager refresh

sudo subscription-manager status

sudo subscription-manager identity
```

Po úspešnej registrácii môžem na plno využívať originálny RHEL 10 aj s oficiálnymi repozitármi.

Celkové množstvo súčastne používaných licencii nesmie prekročiť maximálne povolené množstvo pre daný typ predplatného - v tomto konkrétnom prípade je to najviac 16 licencii.

---

### Odstránenie prostriedkov

Ak už vytvorené prostriedky ďalej nepotrebujem, tak je vhodné ich odstrániť.

Pred samotným odstránením inštancie nesmiem zabudnúť **zrušiť registráciu RHEL!**

```sh
sudo subscription-manager unregister

sudo subscription-manager clean
```

Potom odstránim samotnú VM.

```sh
gcloud compute instances delete test-vm-01 \
  --zone=europe-west4-a \
  --project=zw-gcp-test-01 \
  --quiet
```

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

A môžem odstrániť aj vytvorené SSH kľúče.

```sh
gcloud compute project-info remove-metadata \
  --keys=ssh-keys \
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

- [Google Cloud CLI - gcloud Reference](https://docs.cloud.google.com/sdk/gcloud/reference)
- [Chapter 3. Deploying a RHEL image as a Google Compute Engine instance on Google Cloud](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/deploying_and_managing_rhel_on_google_cloud/deploying-a-rhel-image-as-a-google-compute-engine-instance-on-gcp)
