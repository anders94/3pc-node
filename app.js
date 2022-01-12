const fastify = require('fastify');
const crypto = require('crypto');
const storage = require('./storage');

const instance = crypto.randomUUID();
const port = process.env.PORT || 3000;

const server = fastify({logger: true});

server.get('/data/:key', async (req, res) => {
    const o = await storage.get(req.params.key);
    console.log('GET', req.params.key, o);
    res.send(o && o.value ? o.value : '');
});

server.put('/data/:key', async (req, res) => {
    const o = await storage.get(req.params.key);

    if (o) {
	console.log('PUT', req.params.key, 'ERROR: Key already exists!');
	res.send({error: 'Key already exists!'});

    }
    else {
	const tmp = await storage.put(req.params.key, {lockedBy: '', value: req.body});
	console.log('PUT', req.params.key, {lockedBy: '', value: req.body});
	res.send({success: tmp ? true : false});

    }
});

server.post('/data/:key', async (req, res) => {
    let o = await storage.get(req.params.key);

    if (!o) {
	console.log('POST', req.params.key, 'ERROR: Key doesn\'t exist!');
	res.send({error: 'Key doesn\'t exist!'});
	return;
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
	return;
    }

    if (obj.user) {
	if (obj.command == 'lock') {
	    if (o.lockedBy == '' || o.lockedBy == obj.user) {
		o.lockedBy = obj.user;
		await storage.put(req.params.key, o);
		console.log('POST', req.params.key, obj.command, 'success');
		res.send({success: true});
	    }
	    else {
		console.log('POST', req.params.key, obj.command, 'key is locked', obj);
                res.send({success: false, reason: 'Key is already locked.'});
	    }
	}
	else if (obj.command == 'unlock') {
	    if (o.lockedBy == obj.user) {
		o.lockedBy = '';
		await storage.put(req.params.key, o);
		console.log('POST', req.params.key, obj.command, 'success');
		res.send({success: true});
            }
            else {
                console.log('POST', req.params.key, obj.command, 'key is not locked by this user', obj);
                res.send({success: false, reason: 'Key is not locked by you.'});
            }
	}
	else if (obj.command == 'update') {
	    if (o.lockedBy == obj.user) {
		o.value = obj.value;
		await storage.put(req.params.key, o);
		console.log('POST', req.params.key, obj.command, obj.value, 'success');
		res.send({success: true});
            }
            else {
                console.log('POST', req.params.key, obj.command, 'key is not locked by this user', obj);
                res.send({success: false, reason: 'Key is not locked by you.'});
            }
	}
	else if (obj.command == 'delete') {
	    if (o.lockedBy == obj.user) {
		await storage.del(req.params.key);
		console.log('POST', req.params.key, obj.command, 'success');
		res.send({success: true});
            }
            else {
                console.log('POST', req.params.key, obj.command, 'key is not locked by this user', obj);
                res.send({success: false, reason: 'Key is not locked by you.'});
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
});


const start = async (port) => {
    await storage.init();

    try {
	console.log('starting on', port);
	await server.listen(port);

    }
    catch (err) {
	server.log.error(err);
	process.exit(1);

    }

};

start(port);
