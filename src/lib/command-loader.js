const fs = require('fs');
const path = require('path');

function loadAll(dir) {
  const commands = {};
  function walk(d) {
    const files = fs.readdirSync(d);
    for (const f of files) {
      const full = path.join(d, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (f.endsWith('.js')) {
        try {
          const mod = require(full);
          if (mod && mod.name) commands[mod.name] = mod;
        } catch (e) {
          console.warn('Failed to load command', full, e.message);
        }
      }
    }
  }
  walk(dir);
  return commands;
}

module.exports = { loadAll };
