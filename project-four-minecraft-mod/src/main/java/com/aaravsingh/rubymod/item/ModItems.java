package com.aaravsingh.rubymod.item;

import com.aaravsingh.rubymod.RubyMod;
import net.fabricmc.fabric.api.itemgroup.v1.ItemGroupEvents;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.food.FoodProperties;
import net.minecraft.world.item.CreativeModeTabs;
import net.minecraft.world.item.Item;

/**
 * Declares and registers every item Ruby Mod adds.
 *
 * <ul>
 *   <li>{@link #RUBY} — a plain crafting material.</li>
 *   <li>{@link #RUBY_APPLE} — a food item ({@code apple} surrounded by 8 rubies,
 *       see {@code data/rubymod/recipes/ruby_apple.json}).</li>
 * </ul>
 */
public final class ModItems {
	private ModItems() {
	}

	/** Nutrition/saturation profile for the Ruby Apple — a touch better than a golden apple's hunger value. */
	private static final FoodProperties RUBY_APPLE_FOOD = new FoodProperties.Builder()
			.nutrition(6)
			.saturationMod(1.2f)
			.alwaysEat()
			.build();

	public static final Item RUBY = register("ruby", new Item(new Item.Properties()));

	public static final Item RUBY_APPLE = register("ruby_apple",
			new Item(new Item.Properties().food(RUBY_APPLE_FOOD)));

	private static Item register(String path, Item item) {
		return Registry.register(BuiltInRegistries.ITEM, RubyMod.id(path), item);
	}

	/** Called from {@link RubyMod#onInitialize()} — forces class-loading so the static fields above run. */
	public static void register() {
		RubyMod.LOGGER.info("Registering {} items", RubyMod.MOD_ID);

		// Put the items in the vanilla creative menu.
		ItemGroupEvents.modifyEntriesEvent(CreativeModeTabs.INGREDIENTS)
				.register(entries -> entries.accept(RUBY));

		ItemGroupEvents.modifyEntriesEvent(CreativeModeTabs.FOOD_AND_DRINKS)
				.register(entries -> entries.accept(RUBY_APPLE));
	}
}
