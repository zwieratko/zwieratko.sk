---
title: "Otvoriť link na novej karte"
date: 2019-12-26T08:20:27+01:00
draft: false
description: Ako nastaviť Hugo 0.60 a vyšší tak, aby sa externý link otváral na novej karte prehliadača.
type: posts
tags:
  - Markdown
  - Hugo
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem, aby sa na stránkach zostavených pomocou Hugo verzia 0.60 a vyššie link smerujúci vonku zo stránky otváral na novej karte (new tab) prehliadača, teda nie v tej istej karte v ktorej klikám na link.

V čistom HTML to nie je problém, značka [a](https://www.w3schools.com/tags/tag_a.asp) ma atribút `target=_blank`, no v značkovacom jazyku Markdown na to nie je žiadna špeciálna značka či atribút.

V Hugo 0.59 a nižšom bol východiskový prekladač z Markdown do HTML takzvaný [Blackfriday](https://gohugo.io/content-management/formats/) a v ňom bol jednoduchý prepínač (nastavenie) kde som mohol plošne zapnúť otváranie externých odkazov na novej karte, no od verzie 0.60 je východiskovým prekladačom [Goldmark](https://github.com/gohugoio/hugo/releases/tag/v0.60.0) a ten taký prepínač zatiaľ nemá.

## Riešenie

Tých je viacero.

### Zmeniť prekladač

Najjednoduchšie riešenie, no dlhodobo neudržateľné. V konfiguračnom súbore `config.toml` zmením prekladač späť na `blackfriday`:

```toml
[markup]
  defaultMarkdownHandler = "blackfriday" #goldmark or blackfriday
  [markup.blackFriday]
    hrefTargetBlank = true
    # noreferrerLinks = true
    # nofollowLinks = true
```

---

### Vytvoriť si „shortcode“

V adresári `layouts` si vytvorím podadresár `shortcodes` a v ňom vytvorím súbor `target-blank.html` v ktorom bude len jeden riadok kódu:

```go
<a href="{{ .Get "url" }}" target="_blank">{{ with .Get "title" }}{{.}}{{else}}{{.Get "url"}}{{end}}</a>
```

Potom môžem v texte použiť konštrukciu:

{{< rawhtml >}}
<pre>
&lbrace;{< target-blank title="zwerimex" url="https://zwerimex.com/" >}}
</pre>
{{< /rawhtml >}}

A tá bude do HTML preložená ako:

```html
<a href="https://zwerimex.com/" target="_blank">zwerimex</a>
```

Hmmm, toto furt nie je ono.

Zdroj:
- [codeooze.com](https://www.codeooze.com/webdesign/hugo-shortcode-target-blank/)

---

### Počkať na Hugo 0.62 :)

V adresári `layouts` si vytvorím podadresár `_default`, v ňom si vytvorím ďalší podadresár `_markup` a v ňom si vytvorím súbor `render-link.html` do ktorého vložím:

```go
<a href="{{ .Destination | safeURL }}"{{ with .Title}} title="{{ . }}"{{ end }}{{ if strings.HasPrefix .Destination "http" }} target="_blank"{{ end }}>{{ .Text }}</a>
```

Potom môžem ďalej v texte používať bežnú Markdown značku pre link `[]()` a externé hyperlinky by sa mali už opäť otvárať na novej karte prehliadača.

Zdroj:

- [gohugo.io](https://gohugo.io/getting-started/configuration-markup/#markdown-render-hooks)

---

### Riešenie z vydania Hugo 0.62.1

S touto verziou Huga zverejnil Bep aj vzorovú stránku, kde ukazuje možnosti implementácie odkazov aj obrázkov. Ukážka pre odkazy, do súboru `/layouts/_default/_markup/render-link.html` vložím:

```go
{{ $link := .Destination }}
{{ $isRemote := strings.HasPrefix $link "http" }}
{{- if not $isRemote -}}
{{ $url := urls.Parse .Destination }}
{{- if $url.Path -}}
{{ $fragment := "" }}
{{- with $url.Fragment }}{{ $fragment = printf "#%s" . }}{{ end -}}
{{- with .Page.GetPage $url.Path }}{{ $link = printf "%s%s" .RelPermalink $fragment }}{{ end }}{{ end -}}
{{- end -}}
<a href="{{ $link | safeURL }}"{{ with .Title}} title="{{ . }}"{{ end }}{{ if $isRemote }} target="_blank" rel="noopener"{{ end }}>{{ .Text | safeHTML }}</a>
```

Do Bepovej verzie som akurát doplnil `rel="noopener"`. Prečo viď nižšie.

Zdroj:

- [github.com](https://github.com/bep/portable-hugo-links)

---

### Poznámka na záver

Hmmm, ono to nakoniec je ešte zamotanejšie. Vyzerá to tak, že bezdôvodné používanie parametru `target="_blank"` tiež nie je úplne najlepšie. Zaujímavo vysvetlené prečo viď tu [css-tricks.com](https://css-tricks.com/use-target_blank/).

Podľa toho webu sú len niektoré dôvody na otváranie odkazov v nových záložkách pádne. Okrem iných su to napríklad:

- prípad kde užívateľom iniciované prehrávanie hudby, videa by bolo prerušené
- prípad kde užívateľ na stránke niečo robí a mohlo by sa to stratiť
- vyžaduje to technologické riešenie
- iné

A keď už je to nevyhnutne nutné (otvoriť odkaz v novom tabe), tak je to potrebné urobiť správne. Teda je potrebné použiť aj parameter `rel="noopener"`.

Zdroj

- [css-tricks.com](https://css-tricks.com/use-target_blank/)
- [developers.google.com](https://developers.google.com/web/tools/lighthouse/audits/noopener)
- [mathiasbynens.github.io](https://mathiasbynens.github.io/rel-noopener/)
