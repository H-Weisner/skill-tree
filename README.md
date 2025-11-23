# skill-tree

This is a test project made by Harry Weisner applying for a job for a software engineer role.

## How to use

1. Run `pnpm i` to install deps
2. Run `pnpm dev`, you will find the project on [port 5173](http://localhost:5173/)
3. Add skills by drag & dropping them from the bottom onto the canvas
4. Connect nodes by dragging from the blue circle nodes to green circle nodes
   - You cannot create connections starting from green nodes, only blue, it is prevented
   - You cannot create circular dependencies, it is prevented
6. Click nodes to unlock them.
   - Only "Skill Tree Start" nodes can be unlocked with no prerequisite nodes
   - Regular skills and capstone skills require a previous unlocked skill to be unlocked
   - I called the final skills "capstone skills", as that's what they're generally called in the video game series Borderlands
8. Data auto-saves to localStorage, allowing you to refresh the page etc.

## AI Usage

I used AI a fair amount to teach me (this being my first Vue project), when I first started just making the app. Basically, I was going through the Vue-flow examples and ask it to explain things that I didn't immediately recognise from just typescript/html.

This is the main way I learnt about Vue concepts like v-if, v-bind & the similarities with React like {{}} etc., as well as the differences in exporting in Vue vs. in React.

Places where I used AI in the code:

- When I setup the project from the CLI, I got a bunch of type errors my first time starting Vue. I asked AI to help when google failed & it did.
- I took the theme dropdown toggle provided by shadcn, gave it to chatgpt to turn into a one click button.
- On implementing SVG loader, to load SVGs, AI told me what to do there
- Unit tests, I wrote the a list of tests that I wanted, gave it the .store.ts code and AI wrote them
- I ran into a bug where the toast was firing 3 times, GPT rewrote the useDnD hook, removing the bits about clicking the nodes, and putting them in .canvas.vue
- Had a few issues with too many rerenders firing because I'm not familiar to Vue, AI fixed them

I used ChatGPT and then Gemini 3 when that came out.

## Library usage

I relied on [`shadcn vue`](https://www.shadcn-vue.com/) for UI components as well as `Vue Flow` as the guidelines suggested.

## Design

I got the majority of the funny little SVGs from SVGRepo, from this library on there:

- [doodle library hand drawn vectors](https://www.svgrepo.com/collection/doodle-library-hand-drawn-vectors/)

I originally intended for there to be an icon picker, but it ended up looking nice and I didn't want to iterate on it further and spoil the clean design.

For the rest of the design I pretty much just lifted all the examples straight from Vue Flow or shadcn, then spent a while messing about until it looked somewhat swish. For the animations I used the `dock` component from react-bits as a reference, I found a vue version of the library.
