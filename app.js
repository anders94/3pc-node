const restify = require('restify');
const db = require('./db');

const port = process.env.PORT || 3000;

const server = restify.createServer({
    name: '3pc-node',
    version: '0.0.1'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/backend/:key', async (req, res, next) => {
    const o = await db.get(req.params.key);

    console.log(req.params.key, o);

    res.send(o && o.value ? o.value : '');
    return next();
});

server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});

const run = async () => {
    await db.init();

    // upsert a key called "test" so we always have something to play with
    let test = await db.get('test');

    if (!test) {
	await db.put('test', {lockedBy: '', value: 'some data'});
	test = await db.get('test');
    }

};

run();
