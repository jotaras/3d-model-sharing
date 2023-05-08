const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api/*',
        createProxyMiddleware({
            target: 'https://localhost:8080',
            changeOrigin: true,
            secure: false
        })

    );

    app.use(
        '/filestorage',
        createProxyMiddleware({
            target: 'https://localhost:3010',
            changeOrigin: true,
            secure: false
        })
    );
};
