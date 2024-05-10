const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

const routes = require('./routes/index');

app.use('/', routes);

app.listen(PORT);