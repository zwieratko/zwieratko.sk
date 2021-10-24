---
title: "Responzívnosť vloženej mapy"
date: 2019-12-25T07:52:55+01:00
draft: false
description: Ako vytvoriť „responzívny iframe“ pre vkladanie Google mapy.
type: posts
tags:
  - CSS
  - Responzívny dizajn
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem aby vložený prvok Google mapy využil plnú šírku miesta kde je vložený. V „iframe“ viem síce nastaviť šírku a výšku, no žiaľ neviem aká bude šírka miesta na rôznych zobrazovacích zariadeniach (mobil, 4k monitor). Chcem teda vytvoriť responzívnu vloženú mapu.

## Riešenie

V štýloch si vytvorím dva nové prvky:

```css
.google-maps {
    position: relative;
    padding-bottom: 75%;
    height: 0;
    overflow: hidden;
}

.google-maps iframe{
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
}
```

Potom môžem vkladanú mapu, respektíve „iframe“ pomocou ktorého vkladám Google mapu vložiť do toho novovytvoreného elementu:

```html
<div class="google-maps">
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1987.262020121058!2d21.90540110850619!3d48.94259420731785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473eb574cbf83289%3A0xcc162ac3a49bfc2c!2zUG9kIMWgaW51!5e1!3m2!1ssk!2ssk!4v1577257748391!5m2!1ssk!2ssk" width="200" height="150" frameborder="0" style="border:0;" allowfullscreen=""></iframe>
</div>
```

## Ukážka

Mapa vložená len pomocou „iframu“:

{{< rawhtml >}}
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1987.262020121058!2d21.90540110850619!3d48.94259420731785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473eb574cbf83289%3A0xcc162ac3a49bfc2c!2zUG9kIMWgaW51!5e1!3m2!1ssk!2ssk!4v1577257748391!5m2!1ssk!2ssk" width="200" height="150" frameborder="0" style="border:0;" allowfullscreen="" crossorigin="anonymous"></iframe>
{{< /rawhtml >}}

Mapa vložená pomocou toho istého „iframu“ ale už aj pomocou novovytvoreného prvku `.google-maps`:

{{< rawhtml >}}
<div class="google-maps">
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1987.262020121058!2d21.90540110850619!3d48.94259420731785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473eb574cbf83289%3A0xcc162ac3a49bfc2c!2zUG9kIMWgaW51!5e1!3m2!1ssk!2ssk!4v1577257748391!5m2!1ssk!2ssk" width="200" height="150" frameborder="0" style="border:0;" allowfullscreen="" crossorigin="anonymous"></iframe>
</div>
{{< /rawhtml >}}

---

## Zdroj

- [benmarshall.me](https://benmarshall.me/responsive-iframes/)
- [kirstencassidy.com](https://www.kirstencassidy.com/creating-a-full-width-responsive-google-map/)
