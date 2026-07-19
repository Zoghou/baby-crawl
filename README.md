# 👶 Baby's First Crawl

A small browser game: baby crawls around the house hunting for toys, navigating furniture and avoiding the things that shouldn't go in their mouth. Three self-contained variants, no build step — open an `.html` file in a browser and play.

**▶ Play: <https://zoghou.github.io/baby-crawl/>**

## The variants

| File | What it is |
|---|---|
| `baby-crawl.html` | The original 2D game. 60 seconds per room, gentler obstacle and hazard counts. |
| `baby-crawl-hard.html` | Hard mode. 50 seconds per room, more furniture, more toys to find, more hazards. |
| `baby-crawl-3d.html` | 3D version rendered with three.js. 50 seconds per room, toys unlock progressively as you advance. |

## Controls

- **WASD** or **Arrow keys** — crawl
- **Space** — call Mom

### On a phone

All three variants take touch input. An on-screen joystick (8-way, so diagonals work) sits bottom-left and a **MOM** button bottom-right.

They appear automatically on any device reporting a coarse pointer, and the toggle on the landing page overrides that either way — useful for testing touch controls on a desktop, or turning them off on a tablet with a keyboard. The choice is remembered in `localStorage`. You can also force it per-page with `?touch=1` or `?touch=0`.

`touch-controls.js` works by synthesizing the same `keydown`/`keyup` events the games already listen for, so the game code itself has no knowledge of touch and needed no changes.

## Playing

Each room has a finite number of toys; collecting all of them clears the room and is the maximum score for it. You have three hearts and a per-room timer. Rooms get busier as you go — more furniture to crawl around and more hazards to keep out of baby's mouth.

## Running

No server or install needed for the 2D versions — double-click the file.

`baby-crawl-3d.html` loads `three.min.js` from the same directory, which is vendored in this repo. Some browsers restrict local file loading, so if the 3D version shows a blank screen, serve the directory over HTTP instead:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000/baby-crawl-3d.html>.

## Contents

- `three.min.js` — vendored [three.js](https://threejs.org/) build, required by the 3D version.
