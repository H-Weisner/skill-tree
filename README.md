# skill-tree

This is a test project made by Harry Weisner applying for a job for a software engineer role.

## How to use

1. Run `pnpm i` to install deps
2. Run `pnpm dev`, you will find the project on [port 5173](http://localhost:5173/)
3. Add skills by drag & dropping them from the bottom onto the canvas
4. Connect nodes by dragging from the blue circle nodes to other blue circle nodes
5. Click nodes to unlock (if prerequisites are met)
6. Data auto-saves to localStorage

## AI Usage

I used AI a fair amount to teach me (this being my first Vue project), when I first started just making the app. Basically, I was going through the Vue-flow examples and ask it to explain things that I didn't immediately recognise from just typescript/html.

This is the main way I learnt about Vue concepts like v-if, v-bind & the similarities like {{}} etc., as well as the differences in exporting in Vue vs. in React.

Places where I used AI in the code:

- When I setup the project from the CLI, I got a bunch of type errors my first time starting Vue. I asked AI to help when google failed & it did.
- I took the theme dropdown toggle provided by shadcn, gave it to chatgpt to turn into a one click button.
- On implementing SVG loader, to load SVGs, AI told me what to do there
- I'd write the last step for the thing I wanted on my unit tests and got AI to write the rest
- I ran into a bug where the toast was firing 3 times, GPT rewrote the useDnD hook, removing the bits about clicking the nodes, and putting them in .canvas.vue
- I had an issue where the animated on/off part of the edges didn't work unless I refreshed the page. It was something happening internally in the library so I asked the AI and it came up with some hack involving .map(), it worked so I went with it

## Library usage

I relied on [`shadcn vue`](https://www.shadcn-vue.com/) for UI components as well as `Vue Flow` as the guidelines suggested.

## Design

I got the majority of the funny little SVGs from SVGRepo, from this library on there:

- [doodle library hand drawn vectors](https://www.svgrepo.com/collection/doodle-library-hand-drawn-vectors/)

For the rest of the design I pretty much just lifted all the examples straight from Vue Flow or shadcn. Following shadcn's guide is how I implemented dark mode.
