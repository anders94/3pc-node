const fastify = require('fastify');
const storage = require('../../storage');

const Queue = require('../../Queue');

const queue = new Queue();

/*
const f = (res) => console.log('f', res);

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

queue.enqueue(async () => {
    f('start put');
    await db.put('test', Buffer.from(new Date())),
    await timeout(500);
    f('put the date');
});
*/

const init = require('./init');
const get = require('./get');
const put = require('./put');
const lock = require('./lock');

const post = async (request, reply) => {
    let data = await storage.get(request.params.key);

    if (!data) {
	console.log('POST', request.params.key, 'ERROR: Key doesn\'t exist!');
	reply.code(404).send({message: 'Key doesn\'t exist!'});
	return;
    }

    let payload, err;
    try {
	payload = JSON.parse(request.body);
    }
    catch (e) {
	err = 'JSON parse error';
    }

    if (err) {
	console.log('POST', request.params.key, err);
	reply.code(500).send({message: 'JSON parse error'});
	return;
    }

    if (!payload || !payload.user || !payload.command) {
	console.log('POST', request.params.key, 'Need at least a user and a command to continue');
	reply.code(412).send({message: 'Missing fields: Need at least user and command'});
	return;
    }

    switch (payload.command) {
    case 'lock':
	if (data.lockedBy.length == 0 || data.lockedBy[0] == payload.user) {
	    lock(request.params.key, data, payload.user);
	    console.log('POST', request.params.key, payload.command, 'success');
	    reply.send({success: true});
	}
	else { // add us to the lock queue and don't return yet - start listening on key?
	    console.log('POST', request.params.key, payload.command, 'key is locked', payload);
            reply.code(409).send({message: 'Key is already locked.'});
	}
	break;
    case 'unlock':
	if (data.lockedBy[0] == payload.user) {
	    data.lockedBy.shift(); // remove the first element
	    await storage.put(request.params.key, o);
	    console.log('POST', request.params.key, payload.command, 'success');
	    reply.send({success: true});
        }
        else {
            console.log('POST', request.params.key, payload.command, 'key is not locked by this user', payload);
            reply.code(401).send({message: 'Key is not locked by you.'});
        }
	break;
    case 'update':
	if (data.lockedBy == payload.user) {
	    data.value = payload.value;
	    await storage.put(request.params.key, o);
	    console.log('POST', request.params.key, payload.command, payload.value, 'success');
	    reply.send({success: true});
        }
        else {
            console.log('POST', request.params.key, payload.command, 'key is not locked by this user', payload);
            reply.code(401).send({message: 'Key is not locked by you.'});
        }
	break;
    case 'delete':
	if (data.lockedBy == payload.user) {
	    await storage.del(request.params.key);
	    console.log('POST', request.params.key, payload.command, 'success');
	    reply.send({success: true});
        }
        else {
            console.log('POST', request.params.key, payload.command, 'key is not locked by this user', payload);
            reply.code(401).send({message: 'Key is not locked by you.'});
        }
	break;
    default:
	console.log('POST', request.params.key, payload.command, 'command not recognized');
	reply.code(400).send({message: 'Command not recognized'});
    }
};

init();

module.exports = function (fastify, opts, done) {
    fastify.get('/data/:key', get);
    fastify.put('/data/:key', put);
    fastify.post('/data/:key', post);
    done();
}
