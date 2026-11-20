---
title: "Ako správne nainštalovať Podman na Debian 13"
date: 2026-11-16T09:29:25+01:00
draft: false
description:
type: posts
tags:
  - Debian
  - Podman
  - Kontajnery
  - PostgreSQL
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem správne nainštalovať a bezpečne používať Podman v prostredí operačného systému Debian 13.

---

## Riešenie

Samotná inštalácia je v podstate vďaka kvalitnému balíčkovaciemu systému `apt` veľmi jednoduchá, no má svoje špecifiká 😉. Mierne rozsiahlejšie je až samotné nastavenie prevádzkového prostredia, od izolácie kontajnerov pod samostatným neprivilegovaným účtom, cez konfiguráciu siete a cgroups, až po čistú správu služieb pomocou natívnych `systemd` Quadletov.

### Inštalácia balíkov

Samotný `podman` si dotiahne kopec závislosti. Čo presne si prinesie, môžem pozrieť ešte pred inštaláciou.

```bash
apt install -s podman
```

Vo výpise v sekcii `Installing dependencies` sú uvedené všetky balíky, ktoré sa nainštalujú spolu s podmanom.

Nainštalujem základné balíky.

```bash
sudo apt update && sudo apt install \
  podman \
  passt \
  uidmap \
  dbus-user-session \
  systemd-container
```

A môžem tiež nainštalovať aj ďalšie balíky na zvýšenie konfortu práce s kontajnermi.

```bash
sudo apt install \
  buildah \
  skopeo \
  jq \
  yq \
  curl
```

---

### Privilegované porty

Ak je potrebné, aby kontajnery spúšťané bežným užívateľom (teda nie admin/root) mali prístup aj na privilegované porty (pod 1024), tak je potrebné vytvoriť konfiguračný súbor v `/etc/sysctl.d/`.

Toto je len _voliteľné nastavenie_. Ak nepotrebujem s kontajnermi pristupovať k privilegovaným portom, môžem túto úpravu preskočiť.

```bash
echo 'net.ipv4.ip_unprivileged_port_start=80' | \
  sudo tee /etc/sysctl.d/99-podman-rootless.conf

sudo sysctl --system
```

---

### Predvolené registre

Podman na rozdiel ak nástroja docker (cli) nedopĺňa celú cestu ku kontajneru v registroch automaticky. Ak chcem využiť túto možnosť, potrebujem vytvoriť konfiguračný súbor v `/etc/containers/registries.conf.d/`.

Toto je tiež len _voliteľné nastavenie_. Slúži na uľahčenie práce pri zadávaní príkazov ručne. Pri automatizácii alebo práci s kontajnermi v skriptoch je vyslovene odporúčané používať vždy komplet celú cestu ku obrazu kotajnera!

```bash
echo 'unqualified-search-registries = ["docker.io", "ghcr.io", "quay.io"]' | \
  sudo tee /etc/containers/registries.conf.d/01-search.conf
```

---

### Bežný užívateľ

S kontajnermi môžem pracovať aj ako bežný užívateľ. Nie je potrebné meniť identitu ani spúšťať podman so `sudo`. No bežný užívateľ je vhodný a postačujúci skôr len na jednoduché testovanie práce s kontajnermi.

Pred samotným stiahnutím obrazu kontajnera môžem majskôr skontrolovať metadata.

```bash
skopeo inspect --raw docker://docker.io/library/alpine:latest | jq .
```

Alebo len informácie o jednej konkrétnej architektúre.

```bash
skopeo inspect --raw docker://docker.io/library/alpine:latest | \
  jq '.manifests[] | select(.platform.architecture == "amd64")'
```

Alebo môžem požadovaný kontajenr rovno z daného obrazu vytvoriť a spustiť v interaktívnom režime.

```bash
podman container run --rm -it \
  docker://docker.io/library/alpine:3.24.4
```

---

### Dedikovaný užívateľ

Na plnohodnotnú prácu s kontajnermi je vhodné vytvoriť dedikovaného užívateľa - servisný účet, napríklad `svc-podman`. Štandardný príkaz [useradd](https://manpages.debian.org/trixie/passwd/useradd.8.en.html) (bez prepínača -r) mu na Debiane automaticky pridelí rozsah 65536 subUID/subGID a ponechá prihlasovanie heslom uzamknuté.

```bash
sudo useradd -m -s /bin/bash svc-podman
```

Aby kontajnery a užívateľské služby systemd bežali na pozadí aj po reštarte a bez aktívneho prihlásenia, je potrebné povoliť [lingering](https://manpages.debian.org/trixie/systemd/loginctl.1.en.html).

```bash
sudo loginctl enable-linger svc-podman
```

Administráciu v mene servisného účtu vykonávam výhradne cez [machinectl](https://manpages.debian.org/trixie/systemd-container/machinectl.1.en.html) (z balíka systemd-container), nie cez `su` alebo `sudo -u`!

Na rozdiel od `su`/`sudo -u` machinectl korektne inicializuje užívateľskú reláciu, D-Bus a premennú XDG_RUNTIME_DIR, ktoré vyžaduje systemctl --user aj Podman.

```bash
sudo machinectl shell svc-podman@
```

V relácii užívateľa `svc-podman` overím pridelené rozsahy UID/GID, parametre Podmanu a delegovanie radičov cgroups v2 (potrebné pre obmedzovanie CPU a RAM zdrojov pri vytváraní kontajnerov):

```
id
grep "^$(id -un):" /etc/subuid /etc/subgid

podman info --format 'Runtime: {{.Host.OCIRuntime.Name}}'
podman info --format 'Cgroups: {{.Host.CgroupsVersion}}'
podman info --format 'Rootless: {{.Host.Security.Rootless}}'
podman info --format 'Storage: {{.Store.GraphDriverName}}'
podman info --format 'Network: {{.Host.NetworkBackend}}'

cat /sys/fs/cgroup/user.slice/user-$(id -u).slice/user@$(id -u).service/cgroup.controllers

exit
```

Očakávaný výstup je:

- `uid=1001(svc-podman) gid=1001(svc-podman) groups=1001(svc-podman)` - novovytvorený užívateľ
- `/etc/subuid:svc-podman:165536:65536` - rezervovaný blok 65536 podriadených UID
- `/etc/subgid:svc-podman:165536:65536` - rezervovaný blok 65536 podriadených GID
- `Runtime: crun` - nízkoúrovňový OCI runtime napísaný v jazyku C (predvolený v Debiane). V porovnaní s Go variantom runc má výrazne nižšiu spotrebu pamäte a rýchlejší štart kontajnerov
- `Cgroups: v2` - je mechanizmus linuxového jadra, ktorý umožňuje hierarchicky obmedzovať, prideľovať a monitorovať systémové zdroje procesov a kontajnerov, najmä CPU, RAM, I/O a počet procesov
- `Rootless: true` - potvrdenie, že na prácu s kontajnermi nie sú potrebné práva superužívateľa (root)
- `Storage: overlay` - natívny jadrový ovládač súborového systému (OverlayFS) pre vrstvy obrazov. V Debiane 13 funguje v rootless režime priamo v jadre bez pomalšieho používateľského fuse-overlayfs
- `Network: netavark` - moderný sieťový backend Podmanu 5 pre správu virtuálnych bridge sietí a DNS (aardvark-dns) medzi kontajnermi (samostatné kontajnery bez vlastnej siete využívajú pasta)
- `cpu memory pids` - predvolene viem regulovať tieto druhy zdrojov pre vytvárané kontajnery

---

### Prvý kontajner

Chcem vytvoriť prvý jednoduchý kontajner, ktorý ostane bežať aj po odhlásení užívateľa a prežije aj reštart hostiteľského OS.

Spustím reláciu ako užívateľ `svc-podman`.

```bash
sudo machinectl shell svc-podman@
```

A potom v tejto relácii vytvorím dva potrebné adresáre:

- `~/.config/containers/systemd` - definície [Quadletov](https://www.redhat.com/en/blog/quadlet-podman)
- `~/volumes` - na trvalé ukladanie dát z kontajnerov/aplikácii

```bash
mkdir -p ~/.config/containers/systemd ~/volumes
```

A vytvorím konfigurák pre prvý kontajner.

```bash
cat << 'EOF' > ~/.config/containers/systemd/whoami.container
[Unit]
Description=Traefik Whoami Test Container
After=network-online.target

[Container]
Image=docker.io/traefik/whoami:v1.12.0
ContainerName=whoami
PublishPort=8080:80
AutoUpdate=registry
PidsLimit=64

[Service]
Restart=always
TimeoutStartSec=90
MemoryMax=64M

[Install]
WantedBy=default.target
EOF
```

Pred spustením ešte môžem overiť správnosť konfigurácie.

```bash
/usr/libexec/podman/quadlet -user -dryrun
```

Prípadne chyby vypíše, ak žiadne nenájde, zobrazí rovno výslednu konfiguráciu pre vytváranú systemd službu.

V prípade, že nehlási žiadne chyby a som s výsledkom spokojný, tak načítam konfiguráciu a spustím kontajner ako systemd službu (stále ako užívateľ `svc-podman`).

```bash
systemctl --user daemon-reload
systemctl --user start whoami.service
systemctl --user status whoami.service
```

Overím, že kontajner beží volaním na vystavený port 8080.

```bash
curl -s http://127.0.0.1:8080
```

A môžem tiež skontrolovať spotrebu zdrojov.

```bash
podman stats --no-stream whoami
```

A môžem ukončiť reláciu ako užívateľ `svc-podman`. Kontajner by mal bežať ďalej a po reštarte hostiteľského OS Debian by sa mal znova spustiť.

---

### Kontrola stavu

Na kontrolu bežiacich kontajnerov, prehliadanie logov alebo reštart konkrétneho kontajnera však nemusím použiť interaktívnu session servisného užívateľa, ale môžem príkazy zadávať priamo ako bežný užívateľ.

```bash
sudo machinectl shell svc-podman@ /usr/bin/podman ps

sudo machinectl shell svc-podman@ /usr/bin/podman stats --no-stream

sudo machinectl shell svc-podman@ /usr/bin/systemctl --user restart whoami.service

sudo machinectl shell svc-podman@ /usr/bin/systemctl --user status *.service

sudo machinectl shell svc-podman@ /usr/bin/journalctl --user -u whoami.service
```

---

### Postgres 19 v kontajneri

Chcem vytvoriť už mierne komplexnejšiu zostavu na vlastnej sieti a s trvalým úložiskom dát. Práve teraz bol vydaný PostgreSQL 19, tak si vytvorím Postgre 19 v kontajneri.

Otvorím reláciu s dedikovaným užívateľom.

```bash
sudo machinectl shell svc-podman@
```

Potrebujem adresár na konfiguračné súbory, ak ho ešte nemám.

```bash
mkdir -p ~/.config/containers/systemd
```

Vytvorím konfig pre sieť, aby teda aj kontajner s DB, ale aj neskôr aplikačné kontajnery mohli komunikovať na vyhradenej sieti.

```bash
cat << 'EOF' > ~/.config/containers/systemd/backend.network
[Network]
Internal=false
EOF
```

Vytvorím konfig pre trvalé uložisko, keďže to bude kontajner s DB systémom.

```bash
cat << 'EOF' > ~/.config/containers/systemd/pg19data.volume
[Volume]
EOF
```

A do tretice vytvorím konfig pre samotný DB kontajner s PostgreSQL 19

```bash
cat << 'EOF' > ~/.config/containers/systemd/pg19.container
[Unit]
Description=PostgreSQL 19 Container
After=network-online.target

[Container]
Image=docker.io/library/postgres:19-trixie
ContainerName=postgres
Network=backend.network
PublishPort=127.0.0.1:5432:5432
PidsLimit=256

Volume=pg19data.volume:/var/lib/postgresql/data:rw

Environment=POSTGRES_USER=postgres
Environment=POSTGRES_PASSWORD=postgres
Environment=POSTGRES_DB=appdb
Environment=PGDATA=/var/lib/postgresql/data/pgdata

HealthCmd=pg_isready -U postgres -d appdb || exit 1
HealthStartPeriod=30s
HealthInterval=15s
HealthTimeout=5s
HealthRetries=5
Notify=healthy

[Service]
Restart=always
RestartSec=10
TimeoutStartSec=120
TimeoutStopSec=30
MemoryMax=512M

[Install]
WantedBy=default.target
EOF
```

Môžem skontrolovať syntaktickú správnosť konfiguračných súborov.

```bash
/usr/libexec/podman/quadlet -user -dryrun
```

V prípade, že je všetko v poriadku, spustím PostgreSQL 19 kontajner.

```bash
systemctl --user daemon-reload
systemctl --user start pg19.service
systemctl --user status pg19.service
```

A ešte ako servisný užívateľ skontrolujem, či kontajner beží, kde je vytvorené trvalé úložisko, alebo akú IP dostal kontajner.

```bash
podman ps

podman volume inspect systemd-pg19data --format '{{.Mountpoint}}'

podman inspect postgres --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}: {{$v.IPAddress}}{{end}}'

podman exec -it postgres psql -U postgres -d appdb -c "SELECT version();"
```

V prípade, že potrebujem zmeniť nejaký parameter konfigurácie, tak upravím príslušný konfiguračný súbor, znovu načítam konfiguráciu a reštartujem zodpovedný kontajner.

```bash
systemctl --user daemon-reload

systemctl --user restart pg19.service
```

A môžem ukončiť reláciu ako užívateľ `svc-podman`.

---

### Pripojenie z hostiteľa

Keďže je Postgres kontajner spúšťaný pod servisným účtom, nesmiem zabúdať na to, že obaja užívatelia majú oddelený priestor.

Na pripojenie môžem použiť klienta dostupného priamo v hostiteľskom OS.

```bash
psql -h 127.0.0.1 -U postgres -d appdb
```

Alebo môžem použiť aj klienta v kontajneri, ktorý ale spustím ako bežný používateľ.

```bash
podman run --rm -it --network=host \
  -e PGHOST=127.0.0.1 \
  -e PGPORT=5432 \
  -e PGUSER=postgres \
  -e PGPASSWORD=postgres \
  -e PGDATABASE=appdb \
  docker.io/zwieratko/pgclient:18.7-alpine3.24.4-r166 psql
```

V tomto prípade je dôležitý parameter `--network=host`, ide o zámerné zdieľanie sieťového rozhrania hostiteľa, aby sa izolovaný klientsky kontajner dostal na port 127.0.0.1:5432 druhého servisného používateľa.

---

## Zdroj

- [podman](https://docs.podman.io/en/latest/)
- [Basic Setup and Use of Podman in a Rootless environment](https://github.com/podman-container-tools/podman/blob/main/docs/tutorials/rootless_tutorial.md)
- [herzenschein/herz-quadlet](https://codeberg.org/herzenschein/herz-quadlet)
