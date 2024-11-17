---
title: "Premenné prostredia"
date: 2024-11-16T20:30:19+01:00
draft: false
description: Ako zobraziť ale aj správne nastaviť premenné prostredia v operačnom systéme.
type: posts
tags:
  - Linux
  - Bash
  - Windows
  - PowerShell
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem zobraziť ale aj správne nastaviť premenné prostredia či už pre jediného konkrétneho užívateľa, alebo pre všetkých užívateľov a to aj v prostredí operačných systémov z rodiny Linux a aj v prostredí MS Windows.

---

## Riešenie

### Linux

#### Zobrazenie premenných v Linuxe

Zobraziť všetky premenné prostredia aj s ich hodnotami:

```bash
printenv

# alebo
env
```

Alebo môžem zobraziť len hodnotu konkrétnej premennej:

```bash
printenv NAZOV_PREMENNEJ

# alebo aj
echo $NAZOV_PREMENNEJ

# konkrétne napríklad
printenv PATH

# premennú PATH, ale prehľadnejšie
printenv PATH | tr ":" "\n"
```

Zobraziť názvy všetkých vyexportovaných premenných prostredia:

```bash
compgen -e

# alebo aj s ich hodnotami
export -p
```

Zobraziť len názvy všetkých premenných v danej inštancii `shellu`:

```bash
compgen -v
```

Zobraziť všetky premenné, ktorých názov začína napríklad s písmenom `B`:

```bash
echo ${!B*}

# alebo aby sa zobrazili prehľadnejšie v stĺpci pod sebou
echo ${!B*} | tr " " "\n"
```

#### Nastavenie premenných v Linuxe

Nastaviť premennú prostredia môžem deklarovaním mena premennej a priradením hodnoty a následne môžem vykonať [export](https://stackoverflow.com/a/1158231) premennej ak je to potrebné, respektíve môžem priamo nastaviť export deklarovanej premennej:

```sh
x="42"
export x

export NAZOV_PREMENNEJ=hodnota_premennej
```

V prípade potreby môžem premennú prostredia vymazať:

```bash
unset NAZOV_PREMENNEJ
```

Týmto spôsobom nastavené premenné prostredia sú však dostupné len v práve bežiacom prostredí `shellu`, prípadne v ďalších z neho spustených inštanciách `shellu` (ak boli vyexportované). Čiže v ďalších pred tým spustených kópiách príkazového interpretera sú nedostupné a s ukončením behu `shellu` v ktorom boli deklarované/vyexportované sa stratia.

Ak potrebujem nastaviť premenné prostredia, ktoré budú dostupné trvalo a vo všetkých spustených kópiách, zapíšem ich do konfiguračného súboru `.bashrc` (Debian, Ubuntu, RHEL), `.zshrc` (pre používateľov zsh) prípadne `.profile` alebo `.bash_profile` (RHEL a spol.) v domovskom adresári užívateľa. Aby sa zmeny prejavili, a premenné boli dostupné musím sa odhlásiť a opätovne prihlásiť do systému, alebo znovu načítať daný konfiguračný súbor:

```bash
# v bashi built-in 'source'
source ~/.bashrc
```

Alebo v `shelloch` kompatibilných s POSIX, môžem na znovu načítanie konfiguračných súborov použiť `built-in` [bodka](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_19):

```sh
. ~/.bash_profile
```

Premenné prostredia, ktoré majú byť dostupné globálne, pre všetkých užívateľov zapíšem do konfiguračného súboru `/etc/profile`, ten je spúšťaný pri každom prihlasovaní sa do systému (cez konzolu, SSH, atď.).

Ešte správnejšie a bezpečnejšie je tieto premenné deklarovať / exportovať v špecializovaných súboroch s koncovkou `.sh` v adresári `/etc/profile.d`.

```sh
sudo sh -c 'echo export NAZOV_PREMENNEJ="HODNOTA_PREMENNEJ" \
>> /etc/profile.d/pre_vsetkych_uzivatelov.sh'
```

Na zápis do konfiguračných súborov v adresári `/etc` potrebujem administrátorské oprávnenie.

Premenné prostredia môžem odstrániť vymazaním záznamu z konfiguračného súboru.

Premenná prostredia môže byt deklarovaná ako nemenná a teda hodnotu takto deklarovanej premennej nemožno meniť a premennú nemožno ani odstrániť pomocou `unset`.
V súlade s normou POSIX je možné použiť len príkaz [readonly](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_24) - ma predvolene globálny dosah, aj keď bude použitý vo vnútri funkcie. Bash ešte pridáva ďalší príkaz [declare](https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html#index-declare).

```bash
readonly pi="3.1415927"

# alebo postupne
TMOUT=900
readonly TMOUT
export TMOUT

# alebo v bashi built-in 'declare' s voľbou '-r'
declare -r X="42"

# a s globálnym dosahom, voľba '-g', ak je použité vo vnútri funkcie
declare -rg X="42"
```

---

### Windows

#### Zobrazenie premenných vo Windows

Zobraziť všetky premenné prostredia aj s ich hodnotami:

```powershell
ls env:

# alebo
Get-ChildItem Env:

# alebo to isté ešte raz, ale kratšie
gci env:
```

Alebo len konkrétnu premennú:

```powershell
$env:path

# premennú PATH, ale prehľadnejšie
$env:path -split ";"
```

Alebo zobraziť všetky premenné prostredia podľa neúplného názvu, môžem použiť zástupný znak hviezdička (`wild card`):

```powershell
get-item -path env:\user*
```

Zobraziť všetky premenné (nie len premenné prostredia) aj s ich hodnotami

```powershell
ls variable:
```

#### Nastavenie premenných vo Windows

Nastaviť premennú prostredia môžem aj ako akúkoľvek inú premennú, priradením hodnoty:

```powershell
$env:nazov_premennej = 'hodnota premennej'

# napríklad pridanie novej cesty
$env:PATH = 'C:\bin;' + %PATH%
```

Keďže premenná prostredia nesmie byť bez hodnoty, zmazať ju môžem priradením prázdneho reťazca:

```powershell
$env:nazov_premennej = ''
```

Manipulovať s premennými prostredia môžem tiež pomocou príkazov na manipuláciu so súbormi:

```powershell
new-item -path env:\nazov_premennej -value 'hodnota premennej'
copy-item -path env:\nazov_premennej -destination env:nazov_inej -passthru
set-item -path env:\nazov_premennej -value 'ina hodnota'
get-item -path env:\nazov_premennej
remove-item -path env:\nazov_premennej -verbose
```

Takto nastavené premenné prostredia sú dostupné len v prostredí tej kópie PowerShellu v ktorej boli vytvorené a len dočasne do jej ukončenia.

Ak chcem nastaviť premenné prostredia trvalo a so širšou platnosťou aj pre ďalšie kópie PowerShellu (nie len pre práve bežiacu), použijem metódy z triedy `Environment Class`:

```powershell
[Environment]::SetEnvironmentVariable('nazov_premennej', 'hodnota', 'pôsobnosť')
```

Pôsobnosť (`scope`) môže byť:

- `Machine` – najširšia pôsobnosť, platí pre celý spustený operačný systém, premenné sú dostupné pre všetky spustené procesy, na zadanie je potrebné mať administrátorské oprávnenie
- `User` – platí pre všetky procesy spustené užívateľom
- `Process` – kombinácia oboch

Premenné s tým istým menom, ale s užšou pôsobnosťou majú vyššiu prioritu. Ak nezadám pôsobnosť, premenná prostredia bude platná len v práve bežiacom procese a len do jeho ukončenia.

Pomocou ďalšej metódy triedy môžem zobraziť hodnotu premennej prostredia:

```powershell
[Environment]::GetEnvironmentVariable('nazov_premennej')

# napr. PATH v PowerShell nainštalovanom v Debiane
[Environment]::GetEnvironmentVariable('PATH') -split ":"
```

Premennú prostredia môžem tiež vymazať pomocou metódy triedy, priradením prázdneho reťazca:

```powershell
[Environment]::SetEnvironmentVariable('nazov_premennej', '', 'pôsobnosť')
```

---

## Zdroj

- [Linux - Bash Variables](https://www.gnu.org/software/bash/manual/html_node/Bash-Variables.html)
- [Linux - Environment Variables](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html)
- [Linux - Usage of Compgen Command in Bash](https://www.baeldung.com/linux/compgen-command-usage)
- [Windows - about_Variables](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_variables?view=powershell-5.1)
- [Windows - about_Environment_Variables](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables?view=powershell-5.1)
- [Windows - Environment Class](https://learn.microsoft.com/en-us/dotnet/api/system.environment?view=net-7.0)
