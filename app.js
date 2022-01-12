const fastify = require('fastify')();

fastify.register(require('./routes/v1'), { prefix: '/v1' });

const start = async (port) => {
    try {
	console.log('starting on', port);
	await fastify.listen(port);

    }
    catch (err) {
	fastify.log.error(err);
	process.exit(1);

    }

};

start(process.env.PORT || 3000);
