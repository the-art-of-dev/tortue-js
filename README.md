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
  - [Contributors](#contributors)
  - [Sponsors](#sponsors)

---

---

## Concepts

Tortue is a flexible website building framework with an educative nature, mainly meant for static website development. The core concept of Tortue lies in defining contexts to parts of a website that are reusable and easier to organize in a granular way - think of it as a templating engine with the ability to scale. Defining contexts through the Tortue hierarchy (Components, Layouts, Pages) provides an easier way to maintain the codebase and reuse some of its parts in other projects. Tortue’s educative nature consists of allowing entry-level web developers to practice abstraction by using only HTML. Because Tortue should be flexible as mentioned, it provides its own plugin system named Tortue Shells. In the end, Tortue is opinionated on many things, but will try to provide as many features as long as they don't stray away from the Tortue philosophy.

---

---

## Quick start

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

### Context

---

Context is a named abstract or concrete part of the website we're building. Examples?

- Header
- Navigation
- Home
- Page
- Image

We see different levels of abstraction in these items. The point is that anything can be a context.

The need for structuring contexts resolves in the context’s recursive nature. A context can have sub-contexts (children). Example?

- Home
  - Navigation
  - Header
    - Image

We "physically" represent contexts using the following folder structure:

```
📂 Home/
  📂 Navigation
  📂 Header/
    📂 Image
```

To represent this hierarchy in a humanly comprehensible way, context names are represented by the context's full path in the hierarchy. Every level in the context name is delimited by `-`(minus), so context names shouldn't contain that character.

Context names from the above example:

```
Home
Home-Navigation
Home-Header
Home-Header-Image
```

In code we can represent context through the interface (js like pseudo-code):

```js
interface Context {
  name: string;
}
```

We can separate contexts into two groups, **abstract** and **concrete** contexts. The only difference between these two groups is that **concrete contexts doesn't have children**.

---

### Component

---

A component is a concrete context that represents the minimal building block of every website. Components can be used to build other components. Every component consists of its:

- Structure (HTML)
- Style (CSS)
- Logic (JS)
- Documentation (MD)

Including one component into another means including its structure, style, and logic together.

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

In code we can represent components through interface (js like pseudo code):

```js
interface Component {
  name: string;
  html: string;
  css: string;
  js: string;
  doc: string;
}
```

Components include another component by including the HTML tag in its structure, with the context name of the component it wants to include. Example?

_Home/Header/Image/index.html_

```html
<div class="home-header-image">
  <img src="/assets/images/home-header-bg.png" />
</div>
```

_Home/Header/Section/index.html_

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

A page is a concrete context that consists of components and represents a website page. Think of it as a template for components. Every page consists of:

- Structure (HTML)
- Style (CSS)
- Logic (JS)

We "physically" represent pages using the following folder and file structure:

```
📂 Home/
  📄 index.html
  📄 style.css
  📄 script.js
```

In code we can represent pages through interface (js like pseudo code):

```js
interface Page {
  name: string;
  html: string;
  css: string;
  js: string;
}
```

A page can include components in the same way components include each other (read [Component](#component)).

---

### Layout

---

A layout is a concrete context that represents a template for pages.

---

### Tortue

---

Tortue is a set of tools that provides the following actions:

- Load configuration
- Load shells
- Build components
- Build layouts
- Build pages
- Render pages

In code we can represent tortue through interface (js like pseudo code):

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

Pipeline represents Tortue actions and data flow orchestration.

Pipeline defines events that can occur while running pipeline.

- COMPONENTS_BUILT
- PAGES_BUILT
- LAYOUTS_BUILT
- CONFIG_LOADED
- RENDER_FINISHED

```

  TORTUE PIPELINE EXAMPLE
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

## Contributors

- [buaa00](https://github.com/buaa00)
- [djoricmilos](https://github.com/djoricmilos)
- [miletic96](https://github.com/miletic96)
- [nadjarajk](https://github.com/nadjarajk)

## Sponsors

[<img src="https://localsalesforce.io/assets/images/logo.svg" width="200px" style="background-color:black">](https://localsalesforce.io)
