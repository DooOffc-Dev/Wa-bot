// src/lib/permissions.js
// load owners from config
const config = require('../config');

module.exports = {
  isOwner(id) {
    return config.owners.includes(id);
  },
  getOwners() {
    return config.owners.slice();
  }
};
