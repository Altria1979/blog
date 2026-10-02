# Third-party notices

## Clarity language and reading preferences

The language routing and language/theme capsule are adapted for Next.js and React from [senshinya/blog](https://github.com/senshinya/blog), pinned at `6dac6683dbd0e9c9a921a7790086a44696d43910` (Clarity 3.8.0). Reference files: `app/components/blog/LangToggle.vue`, `app/components/blog/ReadingPreferences.vue`, `app/assets/css/reading-preferences.css`, `app/composables/useLocaleAlternates.ts`, and `modules/i18n-manifest`.

The original authors' posts, photos, personal information, and service configurations are not included. English and Japanese posts translate Altria's Next.js blog implementation article. Altria's year-in-review posts migrated from Juejin retain their source links. The Next.js article cover, wallhaven-y8137x.jpg, was supplied by the user; image rights are separate from the site's software license.

The brand's blurred, floating emoji background is also adapted from `app/components/blog/BlogHeader.global.vue` at the same pinned revision. It uses Altria's configurable decorations, CSS-only hover/focus activation, and the site's reduced-motion preference.

## Article formats and rich-content components

The Markdown/MDC authoring formats, component behavior, and relevant article styles are adapted for this Next.js / React implementation from these public source snapshots:

| Upstream | Reviewed commit | Reference implementation |
| --- | --- | --- |
| [senshinya/blog](https://github.com/senshinya/blog) | [`6dac6683dbd0e9c9a921a7790086a44696d43910`](https://github.com/senshinya/blog/tree/6dac6683dbd0e9c9a921a7790086a44696d43910) | `content.config.ts`, `app/components/content/`, `app/components/post/PostFooter.vue`, `app/composables/useShiki.ts`, and article typography. |
| [L33Z22L11/blog-v3](https://github.com/L33Z22L11/blog-v3) | [`381f1c1648a53d6f7aa8e351d521311af6da998d`](https://github.com/L33Z22L11/blog-v3/tree/381f1c1648a53d6f7aa8e351d521311af6da998d) | `content.config.ts`, `content/previews/example.md` as a syntax reference, `app/components/content/`, `app/components/post/PostFooter.vue`, `app/composables/useShiki.ts`, `shared/utils/icon.ts`, and `app/assets/css/article.css` / `reusable.css`. |

The adaptations cover metadata compatibility, prose formatting, tabs, callouts, folding, cards, pictures, inline controls, code presentation, content slots, diagrams, scores, and supported media embeds. Vue components were reimplemented with React components and a constrained Markdown syntax tree; these are not claims of identical pixels or complete Nuxt/Vue runtime compatibility. The examples in `docs/markdown-examples.md` were written for Altria. Upstream articles, photos, author profiles, service credentials, private services, and personal collections were not imported.

Both source snapshots provide the same MIT notice reproduced below. This software notice does not assign a license to Altria's articles or independently licensed image/font assets.

## Upstream MIT license

MIT License

Copyright (c) 2024 Zhilu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Rich-content dependencies

Versions below match the installed packages and lockfile reviewed on 2026-10-01. The table covers the direct packages introduced for this article pipeline; their transitive packages retain their own notices in the installed distribution. Preserve dependency notices when redistributing a build.

| Package | Version | License | Source |
| --- | --- | --- | --- |
| `unified` | 11.0.5 | MIT | [Source](https://github.com/unifiedjs/unified) |
| `remark-parse` | 11.0.0 | MIT | [Source](https://github.com/remarkjs/remark) |
| `remark-gfm` | 4.0.1 | MIT | [Source](https://github.com/remarkjs/remark-gfm) |
| `remark-math` | 6.0.0 | MIT | [Source](https://github.com/remarkjs/remark-math) |
| `remark-mdc` | 3.11.1 | MIT | [Source](https://github.com/nuxt-content/remark-mdc) |
| `shiki / @shikijs/transformers` | 4.4.3 | MIT | [Source](https://github.com/shikijs/shiki) |
| `katex` | 0.16.47 | MIT | [Source](https://github.com/KaTeX/KaTeX) |
| `mermaid` | 11.17.2 | MIT | [Source](https://github.com/mermaid-js/mermaid) |
| `abcjs` | 6.7.1 | MIT | [Source](https://github.com/paulrosen/abcjs) |
| `yaml` | 2.9.1 | ISC | [Source](https://github.com/eemeli/yaml) |

License texts below are copied from the installed package files. `remark-math` 6.0.0 declares MIT in its package manifest but omits a license file; its text is reproduced from the [official repository license](https://github.com/remarkjs/remark-math/blob/main/license). Shiki and its transformers ship the same notice, reproduced once for both.

GitHub repository cards access only the explicitly named public repository through the public GitHub API, without authentication credentials. Explicit Iconify names load icons from `api.iconify.design`; each selected icon retains its icon-set license. ABC playback uses external soundfonts at `https://paulrosen.github.io/midi-js-soundfonts/`, which are not bundled into this repository. The notation remains readable if audio resources fail to load, and audio starts only after the visitor chooses Play. Video embeds contact their selected provider and default to no autoplay. External media, data, and soundfonts have their own rights and availability; the software licenses below do not cover those assets.

### unified

```text
(The MIT License)

Copyright (c) 2015 Titus Wormer <tituswormer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

### remark-parse

```text
(The MIT License)

Copyright (c) 2014 Titus Wormer <tituswormer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

### remark-gfm

```text
(The MIT License)

Copyright (c) Titus Wormer <tituswormer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### remark-math

```text
(The MIT License)

Copyright (c) Junyoung Choi <fluke8259@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### remark-mdc

```text
MIT License

Copyright (c) NuxtLabs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### shiki / @shikijs/transformers

```text
MIT License

Copyright (c) 2021 Pine Wu
Copyright (c) 2023 Anthony Fu <https://github.com/antfu>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### katex

```text
The MIT License (MIT)

Copyright (c) 2013-2020 Khan Academy and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### mermaid

```text
The MIT License (MIT)

Copyright (c) 2014 - 2022 Knut Sveidqvist

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### abcjs

```text
Copyright (c) 2009-2026 Paul Rosen and Gregory Dyke

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**This text is from: http://opensource.org/licenses/MIT**
```

### yaml

```text
Copyright Eemeli Aro <eemeli@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

## Technical information brand icons

The Vercel, Node.js, Alibaba Cloud, Cloudflare, and Supabase SVG paths in `components/technical-brand-icon.tsx` come from [Simple Icons](https://github.com/simple-icons/simple-icons/tree/1089fb7d2bf0e323f834c205ab76265005a6d5e8/icons), revision `1089fb7d2bf0e323f834c205ab76265005a6d5e8`, reviewed on 2026-10-02. Source files: `vercel.svg`, `nodedotjs.svg`, `alibabacloud.svg`, `cloudflare.svg`, and `supabase.svg`. Simple Icons publishes these assets under [CC0 1.0 Universal](https://github.com/simple-icons/simple-icons/blob/1089fb7d2bf0e323f834c205ab76265005a6d5e8/LICENSE.md); brand trademarks remain the property of their respective owners.
