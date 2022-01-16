const storage = require('../../storage');

module.exports = async (request, reply) => {
    const o = await storage.get(request.params.key);
    console.log('GET', request.params.key, o);
    if (o)
	reply.send(o.value);
    else
	reply.err('Key doesn\'t exist.');
};
