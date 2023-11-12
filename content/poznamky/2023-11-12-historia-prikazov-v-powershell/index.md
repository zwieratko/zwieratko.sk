---
title: "História príkazov v PowerShell"
date: 2023-11-12T12:29:12+01:00
author:
  short: zw
draft: false
description: Ako vyhľadať nejaký už skôr zadaný príkaz v prostredí PowerShell v operačnom systéme MS Windows 10 / 11.
type: posts
tags:
  - PowerShell
  - Windows
categories:
  - Poznámky
toc: false
---

## Cieľ

Chcem vyhľadať nejaký už skôr zadaný príkaz v prostredí **PowerShell** v operačnom systéme MS Windows 10 / 11.

## Riešenie

### Vyhľadávanie v histórii

Ak po napísaní príkazu (alebo aj jeho časti) v príkazovom riadku stlačím klávesu `F8`, bude doplnený posledný nájdený výskyt príkazu v histórii aj so všetkými zadanými parametrami. Ďalším stláčaním `F8` sa posúvam na skorší výskyt v minulosti, opačným smerom (späť k novším) sa presúvam pomocou `Shift+F8`.

Interaktívne môžem v histórii zadaných príkazov vyhľadávať po stlačení `Ctrl+R`. Postupne ako vpisujem príkaz, tak sa dopĺňa najväčšia zhoda z histórie. Ďalším stláčaním `Ctrl+R` sa posúvam hlbšie do minulosti, opačným smerom, späť k prítomnosti sa posúvam stláčaním `Ctrl+S`.

### Zoznam histórie od posledného spustenia PowerShell

```powershell
Get-History
```

Zadaním príkazu `Get-History` alebo zadaním jeho aliasu `history` sa vypíše očíslovaný zoznam zadaných príkazov od posledného spustenia danej kópie PowerShellu.

### Zoznam celkovo dostupnej histórie

Podobne ako v Linuxe sa pomocou stláčania šípok na klávesnici pohybujem v zozname histórie zadaných príkazov, `šípka hore` ma v zozname posúva ďalej do minulosti, naopak `šípka dole` ma posúva späť, bližšie k súčasnosti. Čiže ak na novom prázdnom príkazovom riadku stlačím klávesu `šípka hore` zobrazí sa posledný zadaný príkaz.

Okrem toho môžem zobraziť históriu zadávaných príkazov zobrazením obsahu súboru do ktorého sa táto história ukladá.

```powershell
# Cela ulozena historia
Get-Content (Get-PSReadlineOption).HistorySavePath
```

```powershell
# Prvych 15 ulozenych prikazov
Get-Content (Get-PSReadlineOption).HistorySavePath -TotalCount 15

# Alebo to iste inak
Get-Content (Get-PSReadlineOption).HistorySavePath -Head 15

# Alebo este inak prvych 15 prikazov z ulozenej historie
Get-Content (Get-PSReadlineOption).HistorySavePath | Select-Object -First 15
```

Podobne môžem zobraziť posledných 15 zadaných príkazov.

```powershell
Get-Content (Get-PSReadlineOption).HistorySavePath -Tail 15

# Alebo to iste inak zapisane
Get-Content (Get-PSReadlineOption).HistorySavePath | Select-Object -Last 15
```

Pomocou rúry môžem v uloženej histórii vyhľadávať reťazce.

```powershell
Get-Content (Get-PSReadlineOption).HistorySavePath | Select-String 'get-psread'

# Pre specialne znaky vlozim spatne lomitko
Get-Content (Get-PSReadlineOption).HistorySavePath | Select-String '\$' | Select-Object -Last 30
```

Môžem zobraziť nastavenia, premenné týkajúce sa histórie zadávaných príkazov.

```powershell
Get-PSReadLineOption | Select-Object -Property '*history*'
```
Ak chcem napríklad zmeniť maximálne množstvo príkazov ktoré sa majú uchovať v histórii, zmením hodnotu systémovej premennej `MaximumHistoryCount`, ak chcem aby sa zmenená hodnota uchovala trvalo, zapíšem nastavenie premennej do jedného z [profilov](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7.3).

```powershell
# PowerShell 5.1 napriklad do $HOME\Documents\WindowsPowerShell\Profile.ps1
# PowerShell 7.3 napriklad do $HOME\Documents\PowerShell\Profile.ps1
# Maximalna povolena hodnota je 32767
$MaximumHistoryCount = 32767
```

---

## Zdroj

- [about_History](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_history?view=powershell-7.3)
- [Command History](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline?view=powershell-7.3#command-history)
