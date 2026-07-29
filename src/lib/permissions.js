// simple permission helpers; in prod use proper auth & owner list
const OWNER_IDS = [];

module.exports = {
  isOwner(id) {
    return OWNER_IDS.includes(id);
  }
};
