const fastify = require('fastify');
const storage = require('../../storage');

const init = require('./init');
const get = require('./get');
const put = require('./put');
const lock = require('./lock');

const post = async (request, reply) => {
    let o = await storage.get(request.params.key);

    if (!o) {
	console.log('POST', request.params.key, 'ERROR: Key doesn\'t exist!');
	reply.code(404).send({message: 'Key doesn\'t exist!'});
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
	reply.code(500).send({message: 'JSON parse error'});
	return;
    }

    if (!obj || !obj.user || !obj.command) {
	console.log('POST', request.params.key, 'Need at least a user and a command to continue');
	reply.code(412).send({message: 'Missing fields: Need at least user and command'});
	return;
    }

    switch (obj.command) {
    case 'lock':
	if (o.lockedBy == '' || o.lockedBy == obj.user) {
	    lock(request.params.key, o, obj.user);
	    console.log('POST', request.params.key, obj.command, 'success');
	    reply.send({success: true});
	}
	else {
	    console.log('POST', request.params.key, obj.command, 'key is locked', obj);
            reply.code(409).send({message: 'Key is already locked.'});
	}
	break;
    case 'unlock':
	if (o.lockedBy == obj.user) {
	    o.lockedBy = '';
	    await storage.put(request.params.key, o);
	    console.log('POST', request.params.key, obj.command, 'success');
	    reply.send({success: true});
        }
        else {
            console.log('POST', request.params.key, obj.command, 'key is not locked by this user', obj);
            reply.code(401).send({message: 'Key is not locked by you.'});
        }
	break;
    case 'update':
	if (o.lockedBy == obj.user) {
	    o.value = obj.value;
	    await storage.put(request.params.key, o);
	    console.log('POST', request.params.key, obj.command, obj.value, 'success');
	    reply.send({success: true});
        }
        else {
            console.log('POST', request.params.key, obj.command, 'key is not locked by this user', obj);
            reply.code(401).send({message: 'Key is not locked by you.'});
        }
	break;
    case 'delete':
	if (o.lockedBy == obj.user) {
	    await storage.del(request.params.key);
	    console.log('POST', request.params.key, obj.command, 'success');
	    reply.send({success: true});
        }
        else {
            console.log('POST', request.params.key, obj.command, 'key is not locked by this user', obj);
            reply.code(401).send({message: 'Key is not locked by you.'});
        }
	break;
    default:
	console.log('POST', request.params.key, obj.command, 'command not recognized');
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

