const storage = require('../../storage');

module.exports = async () => {
    await storage.init();
};
