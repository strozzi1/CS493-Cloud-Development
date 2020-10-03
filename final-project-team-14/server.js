const express = require('express');
const morgan = require('morgan');

const api = require('./api');

const {
    connectToDB
} = require('./lib/mongo');



const { applyRateLimit } = require('./lib/redis');


const app = express();
const port = process.env.PORT || 8000;


app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));


/*
 * Apply rate limiting to the api. limits to 5 requests per minute.
 * When testing the api, comment this out and also the require above
 * to disable applyRateLimit
 */
app.use(applyRateLimit);

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', (err, req, res, next) => {
  console.error(err);
  res.status(500).send({
    error: "An error occurred.  Try again later."
  });
});

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });

});

app.use(applyRateLimit);

app.use('/', (req, res) => {
    res.status(200).send({
        msg: "Hello, World"
    });
});


connectToDB(() => {
    app.listen(port, () => {
        console.log(`== Server is running on port ${port}`);
    });
});
