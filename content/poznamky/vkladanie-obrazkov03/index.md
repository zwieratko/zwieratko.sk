---
title: "TEST03 Test"
date: 2018-12-26T11:29:25+01:00
draft: true
description: Popis vo front matter príspevku
type: posts
tags:
  - demo
toc: true
authors: 
  - Rado van Zwieratko #toto nefunguje v tejto téme - Hermit
images: 
  - /poznamky/vkladanie-obrazkov03/lauren.JPG
---

## Prvá kapitola (`##`)

{{< rawhtml >}}
  <figure class="left">Môžeš mi kúpiť kávu :)
  <a href="https://zwerimex.com/" title="Môžeš mi kúpiť kávu :)"><img src="coffe02.svg" width="48" loading="lazy" /></a>
  <figcaption>Ďakujem.</figcaption>
  </figure>
{{< /rawhtml >}}

### Prvá podkapitola (`###`)

Štart -> Nastavenia -> Čas a jazyk -> [Jazyk](ms-settings:regionlanguage-quickime) -> Správcovské nastavenia jazyka -> Zmeniť miestne nastavenia systému...

*Italics*
  
 _Italics_
  
 __Bold__
  
 ___Bold+Italics___
  
 this_is_not_emph·asis…
  
 ~~Strike·though~~

#### Prvá podkapitola tretej úrovne (`####`)
  
 Content with a - (minus) and a -- (dash) and a --- (long dash).
  
  |&minus;|-|–|—|\
  I- -- ---I\
  I-I česko-slovenský;\
  I--I Bratislava -- Praha;\
  I---I Neuromancer --- W. Gibson;  
  H^2

---

## RAWHTML

bla with rawhtml: 
{{< rawhtml >}}
<mark> &nbsp; bla bla bla &nbsp;</mark>
{{< /rawhtml >}}

and bla without rawhtml: 
<mark> &nbsp; bla bla bla &nbsp;</mark>

---

## Other elements

The <abbr title="World Health Organization">WHO</abbr> was founded in 1948.

This text contains <sup>superscript</sup> text.

This text contains <sub>subscript</sub> text.

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy text (Windows).

Do not forget to buy <mark>milk</mark> today.

---

Zápis v jazyku Markdown: | Výsledok:
---|---
`*Kurzíva*` | *Kurzíva*
`_Kurzíva_` | _Kurzíva_
`**Tučné**` | **Tučné**
`___Tučná kurzíva___` | ___Tučná kurzíva___
`~~Preškrtnuté~~` | ~~Preškrtnuté~~
`## Nadpis 2` | {{< rawhtml >}} <h2>Nadpis 2</h2> {{< /rawhtml >}}
`[Odkaz](https://zwieratko.sk "Popis")` | [Odkaz](https://zwieratko.sk "Popis")
`![Obrázok](https://picsum.photos/100/77)` | ![Obrázok](https://picsum.photos/100/77)
`> Citácia` | {{< rawhtml >}} <blockquote>Citácia</blockquote> {{< /rawhtml >}}
`* Položka`{{< rawhtml >}}<br>{{< /rawhtml >}}`* zoznamu`{{< rawhtml >}}<br>{{< /rawhtml >}}`* bez poradia` | {{< rawhtml >}} <ul><li>Položka</li><li>zoznamu</li><li>bez poradia</li></ul> {{< /rawhtml >}}
`1. Položka`{{< rawhtml >}}<br>{{< /rawhtml >}}`2. zoznamu`{{< rawhtml >}}<br>{{< /rawhtml >}}`3. s poradím` | {{< rawhtml >}} <ol><li>Položka</li><li>zoznamu</li><li>s poradím</li></ol> {{< /rawhtml >}}


---

{{< rawhtml >}}
  <figure class="right">
  <a href="https://zwerimex.com/" title="Môžeš mi kúpiť kávu :)"><img src="coffe02.svg" width="48" loading="lazy" /></a>
  <figcaption>Ďakujem.</figcaption>
  </figure>
{{< /rawhtml >}}
  
 [link](https://picsum.photos/1024/768/?random)
  
 [link](http://link/path/to/target "TITLE ON LINK")
  
 [Shared Links with footnotes][target 1]
  
 [Second shared link][target 1]
  
 [target 1]
  
 [target 1]: http://footnote.com
  
 Sample inline code `a++` can be specified here.
 
 ---
 
 ## Built-in figure
 
{{< figure src="markdown.png" alt="Markdown logo" caption="M logo" loading="lazy" >}}

---

## Figure-new2

{{< figure-new2 src="markdown.png" alt="Markdown logo" caption="M logo" >}}

---

## MD picture

![Markdown logo](markdown.png "M logo")

---

[![320x240px](https://via.placeholder.com/320x240 "Some tooltip")](/poznamky)

[![Alt Text](UEFI.jpg "Optional Tooltip")](https://zwerimex.com/)

![Markdown logo](markdown.png)

![Laren de Graaf](lauren.JPG "Krásavica")

- [x]  Lorem ipsum dolor sit amet
- [ ] Consectetur adipiscing elit
- [ ] Integer molestie lorem at massa

---

{{< rawhtml >}}
  <picture width="960" height="960">
      <source srcset="img/makovy-zavin-960px.avif" type="image/avif" />
      <source srcset="img/makovy-zavin-960px.webp" type="image/webp" />
      <source src="makovy-zavin-960px.jpg" type="image/jpeg" />
      <img src="https://picsum.photos/960" alt="Makový závin" loading="lazy" />
  </picture>
{{< /rawhtml >}}
