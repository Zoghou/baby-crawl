# 👶 Baby Crawl

A small browser game: baby crawls around the house hunting for toys, navigating furniture and avoiding the things that shouldn't go in their mouth. Self-contained, no build step — open `baby-crawl.html` in a browser and play.

**▶ Play: <https://zoghou.github.io/baby-crawl/>**

## Controls

- **WASD** or **Arrow keys** — crawl
- **Space** — call Mom

### On a phone

The game takes touch input. An on-screen joystick (8-way, so diagonals work) sits bottom-left and a **MOM** button bottom-right.

They appear automatically on any device reporting a coarse pointer, and the toggle on the landing page overrides that either way — useful for testing touch controls on a desktop, or turning them off on a tablet with a keyboard. The choice is remembered in `localStorage`. You can also force it per-page with `?touch=1` or `?touch=0`.

`touch-controls.js` works by synthesizing the same `keydown`/`keyup` events the game already listens for, so the game code itself has no knowledge of touch and needed no changes.

## Playing

Each room has a finite number of toys — 3 in the first room, one more each room after, up to 10 — and collecting all of them clears the room. Toys and hazards look alike on the floor, so you have to tell them apart yourself. You have three hearts and a 50-second timer per room. Rooms get busier as you go, with more and bigger furniture to crawl around, and every layout is checked so that every toy is reachable without being forced through a hazard.

Clear a room and baby breaks into a randomized victory dance, then a map shows the journey across the house before you crawl on to the next room.

## Running

No server or install needed — double-click `baby-crawl.html`, or serve the directory over HTTP:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Contents

- `index.html` — landing page with the on-screen-controls toggle.
- `baby-crawl.html` — the game.
- `touch-controls.js` — optional on-screen joystick + Mom button for touch devices.
