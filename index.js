const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const helmet = require('helmet')
const bcrypt = require('bcrypt')

require('dotenv').config({path: '.env'})

const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use((req, res, next) => {
    const key = req.body.key || req.query.key || ''
    const hash = process.env.MY_HASH_KEY
    if (bcrypt.compareSync(key, hash)) {
        next()
    } else {
        console.log(`Got wrong key: ${key}`)
        res.status(401).send()
    }
})

const port = process.env.PORT || 3000
const ifttUrl = 'https://maker.ifttt.com/trigger/lights_on/with/key/cTIW3rbhvRL3ZImLSfrg1x'
let counter = 0
const maxCounter = 2
const minCounter = 0
let stopTime = 0

app.get('/isup', (req, res) => {
    res.json({isUp: true})
})
app.get('/', (req, res) => {
    res.send(
        `<body style="background-color: rgb(32, 33, 36)">
            <h1 style="text-align: center;color: rgb(154, 160, 166)">
                MIKOs.CLUB
            </h1>
        </body>`
    )
})

app.post('/get', (req, res) => {
    res.send(`${counter}`)
})

app.post('/set', (req, res) => {
    let c = req.body.counter
    if (c && parseInt(c)) {
        counter = c
        checkCounter()
    }
    res.send(`counter set to ${counter}`)
})

app.post('/plus', (req, res) => {
    if (counter++ === 0 && isTimeOkForLights()) {
        console.log(`will do lights`)
        switchLights()
    }
    checkCounter()
    res.send(`counter set to ${counter}`)
});

app.post('/minus', (req, res) => {
    counter--
    checkCounter()
    res.send(`counter set to ${counter}`)
});

app.post('/stop', (req, res) => {
    stopTime = Date.now()
    res.send(`updated stop time to ${stopTime}`)
});

function checkCounter() {
    if (counter > maxCounter)
        counter = maxCounter
    if (counter < minCounter)
        counter = minCounter
}

function switchLights() {
    console.log(`do lights`)
    request(ifttUrl, {json: true}, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        console.log(`did lights`)
        console.log(body.url);
        console.log(body.explanation);
    })
}

function isTimeOkForLights() {
    const temMinutesInMilliSeconds = 1000 * 60 * 10
    return Date.now() > stopTime + temMinutesInMilliSeconds
}

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})