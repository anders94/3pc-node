const restify = require('restify');
const crypto = require('crypto');
const db = require('./db');

const instance = crypto.randomUUID();
const port = process.env.PORT || 3000;

const server = restify.createServer({
    name: '3pc-node',
    version: '0.0.1'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/data/:key', async (req, res, next) => {
    const o = await db.get(req.params.key);
    console.log('GET', req.params.key, o);
    res.send(o && o.value ? o.value : '');
    return next();
});
server.put('/data/:key', async (req, res, next) => {
    const o = await db.get(req.params.key);

    if (o) {
	console.log('PUT', 'key already exists');
	res.send({error: 'key already exists'});

    }
    else {
	const o = db.put(req.params.key, {lockedBy: '', value: req.body});
	console.log('aaa', o);
	console.log('PUT', req.params.key, {lockedBy: '', value: req.body});
	res.send({success: o ? true : false});

    }
    return next();
});

server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url, instance);
});

const run = async () => {
    await db.init();

    // upsert a key called "test" so we have a reliable key
    let test = await db.get('test');

    if (!test) {
	await db.put('test', {lockedBy: '', value: instance});
	test = await db.get('test');
    }

};

run();
