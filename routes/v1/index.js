const fastify = require('fastify');
const storage = require('../../storage');

const init = async () => {
    await storage.init();
};

const get = async (request, reply) => {
    const o = await storage.get(request.params.key);
    console.log('GET', request.params.key, o);
    if (o)
	reply.send(o.value);
    else
	reply.err('Key doesn\'t exist.');
};

const put = async (request, reply) => {
    const o = await storage.get(request.params.key);

    if (o) {
	console.log('PUT', request.params.key, 'ERROR: Key already exists!');
	reply.send({error: 'Key already exists!'});

    }
    else {
	const tmp = await storage.put(request.params.key, {lockedBy: '', value: request.body});
	console.log('PUT', request.params.key, {lockedBy: '', value: request.body});
	reply.send({success: tmp ? true : false});

    }
};

const post = async (request, reply) => {
    let o = await storage.get(request.params.key);

    if (!o) {
	console.log('POST', request.params.key, 'ERROR: Key doesn\'t exist!');
	reply.send({error: 'Key doesn\'t exist!'});
	return;
    }

    let obj, err;
    try {
	obj = JSON.parse(request.body);
    }
    catch (e) {
	err = 'JSON parse error';
    }

    if (err) {
	console.log('POST', request.params.key, err);
	reply.send({success: false, reason: 'JSON parse error'});
	return;
    }

    if (obj.user) {
	if (obj.command == 'lock') {
	    if (o.lockedBy == '' || o.lockedBy == obj.user) {
		o.lockedBy = obj.user;
		await storage.put(request.params.key, o);
		console.log('POST', request.params.key, obj.command, 'success');
		reply.send({success: true});
	    }
	    else {
		console.log('POST', request.params.key, obj.command, 'key is locked', obj);
                reply.send({success: false, reason: 'Key is already locked.'});
	    }
	}
	else if (obj.command == 'unlock') {
	    if (o.lockedBy == obj.user) {
		o.lockedBy = '';
		await storage.put(request.params.key, o);
		console.log('POST', request.params.key, obj.command, 'success');
		reply.send({success: true});
            }
            else {
                console.log('POST', request.params.key, obj.command, 'key is not locked by this user', obj);
                reply.send({success: false, reason: 'Key is not locked by you.'});
            }
	}
	else if (obj.command == 'update') {
	    if (o.lockedBy == obj.user) {
		o.value = obj.value;
		await storage.put(request.params.key, o);
		console.log('POST', request.params.key, obj.command, obj.value, 'success');
		reply.send({success: true});
            }
            else {
                console.log('POST', request.params.key, obj.command, 'key is not locked by this user', obj);
                reply.send({success: false, reason: 'Key is not locked by you.'});
            }
	}
	else if (obj.command == 'delete') {
	    if (o.lockedBy == obj.user) {
		await storage.del(request.params.key);
		console.log('POST', request.params.key, obj.command, 'success');
		reply.send({success: true});
            }
            else {
                console.log('POST', request.params.key, obj.command, 'key is not locked by this user', obj);
                reply.send({success: false, reason: 'Key is not locked by you.'});
            }
	}
	else {
	    console.log('POST', request.params.key, obj.command, 'command unsupported');
	    reply.send({success: false, reason: 'command unsupported'});
	}
    }
    else {
	console.log('POST', request.params.key, obj.command, 'no user given');
	reply.send({success: false, reason: 'no user given'});
    }
};

init();

module.exports = function (fastify, opts, done) {
    fastify.get('/data/:key', get);
    fastify.put('/data/:key', put);
    fastify.post('/data/:key', post);
    done();
}

