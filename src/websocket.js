const HEARTBEAT_INTERVAL = 25 * 1000     // 25s

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
   * @param   config
   *              a promise for an object having a `dmx.websockets.url` property.
   * @param   messageHandler
   *              the function that processes incoming messages.
   *              One argument is passed: the message pushed by the server (a deserialzed JSON object).
   */
  constructor (config, messageHandler) {
    this.messageHandler = messageHandler
    config.then(config => {
      document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this))
      this.url = config['dmx.websockets.url']
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

  _handleVisibilityChange () {
    DEV && console.log('[DMX] Document visibility:', document.visibilityState, new Date())
    if (document.visibilityState === "hidden") {
      // mobile browsers often kill background sockets anyway
      this._close()
    } else {
      this._connect()
    }
  }

  _connect () {
    DEV && console.log('[DMX] Connecting', this.url)
    this.ws = new WebSocket(this.url)
    this.ws.onopen = e => {
      this._startHeartbeat()
    }
    this.ws.onmessage = e => {
      const message = JSON.parse(e.data)
      DEV && console.log('[DMX] Receiving message', message)
      this.messageHandler(message)
    }
    this.ws.onclose = e => {
      DEV && console.log('[DMX] WebSocket closed', e.reason)
      this._cleanup()
    }
    this.ws.onerror = e => {
      DEV && console.warn('[DMX] WebSocket error')
    }
  }

  _startHeartbeat () {
    this.heartbeatTimer = setInterval(this._ping.bind(this), HEARTBEAT_INTERVAL)
  }

  _stopHeartbeat () {
    clearInterval(this.heartbeatTimer)
  }

  _ping () {
    DEV && console.log('[DMX] WebSocket ping')
    this.send({type: 'ping'})
  }

  _close () {
    this.ws.close()
  }

  _cleanup () {
    this._stopHeartbeat()
  }
}
