const crypto = require('crypto');

const url = process.env.URL || 'http://localhost:3000';
const path = process.argv[2] || '/v1/data/test';
//const instance = crypto.randomUUID();
const instance = '1873e836-2fd8-4eee-a02c-35822ae99b8b';

let fetch;

const get = async (key) => {
    const res = await fetch(url + path);
    return res.text();
};
    
const start = async () => {
    fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    let res;
    res = await fetch(url + path, {
	method: 'PUT',
	body: 'some sample data ' + new Date()
    });
    console.log('PUT', url + path, await res.text());
    
    res = await get(path);
    console.log('GET', url + path, res);

    res = await fetch(url + path, {
	method: 'POST',
	body: JSON.stringify({user: instance, command: 'lock'})
    });
    console.log('PUT', url + path, await res.text());

    res = await fetch(url + path);
    console.log('GET', url + path, await res.text());

};

start();
