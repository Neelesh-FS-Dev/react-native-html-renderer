import type { CustomRenderer, RendererPlugin } from '../types';

const globalRenderers = new Map<string, CustomRenderer>();
const installedPlugins = new Map<string, RendererPlugin>();

/** Register a renderer globally for a given tag. */
export function registerRenderer(tag: string, renderer: CustomRenderer): void {
  globalRenderers.set(tag.toLowerCase(), renderer);
}

/** Remove a global renderer for a given tag. */
export function unregisterRenderer(tag: string): void {
  globalRenderers.delete(tag.toLowerCase());
}

/** Install a plugin. No-op if a plugin with the same name is already installed. */
export function installPlugin(plugin: RendererPlugin): void {
  if (installedPlugins.has(plugin.name)) return;
  installedPlugins.set(plugin.name, plugin);
  if (plugin.renderers) {
    for (const [tag, r] of Object.entries(plugin.renderers)) {
      globalRenderers.set(tag.toLowerCase(), r);
    }
  }
  plugin.setup?.();
}

/** Uninstall a plugin by name. */
export function uninstallPlugin(name: string): void {
  const plugin = installedPlugins.get(name);
  if (!plugin) return;
  installedPlugins.delete(name);
  if (plugin.renderers) {
    for (const tag of Object.keys(plugin.renderers)) {
      globalRenderers.delete(tag.toLowerCase());
    }
  }
  plugin.teardown?.();
}

/** Snapshot of global renderers. Used by HtmlRenderer to merge with per-instance renderers. */
export function getGlobalRenderers(): Record<string, CustomRenderer> {
  const out: Record<string, CustomRenderer> = {};
  for (const [tag, r] of globalRenderers) out[tag] = r;
  return out;
}

/** Clear all registered renderers and plugins (useful for tests). */
export function clearPluginRegistry(): void {
  for (const plugin of installedPlugins.values()) {
    plugin.teardown?.();
  }
  installedPlugins.clear();
  globalRenderers.clear();
}
