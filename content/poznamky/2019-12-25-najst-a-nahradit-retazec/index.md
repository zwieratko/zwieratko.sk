---
title: "Nájsť a nahradiť reťazec"
date: 2019-12-25T15:38:24+01:00
draft: false
description: Ako nájsť a nahradiť reťazec vo všetkých súboroch daného typu v adresári.
type: posts
tags:
  - Reťazce
  - Bash
  - Linux
categories:
  - Poznámky
toc: false
---

## Cieľ

Nájsť a nahradiť reťazec vo všetkých súboroch daného typu v adresári.

## Riešenie

```sh
find /home/rado/web/test01/content/posts -name \*.md -exec sed -i "s/toc:\sfalse/toc: true/g" {} \;
```

V adresári `posts` vyhľadá súbory s príponou `.md`, v nich vyhľadá reťazec `toc: false` a nahradí ho reťazcom `toc: true`.

---

Ešte jeden príklad:

```sh
find /home/rado/web/test01/content/archiv -name \*.md -exec sed -i "s/showdate\s=\strue/showdate = false/g" {} \;
```

V adresári `archiv` vyhľadá súbory s príponou `.md`, v nich vyhľadá reťazec `showdate = true` a nahradí ho reťazcom `showdate = false`

---

## Zdroj

- [askubuntu.com](https://askubuntu.com/questions/84007/find-and-replace-text-within-multiple-files)
- [gnu.org](https://www.gnu.org/software/sed/manual/html_node/The-_0022s_0022-Command.html)
