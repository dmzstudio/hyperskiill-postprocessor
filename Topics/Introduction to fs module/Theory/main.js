// You can experiment here, it won’t be checked
const fs= require('node:fs');

const data = fs.readFile('../source.js', 'utf-8', (err, data) => {
	if (err) throw err;
	console.log(data);
});

