---
title: "EFI/UEFI verzus BIOS"
date: 2020-01-18T12:54:36+01:00
draft: false
description: Ako overiť z čoho bol zavedený operačný systém.
type: posts
tags:
  - Bash
  - Linux
categories:
  - Poznámky
toc: false
---

## Cieľ

Chcem zistiť z čoho bol zavedený operačný systém. Či bol zavedený z novšieho rozhrania EFI/UEFI, alebo zo starého BIOS.

## Riešenie

```sh
[ -d /sys/firmware/efi ] && echo UEFI || echo BIOS
```

## Poznámka

To len tak mimochodom, [bootovať](http://slovnik.juls.savba.sk/?w=bootova%C5%A5&s=exact&c=C4d5&cs=&d=kssj4&d=psp&d=sssj&d=orter&d=scs&d=sss&d=peciar&d=hssjV&d=bernolak&d=noundb&d=orient&d=locutio&d=obce&d=priezviska&d=un&d=pskcs&d=psken#) je správne po slovensky.

---

## Zdroj

- [askubuntu.com](https://askubuntu.com/questions/162564/how-can-i-tell-if-my-system-was-booted-as-efi-uefi-or-bios)
- [commandlinefu.com](https://www.commandlinefu.com/commands/view/24861/boooted-as-efiuefi-or-bios)
