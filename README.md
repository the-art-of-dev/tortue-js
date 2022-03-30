# 🐢 tortue-js /tɔʁ.ty/

_Website development made easy_

## Table of content

- [🐢 tortue-js /tɔʁ.ty/](#-tortue-js-tɔʁty)
  - [Table of content](#table-of-content)
  - [Concepts](#concepts)
  - [Quick start](#quick-start)
  - [Terminology](#terminology)
    - [Context](#context)
    - [Component](#component)
    - [Page](#page)
    - [Layout](#layout)
    - [Tortue](#tortue)
    - [Pipeline](#pipeline)
    - [Process](#process)
    - [Shell](#shell)
    - [CLI App](#cli-app)
  - [Installation](#installation)
  - [Tortue processes](#tortue-processes)
  - [Tortue Configuration](#tortue-configuration)
    - [Tortue Shell Configuration](#tortue-shell-configuration)
  - [Tortue Shells](#tortue-shells)
  - [Standard Shells](#standard-shells)
  - [Custom Shells](#custom-shells)

---

---

## Concepts

---

---

Tortue is a flexible website building framework with educative nature, mainly ment for static website development. Core concept of Tortue is in defining contexts to parts of a website that are reusable and easier to organize in a granular way, thik of it like a templating engine with ability to scale. Defining contexts through the tortue hierarchy(Components,Layouts,Pages) provides easier way to maintain codebase and reuse some of the parts in other projects. Tortues educative nature consists in allowing entry level web developers to practice abstraction by using only HTML. Because Tortue should be flexible as told, it provides it's own plugin system named Tortue Shells. At the end Tortue is opinionated in many things, but will try to privde as many features as long them don't break Tortue philosophy.

---

---

## Quick start

---

---

Install tortue globally:

```
npm i -g tortue
```

Create new project:

```
tortue new my-project
```

Run development environment:

```
cd my-project
npm run dev
```

---

---

## Terminology

---

---

### Context

---

Context is named abstract or concrete part of the website we're building. Examples?

- Header
- Navigation
- Home
- Page
- Image

We see different level of abstraction in these items. The point is anything can be a context.

Need for structuring contexts resolves in context recursive nature. Context can have sub contexts(children). Example?

- Home
  - Navigation
  - Header
    - Image

We "physically" represent contexts using following folder structure:

```
📂 Home/
  📂 Navigation
  📂 Header/
    📂 Image
```

To represent this hierarchy in human readble way, context names are represented by contexts full path in hierarchy. Every level in context name is delmited by `-`(minus), so context names shouldn't contain that character.

Context names from above example:

```
Home
Home-Navigation
Home-Header
Home-Header-Image
```

In code we can represent context through interface(js like pseudo code):

```js
interface Context {
  name: string;
}
```

We can separate contexts in two groups, **abstract** and **concrete** contexts. Only difference between these two groups is that **concrete contexts doesn't have children**.

---

### Component

---

Component is concrete context that represent minimal building block of every website. Components can be used to build other components. Every component is consisted of it's:

- Structure (HTML)
- Style (CSS)
- Logic (JS)
- Documentation (MD)

Including one component into another means including it's structure, style and logic together.

We "physically" represent component using a following folder and file structure:

```
📂 Home/
  📂 Header/
    📂Section/
      📄 index.html
      📄 style.css
      📄 script.js
      📄 doc.md
```

In code we can represent component through interface(js like pseudo code):

```js
interface Component {
  name: string;
  html: string;
  css: string;
  js: string;
  doc: string;
}
```

Component include another component by including html tag, in it's structure, with context name of component it wants to include. Example?

_Home-Header-Image/index.html_

```html
<div class="home-header-image">
  <img src="/assets/images/home-header-bg.png" />
</div>
```

_Home-Header-Section/index.html_

```html
<div class="home-header-section">
  <h1>Main header</h1>

  <!-- This is a component call -->
  <Home-Header-Image></Home-Header-Image>

  <p>Some short description</p>
</div>
```

---

### Page

---

Page is a concrete context that is consisted of components and represent website page. Thik of it like template for components. Every page is consisted of:

- Structure (HTML)
- Style (CSS)
- Logic (JS)

We "physically" represent page using a following folder and file structure:

```
📂 Home/
  📄 index.html
  📄 style.css
  📄 script.js
```

In code we can page this through interface(js like pseudo code):

```js
interface Page {
  name: string;
  html: string;
  css: string;
  js: string;
}
```

Page can include components in the same way components include each other(read [Component](#component)).

---

### Layout

---

Layout is a concrete context that represent template for pages.

---

### Tortue

---

Tortue is set of tools that provides following actions:

- Load configuration
- Load shells
- Build components
- Build layouts
- Build pages
- Render pages

In code we can represent tortue through interface(js like pseudo code):

```js
interface Tortue{
  loadConfig();
  loadShells();
  buildComponents();
  buildLayouts();
  buildPages();
  renderPages();
}
```

---

### Pipeline

---

Pipeline represents tortue actions and data flow orchestration.

Pipeline defines events that can occur while running pipeline.

- COMPONENTS_BUILT
- PAGES_BUILT
- LAYOUTS_BUILT
- CONFIG_LOADED
- RENDER_FINISHED

```

  TORTUE PIPELINE
  ────────────────────────


 ┌─────────────┐   ┌─────────────┐                ┌──────────────────┐
 │             │   │             │ configLoaded   │                  │
 │ Load Config ├───► Load Shells ├────────────────► Build Components ├─┐
 │             │   │             │                │                  │ │
 └─────────────┘   └─────────────┘                └──────────────────┘ │
                                                                       │
                          componentsBuilt                              │
  ┌────────────────────────────────────────────────────────────────────┘
  │
  │
  │  ┌───────────────┐               ┌─────────────┐              ┌──────────────┐
  │  │               │ layoutsBuilt  │             │ pagesBuilt   │              │
  └──► Build Layouts ├───────────────► Build Pages ├──────────────► Render Pages ├──┐
     │               │               │             │              │              │  │
     └───────────────┘               └─────────────┘              └──────────────┘  │
                                ~+                                                  │
                                                                                    │
                                         *       +                                  │
                                   '                  |           renderFinished    │
                               ()    .-.,="``"=.    - o -   ◄───────────────────────┘
                                     '=/_       \     |
                                  *   |  '=._    |
                                       \     `=./`,        '
                                    .   '=.__.=' `='      *
                           +                         +
                                O      *        '       .

```

---

### Process

---

---

### Shell

---

---

### CLI App

---

---

---

## Installation

---

---

## Tortue processes

---

---

## Tortue Configuration

---

### Tortue Shell Configuration

---

---

## Tortue Shells

---

---

## Standard Shells

---

---

## Custom Shells
