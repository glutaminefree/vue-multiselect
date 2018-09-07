const webpack = require('webpack')
const path    = require('path')
const rules   = require('./webpack.rules.js')

module.exports = {
    entry: './demo/index.js',
    output: {
        path: __dirname + '/demo',
        filename: 'bundle.js',
    },
    module: {
        rules
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'demo'),
        port: 9000,
        inline: true,
    },
}
