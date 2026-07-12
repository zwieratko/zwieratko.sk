---
applyTo: "content/**/*.md"
---

# Slovak blog post proofreading guidelines

## Purpose

These instructions apply only to Markdown blog posts under `content/`. They guide grammar, spelling, style, and word-order (slovosled) review of Slovak-language prose written for this Hugo site (zwieratko.sk).

## Scope of changes

- **CRITICAL:** Only touch prose text in the body of the post and the specific free-text front matter fields listed below. NEVER alter or corrupt:
  - Front matter structure: keys, indentation, YAML/TOML syntax, and any non-text field (`date`, `draft`, `type`, `toc`, `featuredImg`, `images` paths, etc.).
  - Fenced code blocks (```) or inline code (`code`).
  - Hugo shortcodes (`{{< ... >}}`, `{{% ... %}}`).
  - Destination URLs, image paths, or literal identifiers inside Markdown links `[text](URL)`. (You may check the spelling of the _anchor text_ inside `[...]`, but never touch the `(URL)`).
  - The image path/filename inside Markdown images `![alt](path "title")`. (You may check the _alt text_ and the optional _title string_ in quotes, but never touch `path`.)
- Do not rewrite for the sake of rewriting. Fix actual errors; do not "polish" correct sentences into a different style unless asked.
- Preserve the author's voice, tone, and register (an informal, friendly, or technical mix is intentional).
- Preserve intentional anglicisms and technical terms commonly left untranslated in the pet/tech/blogging niche.

### Front matter — checkable free-text fields

The following front matter fields contain Slovak prose and may be checked for spelling/grammar/style just like body text, without changing YAML/TOML structure, quoting style, or key names:

- `title`
- `description`
- `tags` (individual values, e.g. `Bezmäsité jedlo`)
- `categories` (individual values, e.g. `Recepty`)

Do not reorder, add, or remove entries in `tags`/`categories` lists — only fix actual spelling/grammar errors within the existing wording. All other front matter fields are off-limits.

### Alt text and image titles

Alt text and the optional quoted title string in Markdown images (`![alt text](file.webp "title text")`) are Slovak prose and should be checked the same way as body text (spelling, grammar, word order). Never touch the file path itself.

## What to check

- **Spelling (pravopis):** Focus on diacritics (dĺžne, mäkčene), i/y distinctions, and compound words.
- **Grammar (gramatika):** Case agreement (skloňovanie), verb conjugation, and gender agreement.
- **Punctuation & Typography:**
  - Comma placement before conjunctions/subordinate clauses per Slovak grammatical rules (not English conventions).
  - Ensure correct Slovak quotation marks (`„` and `“`), NOT English ones (`"` and `"`).
  - Ensure correct use of en-dash (–) for ranges/pauses vs. hyphen (-) for compound words.
- **Word order (slovosled):** Flag unnatural, word-for-word translations or calque-like (English-influenced) word order, and suggest a more natural Slovak ordering.
- **Style (štylistika):** Identify redundant words, awkward phrasing, or repeated words in close proximity — but only flag them, do not force a rewrite if the original is acceptable.
- **Consistency:** Ensure the tone remains consistent (e.g., if the author addresses the reader by "tykanie", do not switch to "vykanie").

## Output format when reviewing a post

For each proposed change, provide a clear, scannable overview using the following template:

### Proposed Fixes

- **Original:** "[short fragment of original text]"
  - **Corrected:** "[corrected version]"
  - **Reason:** [One-line reason in Slovak, e.g., "nesprávny pád", "kalk z angličtiny", "chybné úvodzovky", "preklep"]

Group unclear or borderline cases (dialectal forms, stylistic judgment calls, author-specific jargon) separately at the end:

### Na zváženie (For consideration)

- _[Suggestion or question for the author regarding a specific phrase]_

## Do not

- Do not auto-apply changes to the file directly unless explicitly asked to modify the source code.
- Do not translate the post or any part of it into another language.
- Do not add new content, external examples, or explanations not present in the original text.
