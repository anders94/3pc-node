const clients = require('restify-clients');

const url = process.env.URL || 'http://localhost:3000';
const path = process.argv[2] || '/backend/test';

const client = clients.createJsonClient({
    url: url,
    version: '~1.0'
});

console.log('GET', url+path);
client.get(path, (err, req, res, obj) => {
    console.log(err, obj);
});
