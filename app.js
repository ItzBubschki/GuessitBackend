const express = require('express');
const cors = require('cors');
require('dotenv').config()

const indexRouter = require('./routes/index');

const app = express();
const PORT = 3000;

const corsOptions = {
    origin: `http://localhost:3001`,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/', indexRouter);

try {
    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}.`);
    })
} catch (e) {
    console.error(`Starting server failed with error: ${e}.`);
}
