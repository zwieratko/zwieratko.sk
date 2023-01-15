---
title: Implementácia sérii – Hugo
date: 2022-12-31T11:22:37+01:00
draft: false
description: Ako implementovať nové hľadisko na zoskupovanie príspevkov do témy v generátore statických stránok Hugo.
type: posts
tags:
  - Hugo
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem pridať ďalšie nové hľadisko – série, na klasifikáciu / zoskupovanie príspevkov do použitej témy v generátore statických stránok [Hugo](https://gohugo.io/).

## Riešenie

### Zapnúť série

V hlavnom konfiguračnom súbore zapnem novú taxonómiu, v časti `taxonomies` doplním riadok s `series`.

```TOML
[taxonomies]
  tag = "tags"
  # Categories are disabled by default.
  category = "categories"
  series = "series"
```

### Vytvoriť šablónu pre zobrazenie

V adresári s témou vytvorím úplne nový súbor `series_link.html`, je to šablóna na zobrazenie odkazov na všetky príspevky v danej sérii.

`themes/názov-témy/layouts/partials/series_link.html`

```html
{{ if .Params.series }}
<div>
    <h4>{{ i18n "partOfSeries" }}</h4>
    <ul class="list-group">
        {{ range $num,$post := (index .Site.Taxonomies.series (index .Params.series 0 | urlize)).Pages.ByDate }}
            {{ if eq $post.Permalink $.Page.Permalink }}
                <li class="list-group-item active">
                    {{ i18n "part"}} {{ add $num 1 }}: {{ i18n "thisArticle"}}
                </li>
            {{ else }}
                <li class="list-group-item">
                    <a href="{{$post.Permalink}}">
                        {{ i18n "part"}} {{ add $num 1 }}: {{ $post.Params.title}}
                    </a>
                </li>
            {{end}}
        {{end}}
    </ul>
</div>
{{end}}
```

### Pridať série na stránku

V šablóne na zobrazenie príspevku `single.html` doplním na požadované miesto odkaz na vyššie vytvorenú šablónu na zobrazenie príspevkov v sérii.

Zoznam príspevkov v sérii umiestnim aj na začiatok, medzi hlavný nadpis a obsah samotného príspevku, a aj na koniec, po obsahu príspevku.

`themes/názov-témy/layouts/posts/single.html`

```go
...
{{ partial "series_link.html" . }}
{{ .Content | ........}}
{{ partial "series_link.html" . }}
...
```

### Viacjazyčnosť

Chcem zabezpečiť aj možnosť použitia sérii aj v iných jazykoch, tak šablóna na zobrazenie odkazov na príspevky v sérii používa na zobrazenie na pevno vloženého textu systém `i18n` a teda doplním aj minimálne slovenskú a anglickú verziu použitého textu.

`themes/názov-témy/i18n/en.toml`

```toml
# partials/series_link.html
#
[partOfSeries]
other = "This article is part of a series."

[part]
other = "Part"

[thisArticle]
other = "This Article"
```

`themes/názov-témy/i18n/sk.toml`

```toml
# partials/series_link.html
#
[partOfSeries]
#other = "This article is part of a series."
other = "Tento príspevok je časťou série:"

[part]
#other = "Part"
other = "Časť"

[thisArticle]
#other = "This Article"
other = "Tento príspevok"
```

### Pridanie série do obsahu

Ak teda chcem aby vytváraný obsah bol zaradený do nejakej série, tak do `frontmatter` príspevku pridám ďalšiu položku `series` a do nej pridám zoznam obsahujúci aspoň jednu sériu kam chcem príspevok zaradiť.

```yaml
series:
  - APT
```

---

## Zdroj

- [Hugo - Create a Post Series](https://digitaldrummerj.me/hugo-post-series/)
