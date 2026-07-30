const fs = require('fs');
const path = require('path');
const DB = require('./db');

module.exports = {
  log(groupId, entry) {
    const logs = DB.get('logs') || {};
    logs[groupId] = logs[groupId] || [];
    logs[groupId].push({ ts: Date.now(), ...entry });
    DB.set('logs', logs);
  },
  list(groupId) {
    const logs = DB.get('logs') || {};
    return logs[groupId] || [];
  }
};
