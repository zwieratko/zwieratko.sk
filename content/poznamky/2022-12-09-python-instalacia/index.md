---
title: Python – inštalácia
date: 2022-12-09T09:10:59+01:00
draft: false
description: Ako inštalovať jazyk Python na systémoch Debian / Ubuntu a MS Windows.
type: posts
tags:
  - Python
  - Linux
  - Debian
  - Ubuntu
  - Windows
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem nainštalovať najnovšiu, respektíve viacero verzii programovacieho jazyka [Python](https://www.python.org/) v prostredí operačných systémov Debian / Ubuntu a MS Windows.

## Riešenie

### Ubuntu z úložiska PPA

Jednoduchšia metóda, ale musím dôverovať tvorcom repozitára. Potrebujem pridať PPA úložisko [“deadsnakes” team – New Python Version](https://launchpad.net/~deadsnakes/+archive/ubuntu/ppa) do `sources.list` a požadovanú verziu jazyka Python nainštalovať z neho.

Keď ešte toto úložisko nemám medzi zdrojmi, tak najskôr si stiahnem a uložím podpisový kľúč k repozitáru.

```bash
sudo gpg \
--homedir /tmp \
--no-default-keyring \
--keyring /usr/share/keyrings/ppa-deadsnakes.gpg \
--keyserver keyserver.ubuntu.com \
--recv-keys F23C5A6CF475977595C89F51BA6932366A755776
```

Následne môžem pridať PPA k zdrojom.

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ppa-deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu jammy main" | sudo tee /etc/apt/sources.list.d/ppa-deadsnakes.list > /dev/null

echo "deb-src [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ppa-deadsnakes.gpg] https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu jammy main" | sudo tee -a /etc/apt/sources.list.d/ppa-deadsnakes.list > /dev/null
```

V prípade inštalácie na systém s Ubuntu, správne upravím jedno slovný názov distribúcie (`jammy`), dostupné sú len LTS verzie a v prípade inštalácie na Debian vychádzam z [predpokladu](https://askubuntu.com/a/445496):

- Debian 12 (testing / bookworm) -> Ubuntu 22.04 -> jammy
- Debian 11 (bullseye) -> Ubuntu 20.04 -> focal
- Debian 10 (buster) -> Ubuntu 18.04 -> bionic

Po pridaní repozitárov môžem obnoviť údaje o dostupných softvérových balíčkoch a nainštalovať dostupnú, požadovanú verziu Pythonu.

```bash
sudo apt update
sudo apt install python3.11
```

---

### Debian / Ubuntu zo zdrojových súborov

Aktualizujem údaje o dostupných balíčkoch a nainštalujem ďalšie potrebné balíky na zostavenie Pythonu zo zdrojových súborov.

```bash
sudo apt update
sudo apt install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev pkg-config
```

V domovskom adresári si vytvorím pod adresár na zdrojové súbory (ak už nemám nejaké iné miesto na to určené).

```bash
mkdir sources
cd sources
```

Stiahnem a rozbalím zdrojové súbory Pythonu.

```bash
wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tgz
tar -xvf *
```

Prepnem sa do adresára so zdrojákmi a spustím `configure` na overenie dostupnosti všetkých potrebných balíkov na kompiláciu a vykonanie rôznych iných testov.

```bash
cd Python-3.11.1
sudo ./configure --enable-optimizations
```

Spustím samotné zostavenie. Za prepínačom `-j` zadám počet dostupných jadier procesora.

```bash
sudo make -j 1
```

Na prenajatej VPS s jedným jadrom a 1 GB pamäte trvalo zostavenie približne 13 minút.

Nakoniec spustím inštaláciu.

```bash
sudo make altinstall
```

 Toto trvalo už len minútku. Na záver overím úspešnosť inštalácie kontrolou nainštalovanej verzie.

```bash
python3.11 -V

# alebo
python3.11 --version
```

Ak mám nainštalovaných viacero verzii jazyka Python môžem ich zobraziť.

```bash
find /usr -type f -regex "\/usr\(\/local\)?\/bin\/python[2-3]\.[0-9]+"
```

---

### Windows

Najskôr môžem vyhľadať všetky dostupné verzie jazyka Python.

```powershell
winget search python.python
```

Vybratú verziu môžem nainštalovať.

```powershell
winget install python.python.3.11
```

Ak mám terminál spustený ako bežný užívateľ, inštalátor sa ma opýta, či som si istý, že chcem povoliť vykonávanie zmien v počítači programy `Python 3.11`. Po odsúhlasení prebehne vcelku rýchla inštalácia. 

```
Found Python 3.11 [Python.Python.3.11] Version 3.11.1
This application is licensed to you by its owner.
Microsoft is not responsible for, nor does it grant any licenses to, third-party packages.
Downloading https://www.python.org/ftp/python/3.11.1/python-3.11.1-amd64.exe
  ██████████████████████████████  24.0 MB / 24.0 MB
Successfully verified installer hash
Starting package install...
Successfully installed
```

Úspešnosť inštalácie overím kontrolou nainštalovanej verzie.

```powershell
python -V

# alebo
python --version

# alebo
py -V

# alebo
py --version
```

Ak mám v MS Windows nainštalovaných viacero verzii jazyka Python môžem zobraziť zoznam všetkých (pri predvolenej verzii bude znak hviezdička).

```powershell
py --list

# alebo pomocou winget (bez indikácie predvolenej verzie)
winget list --name python
```

---

## Zdroj

- [How To Install Python 3.10 On Debian 11](https://cloudcone.com/docs/article/how-to-install-python-3-10-on-debian-11/)
- [Using the PPA](https://unix.stackexchange.com/a/188819)
