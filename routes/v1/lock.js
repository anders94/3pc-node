const storage = require('../../storage');

module.exports = async (key, o, user) => {
    o.lockedBy = user;
    await storage.put(key, o);
};
