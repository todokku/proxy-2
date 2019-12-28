const AnyProxy = require("anyproxy")
const path = require('path')

const options = {
    port: 8001,

    webInterface: {
        enable: true,
        webPort: 8002
    },
    rule: require(path.resolve(__dirname, './rule/wx.js')),
    forceProxyHttps: true
}

const proxyServer = new AnyProxy.ProxyServer(options)

proxyServer.on("ready", () => {
    console.log(' ------------ 代理开启成功 ------------ ')
})

proxyServer.on("error", e => {})

module.exports = proxyServer