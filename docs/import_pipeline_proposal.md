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

## FAQ