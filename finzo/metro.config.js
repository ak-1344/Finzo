const { withNativeWind } = require('nativewind/metro');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro's package-exports resolution can cause some dependencies (e.g. Zustand's ESM devtools)
// to be picked for the web bundle. Those builds may contain `import.meta` which browsers
// reject when the bundle is loaded as a classic `<script>` (not `type="module"`).
// Disabling package exports forces Metro to fall back to CJS entrypoints for web.
if (config?.resolver) {
  config.resolver.unstable_enablePackageExports = false;
  // Keep resolution predictable: prefer `main` over `module`/ESM for web.
  config.resolver.resolverMainFields = ['main'];
}

module.exports = withNativeWind(config, { input: './global.css' });
