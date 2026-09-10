# Project 4 — Minecraft Mod (Ruby Mod)

A [Fabric](https://fabricmc.net/) mod for **Minecraft 1.20.1** that adds a custom
item (two, actually):

| Item           | Type              | Notes                                                        |
|----------------|-------------------|-------------------------------------------------------------|
| **Ruby**       | crafting material | shows up in the *Ingredients* creative tab                  |
| **Ruby Apple** | food              | `nutrition 6`, `saturation 1.2`, always edible; craftable   |

![lang](https://img.shields.io/badge/Java-17-orange) ![loader](https://img.shields.io/badge/Fabric-1.20.1-blue) [![build](https://github.com/aaravxsingh15/path-finder-and-one-more-proj/actions/workflows/minecraft-mod.yml/badge.svg)](https://github.com/aaravxsingh15/path-finder-and-one-more-proj/actions/workflows/minecraft-mod.yml)

## Craft a Ruby Apple

```
R R R        R = rubymod:ruby
R A R        A = minecraft:apple
R R R    ->  1x Ruby Apple
```

Rubies themselves are creative-only — grab them from the Ingredients tab or with
`/give @s rubymod:ruby`.

## Build

You need a JDK (17 or newer — 21+ recommended; the CI builds on JDK 25). Gradle
and the correct toolchain are fetched automatically by the wrapper.

```bash
# from inside project-four-minecraft-mod/
./gradlew build          # macOS / Linux
gradlew.bat build        # Windows
```

The finished mod jar lands in `build/libs/rubymod-1.0.0.jar`.

## Run it in a dev client

```bash
./gradlew runClient
```

This launches Minecraft 1.20.1 with the mod (and Fabric API) already loaded.
Open the creative inventory → Ingredients tab → the Ruby is there.

## Install into a normal Minecraft

1. Install the [Fabric Loader](https://fabricmc.net/use/installer/) for 1.20.1.
2. Drop these two jars into `.minecraft/mods/`:
   - `rubymod-1.0.0.jar` (from `build/libs/`)
   - [Fabric API](https://modrinth.com/mod/fabric-api/versions?g=1.20.1) for 1.20.1

## Project layout

```
src/main/java/com/aaravsingh/rubymod/
  RubyMod.java            # ModInitializer entry point
  item/ModItems.java      # registers RUBY + RUBY_APPLE, adds them to creative tabs
src/main/resources/
  fabric.mod.json         # mod metadata + entrypoint
  assets/rubymod/
    lang/en_us.json       # display names
    models/item/*.json    # flat "generated" item models
    textures/item/*.png   # 16x16 textures
  data/rubymod/recipes/
    ruby_apple.json       # the crafting recipe above
```

## How an item gets added (the short version)

1. `new Item(new Item.Properties())` — create the item instance.
2. `Registry.register(BuiltInRegistries.ITEM, id, item)` — give it an ID.
3. `ItemGroupEvents.modifyEntriesEvent(...)` — put it in a creative tab (Fabric API).
4. A model JSON + texture PNG so it renders.
5. A lang entry so it has a readable name.

All of that lives in [`ModItems.java`](src/main/java/com/aaravsingh/rubymod/item/ModItems.java).

## Mappings

This uses **official Mojang mappings** (`loom.officialMojangMappings()`), so the
Minecraft class names in the code (`Item`, `ResourceLocation`, `CreativeModeTabs`)
match Mojang's own names. Many older tutorials use Yarn mappings instead, where
the same classes are called `Item`, `Identifier`, `ItemGroups`.
