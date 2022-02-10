const storage = require('../../storage');

module.exports = async (request, reply) => {
    const o = await storage.get(request.params.key);

    if (o) {
	console.log('PUT', request.params.key, 'ERROR: Key already exists!');
	reply.send({error: 'Key already exists!'});

    }
    else {
	const tmp = await storage.put(request.params.key, {lockedBy: '', value: request.body});
	console.log('PUT', request.params.key, {lockedBy: [], value: request.body});
	reply.send({success: tmp ? true : false});

    }
};
