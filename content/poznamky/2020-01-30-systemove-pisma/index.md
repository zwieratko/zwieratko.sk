---
title: "Systémové písma"
date: 2020-01-30T21:31:04+01:00
draft: false
description: Ako vybrať pre webovú stránku fonty podľa predvolených systémových fontov.
type: posts
tags:
  - CSS
  - Typografia
categories:
  - Poznámky
toc: false
---

## Cieľ

Chcem zabezpečiť, aby prehliadač nemusel pri zobrazovaní stránky sťahovať žiadne externé, dodatočné fonty a, aby stránka vyzerala v každom prehliadači a v každom operačnom systéme, čo možno najprirodzenejšie.

## Riešenie

V CSS štýloch si nastavím `font-family` s prihliadnutím na predvolené typy fontov v jednotlivých operačných systémoch.

Z rôznych riešení, o ktorých som čítal, táto kombinácia sa mne pozdáva najviac:

```css
/* System Fonts as used by Medium and WordPress */
body {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
}
```

---

## Zdroj

- [css-tricks.com](https://css-tricks.com/snippets/css/system-font-stack/)
- [granneman.com 1](https://www.granneman.com/webdev/coding/css/fonts-and-formatting/web-browser-font-defaults)
- [granneman.com 2](https://www.granneman.com/webdev/coding/css/fonts-and-formatting/default-fonts)
