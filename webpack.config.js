const webpack = require('webpack')
const rules   = require('./webpack.rules.js')

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'multiselect.min.js',
        library: 'multiselect',
        libraryTarget: 'umd'
    },
    externals: {
        "vue": "Vue"
    },
    module: {
        rules
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        })
    ],
    devtool: 'source-map'
}
