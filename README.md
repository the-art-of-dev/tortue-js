# Tortue /tɔʁ.ty/

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/tortue)](https://www.npmjs.com/package/tortue)
[![swtf](https://img.shields.io/badge/support-SWTF-brightgreen)](https://github.com/the-art-of-dev/swtf)

<img src="logo.jpg" width="600px">

_Website development made easy_

## Table of content

- [Tortue /tɔʁ.ty/](#tortue-tɔʁty)
  - [Table of content](#table-of-content)
  - [Concepts](#concepts)
  - [Quick start](#quick-start)
  - [Tortue processes](#tortue-processes)
  - [Tortue Configuration](#tortue-configuration)
    - [Tortue Shell Configuration](#tortue-shell-configuration)
  - [Tortue Shells](#tortue-shells)
  - [Standard Shells](#standard-shells)
  - [Terminology](#terminology)
    - [Context](#context)
      - [Definition](#definition)
      - [Representation](#representation)
    - [Component](#component)
      - [Definition](#definition-1)
      - [Representation](#representation-1)
      - [Calling component](#calling-component)
      - [Props](#props)
      - [Content](#content)
    - [Page](#page)
      - [Definition](#definition-2)
      - [Representation](#representation-2)
    - [Layout](#layout)
      - [Definition](#definition-3)
      - [Representation](#representation-3)
      - [Finidng layout for page](#finidng-layout-for-page)
      - [Head and Content](#head-and-content)
    - [Tortue](#tortue)
    - [Pipeline](#pipeline)
      - [Definition](#definition-4)
    - [Process](#process)
      - [Export process](#export-process)
      - [Watch process](#watch-process)
    - [Shell](#shell)
    - [CLI App](#cli-app)
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

For help run:

```
tortue -h
```

Create new project:

```
tortue new my-project
```

Run development environment:

```
cd my-project
npm install
npm run dev
```

Run production build after finishing development:

```
npm run build
```

---

---

## Tortue processes

There are two main Tortue processes exposed through CLI application.

- Watch
- Export

You can run the following command to start watch process.

```
tortue watch
```

Watch process is used for development environment.

You can run the following command to start export process.

```
tortue export
```

Export process is used for production build.

---

---

## Tortue Configuration

Configuration interface

```ts
interface TortueConfig {
  componentsDir: string;
  pagesDir: string;
  layoutsDir: string;
  shellsConfig: TortueShellConfig[];
}
```

Default configuration

```json
{
  "componentsDir": "components",
  "layoutsDir": "layouts",
  "pagesDir": "pages"
}
```

Example of custom configuration

```json
{
  "componentsDir": "./subdir/components",
  "layoutsDir": "./subdir/layouts",
  "pagesDir": "./subdir/pages",
  "shellsConfig": [
    {
      "name": "intellisense-vsc"
    },
    {
      "name": "export-assets"
    },
    {
      "name": "export-html",
      "args": {
        "exportDir": "./subdir/dist-html"
      }
    }
  ]
}
```

---

### Tortue Shell Configuration

---

Configuration interface

```ts
interface TortueShellConfig {
  name: string;
  path: string;
  args: any;
  events: TortuePipelineEvent[];
}
```

---

---

## Tortue Shells

Tortue Shells are the way to enhance your Tortue environment. Shells are just plain Javascript objects.

Example:

```ts
const customShell = {
  name: "custom-shell",
  actions: {
    configLoaded: async (data) => {
      //your code here...

      return data;
    },
    componentsBuilt: async (data) => {
      //your code here...

      return data;
    },
    layoutsBuilt: async (data) => {
      //your code here...
      return data;
    },
    pagesBuilt: async (data) => {
      //your code here...

      return data;
    },
    renderFinished: async (data) => {
      //your code here...

      return data;
    },
  },
};
```

Every action is callback that receives `data` and can interact with it and change it. Every action as a result must return same type of object as `data` is.

`data` object interface:

```ts
export interface TortueShellActionData {
  registry?: ComponentRegistry;
  pages?: Page[];
  layouts?: Layout[];
  config: TortueConfig;
}
```

---

---

## Standard Shells

List of standard preloaded shells is:

- [export-html](src/stdShells/exportHTML/index.ts) - Exports pages in `dist-html` directory
- [export-assets](src/stdShells/exportAssets/index.ts) - Exports CSS and JS as assets in `assets` directory
- [intellisense-vsc](src/stdShells/intellisenseVSC/index.ts) - Exports HTML customData for VS Code
- [live-server](src/stdShells/liveServer/index.ts) - Starts live development server

---

---

## Terminology

### Context

---

#### Definition

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

#### Representation

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

```ts
interface Context {
  name: string;
  children: Context[];
}
```

We can separate contexts into two groups, **abstract** and **concrete** contexts. The only difference between these two groups is that **concrete contexts doesn't have children**.

---

### Component

---

#### Definition

A component is a concrete context that represents the minimal building block of every website. Components can be used to build other components. Every component consists of its:

- Name (Context)
- Structure (HTML)
- Style (CSS)
- Logic (JS)
- Documentation (MD)

Including one component into another means including its structure, style, and logic together.

#### Representation

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

```ts
interface Component {
  name: string;
  html: string;
  css: string;
  js: string;
  doc: string;
}
```

#### Calling component

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

#### Props

Components have ability to receive custom properties named props. Props are passed to component while calling the component. To pass a prop into comp

_Home/Info/Box/index.html_

```html
<section class="home-info-box">
  <a href="tel:{{phone}}"> {{phone}}</a>
  <a href="mailto:{{mail}}"> {{mail}}</a>
</section>
```

_Home/Header/Section/index.html_

```html
<div class="home-header-section">
  <!-- This is a component call that include passing props to component -->
  <Home-Info-Box
    tp-mail="info@somedomain.com"
    tp-phone="(253) 616-4991"
  ></Home-Info-Box>

  <h1>Main header</h1>
  <Home-Header-Image></Home-Header-Image>
  <p>Some short description</p>
</div>
```

Note that field we used eariler in HTML `{{phone}}` is propagated to `Common-Info-Box` component by adding `tp-phone` attribute. So prefix for sending prosp to component is `tp-`;

Prop naming must follow:

- follow snake case syntax in HTML (example: `tp-info-email`)
- in rendering use same syntax (example: `{{info-email}}`)
- props should only contain letters and numbers

#### Content

Components can render passed children through by using special prop named `innerContent`. To display this prop we use `{{{innerContent}}}` in our components.

_Home/Info/Box/index.html_

```html
<section class="home-info-box">
  {{{innerContent}}}
  <a href="tel:{{phone}}"> {{phone}}</a>
  <a href="mailto:{{mail}}"> {{mail}}</a>
</section>
```

```html
<div class="home-header-section">
  <Home-Info-Box tp-mail="info@somedomain.com" tp-phone="(253) 616-4991">
    <p>Here is custom text before mail and phone</p>
    <!-- Everythin between component tags represent children passed as innerContent -->
  </Home-Info-Box>

  <h1>Main header</h1>
  <Home-Header-Image></Home-Header-Image>
  <p>Some short description</p>
</div>
```

> NOTICE: Props are rendered using Mustache templating engine.

---

### Page

---

#### Definition

A page is a concrete context that consists of components and represents a website page. Think of it as a template for components. Every page consists of:

- Name (Context)
- Structure (HTML)
- Style (CSS)
- Logic (JS)

#### Representation

We "physically" represent pages using the following folder and file structure:

```
📂 Home/
  📄 index.html
  📄 style.css
  📄 script.js
```

In code we can represent pages through the interface (js like pseudo code):

```ts
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

#### Definition

A layout represents a context(abstract or concrete) that is a template for one or multiple pages. If layout represents concrete context it will be used as a template for only one page. If layout represents abstract context, it will serve as a template for all the children pages of that context. Every layout consists of:

- Name (Context)
- Structure (HTML)

#### Representation

We "physically" represent layouts using the following folder and file structure:

```
📂 Blogs/
  📄 layout.html
```

In code we can represent layouts through the interface (js like pseudo code):

```ts
interface Layout {
  name: string;
  html: string;
}
```

#### Finidng layout for page

Every page by default uses default layout(`layouts/layout.html`) if defined. If you want to create layout for specific page or context of pages create layout that follow context hierarchy of that page.

Example:

Pages:

- Home (`pages/Home`)
- Blogs-FirstBlog (`pages/Blogs/FirstBlog`)
- Blogs-SecondBlog (`pages/Blogs/SecondBlog`)

Layouts:

- DEFAULT (`layouts/layout.html`)
- Blogs (`layouts/Blogs/layout.html`)

Pages `Blogs-FirstBlog` and `Blogs-SecondBlog` will use `Blogs` layout, while `Home` page will use `DEFAULT` layout.

#### Head and Content

Example:

_layout.html_

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    {{{head}}}
  </head>
  <body>
    {{{content}}}
  </body>
</html>
```

`{{{head}}}` represents place where pages `<head>` tag will be included.
`{{{content}}}` represents place where pages `<body>` tag will be included.

> NOTICE: Layouts are rendered using Mustache templating engine.

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

and provides the following data:

- Configuration
- Shells
- Components
- Pages
- Layouts

In code we can represent tortue through the interface (js like pseudo code):

```ts
interface Tortue {
  //actions
  loadConfig(): Promise<void>;
  loadShells(): Promise<void>;
  buildComponents(): Promise<void>;
  buildLayouts(): Promise<void>;
  buildPages(): Promise<void>;
  renderPages(): Promise<void>;
  //data
  config: TortueConfiguration; //Configuration
  shells: TortueShell[]; //Shells
  componentRegistry: ComponentRegistry; //Components
  pages: Page[]; //Pages
  layouts: Layout[]; //Layouts
}
```

---

### Pipeline

---

#### Definition

Pipeline represents Tortue actions and data flow orchestration.

Pipeline defines states that can occur while running pipeline.

Example of the Tortue export pipeline:

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

Tortue currently uses only one Pipeline and that's the one shown above.

Pipeline provides abbility to create plugins(_Shells_) that can interact with Tortue data in some of the Pipeline states.

---

### Process

---

Process represents a way of using a pipeline.

#### Export process

Export process uses export pipeline to provide a way for building and exporting your website in wanted structure.

#### Watch process

Watch process uses export pipeline to ease a website development process by running export pipeline every time some of the website parts are created, removed or modified.

---

### Shell

---

Tortue Shell is a plugin system around Tortue Pipeline. Every Shell is consisted of:

- Name
- Actions

Actions are callbacks that can process and change tortue data every time pipeline finds in a state that represent an action name.

---

### CLI App

---

## Contributors

- [buaa00](https://github.com/buaa00)
- [djoricmilos](https://github.com/djoricmilos)
- [nadjarajk](https://github.com/nadjarajk)
- [miletic96](https://github.com/miletic96)

## Sponsors

[<img src="https://localsalesforce.io/assets/images/logo.svg" width="200px" style="background-color:black">](https://localsalesforce.io)
