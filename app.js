const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('project started')
})

app.listen(3000, () => {
    console.log('CONNECTION IS OPEN ON PORT 3000!');
})