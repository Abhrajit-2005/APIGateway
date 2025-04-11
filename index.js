const express = require('express')
const morgan = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware')
const rateLimiter = require('express-rate-limit')
const axios = require('axios')
const bodyparser = require('body-parser')

const app = express();
const { PORT } = require('./server_config');

const limiter = rateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 5
})

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(morgan('combined'));
app.use(limiter);

app.use('/bookingservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:5000/api/v1/isAuth', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if (response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
})

app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:6000/', changeOrigin: true }))


app.listen(PORT, () => {
    console.log(`SERVER STARTED AT ${PORT}....`);
})