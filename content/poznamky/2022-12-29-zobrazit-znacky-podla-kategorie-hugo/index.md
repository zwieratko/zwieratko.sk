---
title: Zobraziť značky podľa kategórie – Hugo
date: 2022-12-29T11:22:46+01:00
draft: false
description: Ako implementovať zobrazenie všetkých značiek z jednej kategórie príspevkov do témy v generátore statických stránok Hugo.
type: posts
tags:
  - Hugo
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem pridať možnosť zobraziť všetky použité značky (`tags`) zo všetkých príspevkov jednej kategórie (`categories`) do vybranej témy v generátore statických stránok [Hugo](https://gohugo.io/).

## Riešenie

### Zapnúť kategórie

Najskôr musím zapnúť použitie „kategórie“ v konfiguračnom súbore `config.toml` v časti `taxonomies`, odobratím znaku mriežka zo začiatku riadku `category`. Kategória v tomto prípade je jedno z viacerých hľadísk, podľa ktorého môžem organizovať vytváraný obsah. Kategória je jedna zo základných [taxonómii](https://gohugo.io/content-management/taxonomies/) v Hugovi.

```toml
[taxonomies]
  tag = "tags"
  # Categories are disabled by default.
  category = "categories"
```

V tejto konkrétnej téme [hermit](https://github.com/Track3/hermit) je v predvolenom nastavení použitie kategórii vypnuté.

### Vytvoriť nový `shortcode`

Vytvorím taký „filter“, ktorý najskôr vyberie všetky príspevky typu `post`, potom vyberie všetky príspevky danej kategórie podľa toho kde bude vložený (vyberá podľa `.Page.Title`), vytvorím novú premennú `data` a do nej vložím zoznam `tag_list` a do neho vkladám všetky značky z vybraných príspevkov. Ukladám ich s malými písmenami.

V druhej časti vytvorím z `html` značiek jednoduchý zoznam, kde každá položka bude jedna značka v podobe odkazu na samostatnú stránku so všetkými príspevkami kde sa daná značka vyskytuje plus počet príspevkov s danou značkou. Prechádzam všetkými použitými značkami na stránke a ak sa nachádza značka aj v zozname v premennej `data` zobrazím ju.

`layouts/shortcodes/tags-from-categories.html`

```html
{{ $p := where site.RegularPages "Type" "posts" }}
{{ $p = where $p "Params.categories" "intersect" (slice .Page.Title) }}

{{ $data := newScratch }}
{{ range $p }}
    {{ $data.Add "tag_list" (apply .Params.tags "lower" ".") }}
{{ end }}

<div class="tagcloud01 related-posts">
    <h3>
        Použité značky
    </h3>
        <ul>
            {{ range $name, $taxonomy := .Site.Taxonomies.tags }}
                {{ if in ($data.Get "tag_list") (replace $name "-" " ") }}
                    <li><a href="/tags/{{ $name | urlize }}">#{{ $name | humanize }} ({{ $taxonomy.Count }})</a></li>
                {{end}}
            {{end}}
        </ul>
</div>
```

No po čase som si všimol, že zoznam značiek neobsahuje úplne všetky značky a po chvíli overovania som prišiel na to, že chýbajú značky obsahujúce v názve interpunkčné znamienka.

Nevymyslel ani nenašiel som žiadne čistejšie riešenie, ale len také, že pred vložením vyfiltrovaných značiek do premennej v nich nahradím písmena s diakritikou písmenami bez diakritiky. Čuduj sa svete, funguje to :)

`layouts/shortcodes/tags-from-categories.html`

```html
{{ $p := where site.RegularPages "Type" "posts" }}
{{ $p = where $p "Params.categories" "intersect" (slice .Page.Title) }}

{{ $data := newScratch }}
{{ range $p }}
    {{ $temp := (apply .Params.tags "lower" ".") }}
    {{ $temp := ( apply $temp "replace" "." "á" "a") }}
    {{ $temp := ( apply $temp "replace" "." "ä" "a") }}
    {{ $temp := ( apply $temp "replace" "." "č" "c") }}
    {{ $temp := ( apply $temp "replace" "." "ď" "d") }}
    {{ $temp := ( apply $temp "replace" "." "é" "e") }}
    {{ $temp := ( apply $temp "replace" "." "í" "i") }}
    {{ $temp := ( apply $temp "replace" "." "ĺ" "l") }}
    {{ $temp := ( apply $temp "replace" "." "ľ" "l") }}
    {{ $temp := ( apply $temp "replace" "." "ň" "n") }}
    {{ $temp := ( apply $temp "replace" "." "ó" "o") }}
    {{ $temp := ( apply $temp "replace" "." "ô" "o") }}
    {{ $temp := ( apply $temp "replace" "." "ö" "o") }}
    {{ $temp := ( apply $temp "replace" "." "ő" "o") }}
    {{ $temp := ( apply $temp "replace" "." "ŕ" "r") }}
    {{ $temp := ( apply $temp "replace" "." "š" "s") }}
    {{ $temp := ( apply $temp "replace" "." "ť" "t") }}
    {{ $temp := ( apply $temp "replace" "." "ú" "u") }}
    {{ $temp := ( apply $temp "replace" "." "ü" "u") }}
    {{ $temp := ( apply $temp "replace" "." "ű" "u") }}
    {{ $temp := ( apply $temp "replace" "." "ý" "y") }}
    {{ $temp := ( apply $temp "replace" "." "ž" "z") }}
    {{ $data.Add "tag_list" $temp }}
    {{ end }}

<div class="tagcloud01 related-posts">
    <h3>
        Použité značky
    </h3>
        <ul>
            {{ range $name, $taxonomy := .Site.Taxonomies.tags }}
                {{ if in ($data.Get "tag_list") (replace $name "-" " ") }}
                    <li><a href="/tags/{{ $name | urlize }}">#{{ $name | humanize }} ({{ $taxonomy.Count }})</a></li>
                {{end}}
            {{end}}
        </ul>
</div>
```

### Pridať oblak značiek na stránku

V poslednom kroku musím pridať novo vytvorený `shortcode`, respektíve odkaz na neho na konkrétne miesto na stránke kde sa má zobrazovať zoznam všetkých značiek použitých v príspevkoch danej kategórie.

```html
...
{{</* tags-from-categories */>}}
...
```

Výsledok viď buď zoznam značiek použitých v príspevkoch z kategórie [poznámky](/poznamky/), alebo z kategórie [recepty](/recepty/).
