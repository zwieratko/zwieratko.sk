---
title: "Koncová lomka v URL - Hugo"
date: 2020-02-20T21:56:38+01:00
draft: false
description: Ako upraviť tému pre Huga tak, aby aj adresy generované pre značky (tagy) na konci príspevku boli správne zakončené lomkou.
type: posts
tags:
  - Hugo
categories:
  - Poznámky
toc: false
---

## Cieľ

Chcem upraviť tému pre Huga tak, aby aj adresy generované pre značky (tagy) na konci príspevku boli správne zakončené lomkou (a trailing slash).

Hugo generuje stránky podľa šablóny v téme Hermit tak, že odkazy na konci príspevku pre jednotlivé značky sa nekončia lomkou a teda po kliknutí na nich sa musí vykonať ešte jedno presmerovanie navyše.

Vygenerovaný odkaz ma podobu:

`https://zwieratko.sk/tags/hugo`

Ak sa chcem vyhnúť jednému zbytočnému presmerovaniu (301), mal by mať odkaz na konci lomku:

`https://zwieratko.sk/tags/hugo/`

## Riešenie

V tejto téme má na starosti generovanie odkazov pre značky šablóna `/layouts/posts/single.html`, kde potrebujem doplniť lomku pred koncové úvodzovky v elemente `a`.

Pôvodná časť šablóny:

```go
{{- with .Params.tags }}
<p>
  {{- range . -}}
  <span class="tag"><a href="{{ "tags/" | absLangURL }}{{ . | urlize }}">{{.}}</a></span>
  {{- end }}
</p>
{{- end }}
```

Upravená časť:

```go
{{- with .Params.tags }}
<p>
  {{- range . -}}
  <span class="tag"><a href="{{ "tags/" | absLangURL }}{{ . | urlize }}/">{{.}}</a></span>
  {{- end }}
</p>
{{- end }}
```

---

Len na ilustráciu ešte kúsok zo šablóny z inej témy:
```go
{{- if or .Params.categories .Params.tags -}}
<section class="article labels">
    {{- range .Params.categories -}}
    {{- $url := print "/categories/" (. | urlize) "/" -}}
    <a class="category" href={{- $url | relLangURL -}}>{{- . -}}</a>
    {{- end -}}
    {{- range .Params.tags -}}
    {{- $url := print "/tags/" ( . | urlize) "/" -}}
    <a class="tag" href={{- $url | relLangURL -}}>{{- . -}}</a>
    {{- end -}}
</section>
{{- end -}}
```
