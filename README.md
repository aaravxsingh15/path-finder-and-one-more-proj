# path-finder-and-one-more-proj

Two projects from the "code in a day" list, each in its own folder.

| # | Folder | Language | What it does |
|---|--------|----------|--------------|
| 1 | [`project-one-album-finder/`](project-one-album-finder/) | JavaScript | Web app that lists every album an artist has on Spotify, via the Spotify Web API |
| 4 | [`project-four-minecraft-mod/`](project-four-minecraft-mod/) | Java | Fabric mod for Minecraft 1.20.1 that adds a custom **Ruby** item and an edible **Ruby Apple** |

Each folder has its own `README.md` with setup and run instructions.

## Quick start

**Project 1 — Album Finder**
```bash
cd project-one-album-finder
python -m http.server 5173      # then open http://localhost:5173
```
You'll need free Spotify API credentials — see that folder's README.

**Project 4 — Minecraft Mod**
```bash
cd project-four-minecraft-mod
./gradlew build                 # gradlew.bat build on Windows
# jar -> build/libs/rubymod-1.0.0.jar
```
