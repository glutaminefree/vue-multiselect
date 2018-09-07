module.exports = [
    {
        test: /\.vue$/,
        loader: 'vue-loader',
    },
    {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
    },
    {
        test: /\.(png|svg)$/,
        loader: 'url-loader'
    }
];
