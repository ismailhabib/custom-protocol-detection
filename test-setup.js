const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname)));

app.listen(8080, () => {
	console.log('Listening on Port 8080')
})
