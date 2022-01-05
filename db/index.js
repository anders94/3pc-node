const levelup = require('levelup');
const leveldown = require('leveldown');

let db;

const get = async (key) => {
    let value, err;
    try {
	const tmp = await db.get(key);
	if (tmp)
	    value = JSON.parse(tmp.toString());
    }
    catch (e) {
	if (e.type != 'NotFoundError')
	    err = e;
    }
    finally {
	return err ? err : value;
    }
};

module.exports = {
    init: () => db = levelup(leveldown('./data')),
    get: get,
    put: async (key, value) => await db.put(key, Buffer.from(JSON.stringify(value)))
};

