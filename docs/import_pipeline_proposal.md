# Import Pipeline Proposal

Import Pipeline should represent process of importing entities into Tortue registry. Reverse process of Export Pipeline

## Current pipeline system changes

Tortue Pipeliens should be represented as EventEmitters. There should be support of registering new and deleting existing events.

## Import Pipeline

Import Pipeline represents custom Tortue Pipeline for importing Components, Layouts and Shells into the memory using various predefined formats.

## Import events

- CONFIG_LOADED
- ALL_SHELLS_FINISHED

For every Shell included in configuration fire an event that shell finished it's process.

## Import formats

- JSON
- Folder structure

## Up for debate

```
Tortue component
- Import
- Export
- Render

Tortue page
- Import
- Export
- Render

Tortue layout
- Import
- Export
- Render

Tortue shell
- Load
- Export

Tortue pipeline
- LoadConfig
- LoadShells
- Run

Tortue Render pipeline
- …
- Import components
- Import layouts
- Import pages
- Render pages
- Export pages to html

Tortue Add pipeline
- Import from source(JSON, directory, registry)
- Export components to local components dir
- Export layouts to local layouts dir
- Export shells to local shells dir
- Update dependency list
```

## FAQ
