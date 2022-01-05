const clients = require('restify-clients');
const crypto = require('crypto');

const url = process.env.URL || 'http://localhost:3000';
const path = process.argv[2] || '/data/test';
//const instance = crypto.randomUUID();
const instance = '1873e836-2fd8-4eee-a02c-35822ae99b8b';

const client = clients.createJsonClient({
    url: url,
    version: '~1.0'
});

/*
console.log('GET', url+path);
client.get(path, (err, req, res, obj) => {
    console.log(err, obj);
});
*/

/*
console.log('PUT', url+path);
client.put(path, 'something from the client', (err, req, res, obj) => {
    console.log(err, obj);
});
*/

console.log('POST', url+path);
client.post(path, JSON.stringify({user: instance, command: 'lock'}), (err, req, res, obj) => {
    console.log(err, obj);
});
