package com.aaravsingh.rubymod;

import com.aaravsingh.rubymod.item.ModItems;
import net.fabricmc.api.ModInitializer;
import net.minecraft.resources.ResourceLocation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Entry point for Ruby Mod.
 *
 * <p>Fabric calls {@link #onInitialize()} once, early in startup, on both the
 * client and the dedicated server. All this mod does is register two items —
 * see {@link ModItems}.
 */
public class RubyMod implements ModInitializer {
	public static final String MOD_ID = "rubymod";
	public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

	@Override
	public void onInitialize() {
		LOGGER.info("Ruby Mod initializing");
		ModItems.register();
	}

	/** Builds a {@code rubymod:<path>} identifier. */
	public static ResourceLocation id(String path) {
		return new ResourceLocation(MOD_ID, path);
	}
}
