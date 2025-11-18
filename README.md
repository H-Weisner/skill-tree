# skill-tree

This is a test project made by Harry Weisner applying for a job for a software engineer role.

## How to use

1. Run `pnpm i` to install deps
2. Run `pnpm dev`, you will find the project on [port 5173](http://localhost:5173/)
3. Add skills via the form or drag from sidebar
4. Connect nodes by dragging from source to target handle
5. Click nodes to unlock (if prerequisites are met)
6. Data auto-saves to localStorage

## AI Usage

When I setup the project from the CLI (this being my first Vue project), I got a bunch of type errors that were annoying, this did not make me like Vue very much 🤣. I turned to AI in the end using the IDE Cursor, which fixed it for me.

I got the AI to the write the unit tests for me.

## Library usage

I relied on [`shadcn vue`](https://www.shadcn-vue.com/) for UI components as well as `Vue Flow` as the guidelines suggested.

## Design

I got the majority of the funny little SVGs from SVGRepo, from this library on there:

- [doodle library hand drawn vectors](https://www.svgrepo.com/collection/doodle-library-hand-drawn-vectors/)

For the rest of the design I pretty much just lifted all the examples straight from Vue Flow.
