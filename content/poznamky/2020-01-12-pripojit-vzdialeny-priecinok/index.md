---
title: "Pripojiť vzdialený priečinok"
date: 2020-01-12T18:25:46+01:00
draft: false
description: Ako pripojiť adresár na vzdialenom počítači do lokálneho súborového systému.
type: posts
tags:
  - Pripojiť adresár
  - Bash
  - Linux
categories:
  - Poznámky
toc: false
---

## Cieľ

Chcem nejaký adresár alebo aj celý súborový systém na vzdialenom počítači, serveri pripojiť k stroju, za ktorým sedím a pracovať s ním ďalej akoby to bol bežný miestny adresár.

## Riešenie

```sh
sudo sshfs -o allow_other uzivatel@server.sk:/ /mnt/lokalny-priecinok
```

Vzdialený koreňový adresár `/` a teda vlastne celý súborový systém pripojím do lokálneho adresáru `/mnt/lokalny-priecinok`. Môžem s ním ďalej pracovať ako s bežným adresárom.

Je potrebné zadať administrátorské heslo, takže do skriptov sa príliš nehodí.

Ak už ďalej nepotrebujem prístup ku vzdialenému súborovému systému, môžem ho „odmountovať“:

```sh
sudo umount /mnt/lokalny-priecinok
```

---

## Zdroj

- [die.net/man](https://linux.die.net/man/1/sshfs)
- [unix.stackexchange.com](https://unix.stackexchange.com/questions/59685/sshfs-mount-sudo-gets-permission-denied)
- [digitalocean.com](https://www.digitalocean.com/community/tutorials/how-to-use-sshfs-to-mount-remote-file-systems-over-ssh)
