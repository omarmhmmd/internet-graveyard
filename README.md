# Internet Graveyard

A scattered, canvas-based memorial for dead websites. Bury URLs and watch them become tombstones on an infinite, pannable graveyard.

![Overview](screenshots/overview.png)

## What it does

Each website you bury gets a tombstone placed on the canvas. Tombstones pull a screenshot from Are.na and display the site's name beneath them. Hover a tombstone to reveal directional navigation arrows that jump the viewport to the nearest neighbor in any direction.

![Tombstones](screenshots/tombstones.png)

## Features

- **Bury a website** — paste a URL into the shovel tool and it gets added to the graveyard and saved to Are.na
- **Infinite canvas** — pan and zoom freely across all buried sites
- **Tombstone navigation** — hover any tombstone to navigate directionally to nearby ones
- **Place flowers** — drop flower markers anywhere on the canvas
- **Minimap** — a corner overview of the full graveyard layout

## Demo

> _Add a screen recording here_

## Stack

- [Svelte](https://svelte.dev) + TypeScript
- [Vite](https://vitejs.dev)
- [Svelte Flow](https://svelteflow.dev) — canvas / node graph
- [Are.na API](https://dev.are.na) — URL storage and screenshot fetching
- [Tailwind CSS](https://tailwindcss.com)

## Setup

```bash
npm install
```

Create a `.env` file:

```
VITE_ARENA_TOKEN=your_are_na_token
```

```bash
npm run dev
```
