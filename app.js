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
	console.log('PUT', req.params.key, 'ERROR: Key already exists!');
	res.send({error: 'Key already exists!'});

    }
    else {
	const tmp = db.put(req.params.key, {lockedBy: '', value: req.body});
	console.log('PUT', req.params.key, {lockedBy: '', value: req.body});
	res.send({success: tmp ? true : false});

    }
    return next();
});
server.post('/data/:key', async (req, res, next) => {
    let o = await db.get(req.params.key);

    if (!o) {
	console.log('POST', req.params.key, 'ERROR: Key doesn\'t exist!');
	res.send({error: 'Key doesn\'t exist!'});
	return next();
    }

    let obj, err;
    try {
	obj = JSON.parse(req.body);
    }
    catch (e) {
	err = 'JSON parse error';
    }

    if (err) {
	console.log('POST', req.params.key, err);
	res.send({success: false, reason: 'JSON parse error'});
	return next();
    }

    if (obj.user) {
	if (obj.command == 'lock') {
	    if (o.lockedBy == '' || o.lockedBy == obj.user) {
		o.lockedBy = obj.user;
		db.put(req.params.key, o);
		console.log('POST', req.params.key, obj.command, 'success');
		res.send({success: true});
	    }
	    else {
		console.log('POST', req.params.key, obj.command, 'key is locked', obj);
                res.send({success: false, reason: 'Key is already locked.'});
	    }
	}
	else {
	    console.log('POST', req.params.key, obj.command, 'command unsupported');
	    res.send({success: false, reason: 'command unsupported'});
	}
    }
    else {
	console.log('POST', req.params.key, obj.command, 'no user given');
	res.send({success: false, reason: 'no user given'});
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
