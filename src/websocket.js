const IDLE_INTERVAL   = 60 * 1000     // 60s
const RECONNECT_DELAY =  5 * 1000     // 5s

/**
 * A WebSocket connection to the DMX server.
 *
 * The URL to connect to is determined automatically, based on the server-side `dmx.websockets.url` config property.
 * WebSocket messages are expected to be JSON. Serialization/Deserialization performs automatically.
 *
 * Properties:
 *   `url` - url of the WebSocket server
 *   `ws`  - the native WebSocket object
 */
export default class DMXWebSocket {

  /**
   * @param   messageHandler
   *              the function that processes incoming messages.
   *              One argument is passed: the message pushed by the server (a deserialzed JSON object).
   */
  constructor (config, messageHandler) {
    this.messageHandler = messageHandler
    config.then(config => {
      this.url = config['dmx.websockets.url']
      // DEV && console.log('[DMX] CONFIG: WebSocket server is reachable at', this.url)
      this._connect()
    })
  }

  /**
   * Sends a message to the server.
   *
   * @param   message   the message to be sent (arbitrary type). Will be serialized as JSON.
   */
  send (message) {
    this.ws.send(JSON.stringify(message))
  }

  _connect () {
    DEV && console.log('[DMX] Opening WebSocket connection to', this.url)
    this.ws = new WebSocket(this.url)
    this.ws.onopen = e => {
      this._startIdling()
    }
    this.ws.onmessage = e => {
      const message = JSON.parse(e.data)
      DEV && console.log('[DMX] Receiving message', message)
      this.messageHandler(message)
    }
    this.ws.onclose = e => {
      DEV && console.log('[DMX] Closing WebSocket connection (' + e.reason + '), try reconnect in ' +
        RECONNECT_DELAY / 1000 + ' seconds')
      this._stopIdling()
      this._reconnect()
    }
    this.ws.onerror = e => {
      DEV && console.warn('[DMX] WebSocket error')
    }
  }

  _reconnect () {
    setTimeout(this._connect.bind(this), RECONNECT_DELAY)
  }

  _startIdling () {
    this.idleId = setInterval(this._idle.bind(this), IDLE_INTERVAL)
  }

  _stopIdling () {
    clearInterval(this.idleId)
  }

  _idle () {
    DEV && console.log('[DMX] WebSocket connection idle')
    this.send({type: 'idle'})
  }
}
