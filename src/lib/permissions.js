// src/lib/permissions.js
// simple permission helpers; edit OWNER_IDS to include bot owners (serialized WA ids)
const OWNER_IDS = [
  '6282381215184@c.us',
  '6282172992548@c.us'
];

module.exports = {
  isOwner(id) {
    return OWNER_IDS.includes(id);
  },
  getOwners() {
    return OWNER_IDS.slice();
  }
};
