const express = require('express')
const app = require('express-ws')(express()).app
var states = {}

app.use("/", express.static(__dirname + "/public/"))
app.use("/dist", express.static(__dirname + "/dist/"))

app.ws("/", (client, request) => {
    if (typeof (request.headers['x-hash']) == 'string' && typeof (request.headers['x-wn']) == 'string' && typeof (request.headers['x-fn']) == 'string') {
        var slaveId = `${request.headers['x-wn']}__${request.headers['x-fn']}_${x-hash}`
        var lastPing = Date.now()
        console.log('Slave connected:', slaveId)

        states[slaveId] = {
            latency: 0,
            activated: false,
            up: false,
            down: false
        }

        const interval = setInterval(() => {
            if(client.readyState == client.OPEN && Date.now() - lastPing < 5000) {
                try {
                    client.send(JSON.stringify(states[slaveId]))
                } catch {
                    clearInterval(interval)
                    try {
                        delete states[slaveId]
                    } catch {
        
                    }
                }
            } else {
                clearInterval(interval)
                try {
                    delete states[slaveId]
                } catch {
    
                }
            }
        }, 250)

        client.on('close', () => {
            try {
                delete states[slaveId]
            } catch {

            }
        })

        client.on('message', msg => {
            lastPing = Date.now()
        })
    } else if(request.query.gui) {
        console.log('Gui Connected')

        client.on('message', newState => {
            var parsed = JSON.parse(newState.toString())

            if(typeof(parsed.id) == 'string' & typeof(parsed.state) == 'object') {
                states[parsed.id] = parsed.state
            } else {
                console.log('Unknown GUI New State Received:', parsed.state)
            }
        })

        const interval = setInterval(() => {
            if(client.readyState == client.OPEN) {
                try {
                    client.send(JSON.stringify(states))
                } catch {
                    clearInterval(interval)
                }
            } else {
                clearInterval(interval)
            }
        }, 250)
    }
    else {
        console.log('Unknown Client Connected. Aborting...')
        client.close()
    }
})
function isHeroku() {
    return process.env.NODE && ~process.env.NODE.indexOf("heroku") ? true : false
}
const listener = app.listen(isHeroku() ? process.env.PORT : 80, function () {
    console.log("Listening on port " + listener.address().port)
})