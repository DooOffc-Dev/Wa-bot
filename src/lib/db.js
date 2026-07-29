const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'database.json');

function _read() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}
function _write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  get(key) {
    const db = _read();
    return db[key];
  },
  set(key, value) {
    const db = _read();
    db[key] = value;
    _write(db);
  },
  pushToArray(key, value) {
    const db = _read();
    db[key] = db[key] || [];
    db[key].push(value);
    _write(db);
  }
};
