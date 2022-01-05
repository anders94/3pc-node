const db = require('./db');

const run = async () => {
    await db.init();

    let info = await db.get('info');

    if (!info) {
	await db.put('info', {type: 'follower'});
	info = await db.get('info');
    }

    console.log('info', info);
};

run();
