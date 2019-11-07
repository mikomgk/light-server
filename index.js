const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const helmet = require('helmet')

const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const port = process.env.PORT || 3000
const ifttUrl = 'https://maker.ifttt.com/trigger/lights_on/with/key/cTIW3rbhvRL3ZImLSfrg1x'
let counter = 0
const maxCounter = 2
const minCounter = 0
let stopTime = 0

app.get('/', (req, res) => {
    res.send(`${counter}`)
})

app.get('/set', (req, res) => {
    let c = req.query.counter
    if (c && parseInt(c)) {
        counter = c
        checkCounter()
    }
    res.send(`counter set to ${counter}`)
})

app.get('/plus', (req, res) => {
    if (counter++ === 0 && isTimeOkForLights()) {
        console.log(`will do lights`)
        switchLights()
    }
    checkCounter()
    res.send(`counter set to ${counter}`)
});

app.get('/minus', (req, res) => {
    counter--
    checkCounter()
    res.send(`counter set to ${counter}`)
});

app.get('/stop', (req, res) => {
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