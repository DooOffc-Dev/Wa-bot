const fs = require('fs');
const path = require('path');

function loadAll(dir) {
  const commands = {};
  function walk(d) {
    if (!fs.existsSync(d)) return;
    const files = fs.readdirSync(d);
    for (const f of files) {
      const full = path.join(d, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (f.endsWith('.js')) {
        try {
          // clear cache so reloads pick up changes during dev
          delete require.cache[require.resolve(full)];
          const mod = require(full);
          if (mod && mod.name) commands[mod.name] = mod;
        } catch (e) {
          console.warn('Failed to load command', full, e.message);
        }
      }
    }
  }
  walk(dir);
  // also load plugins if sibling folder exists: ../pelugins or ../plugins
  const pluginsDir = path.join(path.dirname(dir), 'pelugins');
  if (pluginsDir !== dir) walk(pluginsDir);
  return commands;
}

module.exports = { loadAll };
