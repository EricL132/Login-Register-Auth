const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app){
    app.use('/auth',createProxyMiddleware({target:'http://localhost:8000/',changeOrigin: true,})),
    app.use('/user',createProxyMiddleware({target:'http://localhost:8000/',changeOrigin: true,}))
}