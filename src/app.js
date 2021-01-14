import { Component } from 'react'
import React from 'react'

const e = React.createElement;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { parsed: {}, iteration: 0 };

        this.ws = new WebSocket("wss://!serveruri!.herokuapp.com/?gui=gg");
        this.ws.onopen = e => {
            console.log("Connected to live ws");
        };
        this.ws.onmessage = message => {
            this.setState({ parsed: JSON.parse(message.data), iteration: this.state.iteration + 1 })
        };
        this.ws.onclose = e => {
            console.log("Disconnected from live ws");
        };
        this.ws.onerror = error => {
            console.log("An error occoured while connecting to the ws", error);
        };
        this.latencyMinusInterval = null
        this.latencyPlusInterval = null
    }

    componentWillUnmount() {
        try {
            this.ws.close()
        } catch (error) {

        }
    }

    render() {
        try {
            var cardsArray = Object.keys(this.state.parsed).map(key => {
                let profile = this.state.parsed[key]
                let hash = key.split('__')[0]
                let wname = key.split('__')[1]
                let fname = key.split('__')[2]
                return e(
                    "li",
                    { className: "list-group-item border-0", key: key },
                    e(
                        "div",
                        { className: "card text-white bg-info" }, //bg-dark mb-3
                        e(
                            "div",
                            { className: "card-body my-3" },
                            e("h5", { className: "card-title" }, fname),
                            e(
                                "h5",
                                { className: "card-text" },
                                `Current Latency:${profile.latency}`,
                                <br />,
                                `Activated:${profile.activated}`,
                                <br />,
                                `Down Limited:${profile.down}`,
                                <br />,
                                `Up Limited:${profile.up}`
                            ),
                            e(
                                "button",
                                {
                                    className: 'btn btn-dark',
                                    onPointerDown: () => {
                                        this.latencyPlusInterval = setInterval(() => {
                                            var state = this.state.parsed[key]
                                            if(state.latency < 2000) {
                                                state.latency += 1
                                            }
                                            this.ws.send(JSON.stringify({
                                                id: key,
                                                state: state
                                            }))
                                        }, 150)
                                    },
                                    onPointerUp: () => {
                                        try {
                                            clearInterval(this.latencyPlusInterval)
                                        } catch {
                                            
                                        }
                                    }
                                },
                                `Latency++`
                            ),
                            e(
                                "button",
                                {
                                    className: 'btn btn-dark',
                                    onPointerDown: () => {
                                        this.latencyMinusInterval = setInterval(() => {
                                            var state = this.state.parsed[key]
                                            if(state.latency > 0) {
                                                state.latency -= 1
                                            }
                                            
                                            this.ws.send(JSON.stringify({
                                                id: key,
                                                state: state
                                            }))
                                        }, 150)
                                    },
                                    onPointerUp: () => {
                                        try {
                                            clearInterval(this.latencyMinusInterval)
                                        } catch {
                                            
                                        }
                                    }
                                },
                                `Latency--`
                            ),
                            e(
                                "button",
                                {
                                    className: 'btn btn-dark',
                                    onClick: () => {
                                        var state = profile
                                        state.activated = !profile.activated
                                        this.ws.send(JSON.stringify({
                                            id: key,
                                            state: state
                                        }))
                                    }
                                },
                                `${(profile.activated ? 'Deactivate' : 'Activate')}`
                            ),
                            e(
                                "button",
                                {
                                    className: 'btn btn-dark',
                                    onClick: () => {
                                        var state = profile
                                        state.up = !profile.up
                                        this.ws.send(JSON.stringify({
                                            id: key,
                                            state: state
                                        }))
                                    }
                                },
                                `${(profile.up ? 'De-l' : 'L')}imit up`
                            ),
                            e(
                                "button",
                                {
                                    className: 'btn btn-dark',
                                    onClick: () => {
                                        var state = profile
                                        state.down = !profile.down
                                        this.ws.send(JSON.stringify({
                                            id: key,
                                            state: state
                                        }))
                                    }
                                },
                                `${(profile.down ? 'De-l' : 'L')}imit down`
                            ),
                            e(
                                "button",
                                {
                                    className: 'btn btn-dark',
                                    onClick: () => {
                                        this.ws.send(JSON.stringify({
                                            id: key,
                                            state: {
                                                latency: 0,
                                                activated: false,
                                                up: false,
                                                down: false
                                            }
                                        }))
                                    }
                                },
                                'Reset'
                            )
                        ),

                        e(
                            "div",
                            { className: "card-footer text-muted" },
                            wname
                        )
                    )
                )
            }
            );


            return (
                e(
                    'div',
                    { className: 'container text-center' },
                    e(
                        'h1',
                        { className: 'mt-5 text-white font-weight-light' }
                    ),
                    e(
                        'ul',
                        { className: 'list-group list-group-horizontal align-items-stretch flex-wrap' },
                        cardsArray
                    )
                )
            );
        } catch (error) {
            console.log(error)
        }
        return "errore";
    }
}

export default App;
