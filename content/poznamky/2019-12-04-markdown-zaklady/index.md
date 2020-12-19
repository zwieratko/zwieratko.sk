---
title: "Markdown – základy"
description: "Stručný prehľad základných elementov značkovacieho jazyka Markdown."
date: 2019-12-04T16:29:21+01:00
draft: false
type: posts
toc: true
tags:
  - Markdown
---

Stručný prehľad základných elementov značkovacieho jazyka Markdown.

## Kurzíva

```
*Markdown*
_Markdown_
*Mark*down
```
*Markdown*  
_Markdown_  
*Mark*down

---

## Tučné

```
**Markdown**  
__Markdown__  
Mark**down**
```

**Markdown**  
__Markdown__  
Mark**down**

---

## Preškrtnuté

```
~~Markdown~~
Mark~~down~~
```

~~Markdown~~  
Mark~~down~~

---

## Mix

```
*Mark**down***  
***Mark***down  
~~***Markdown***~~  
**Mark***down*  
**Ma**~~**rk**do~~wn
```

*Mark**down***  
***Mark***down  
~~***Markdown***~~  
**Mark***down*  
**Ma**~~**rk**do~~wn

---

## Nadpisy

```
# Markdown
## Markdown
### Markdown
#### Markdown
##### Markdown
###### Markdown
```

{{<rawhtml>}}
<h1>Markdown</h1>
<h2>Markdown</h2>
<h3>Markdown</h3>
<h4>Markdown</h4>
<h5>Markdown</h5>
<h6>Markdown</h6>
{{</rawhtml>}}

---

## Odkazy

```
[zwerimex](https://zwerimex.com)
[zwerimex](https://zwerimex.com "zwieratkove veľké dáta")
zwieratko@zwieratko.sk
```

[zwerimex](https://zwerimex.com)  
[zwerimex](https://zwerimex.com "zwieratkove veľké dáta")  
zwieratko@zwieratko.sk

---

## Obrázky

```
![Čierny obdĺžnik](https://dummyimage.com/320x240/000/fff.jpg)

![Random Image](https://picsum.photos/300/200 "Náhodný obrázok")
```

![Čierny obdĺžnik](https://dummyimage.com/320x240/000/fff.jpg)

![Random Image](https://picsum.photos/300/200 "Náhodný obrázok")

---

## Citácia

```
>Markdown is a simple way to format text that looks great on any device. It doesn’t do anything fancy like change the font size, color, or type — just the essentials, using keyboard symbols you already know. [^1]
```

>Markdown is a simple way to format text that looks great on any device. It doesn’t do anything fancy like change the font size, color, or type — just the essentials, using keyboard symbols you already know. [^1]

---

## Zoznamy

```
- Markdown
- Markdown
  - iný Markdown
- Markdown
```

- Markdown
- Markdown
  - iný Markdown
- Markdown

```
3. Markdown
1. Markdown
9. Markdown
10. Markdown
1. Markdown
```

3. Markdown
1. Markdown
9. Markdown
10. Markdown
1. Markdown

## Čiary

```
prvá čiara ↘

---

druhá čiara ↘

***
```

prvá čiara ↘

---

druhá čiara ↘

***

## Kód

```
`Markdown` v riadku.
```

`Markdown` v riadku.

    ```
    Markdown v 
    bloku
    ```

```
Markdown v
bloku
```

[^1]: https://commonmark.org/help/

---

## Zdroj

- [commonmark.org](https://commonmark.org/help/)
- [markdownguide.org](https://www.markdownguide.org/)
- [daringfireball.net](https://daringfireball.net/projects/markdown/)
