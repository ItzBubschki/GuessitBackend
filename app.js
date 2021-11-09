const express = require('express');
require('dotenv').config()

const indexRouter = require('./routes/index');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/', indexRouter);

try {
    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}.`);
    })
} catch (e) {
    console.error(`Starting server failed with error: ${e}.`);
}
