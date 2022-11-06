const path = require('path');
const webpack = require('webpack');
const glob = require("glob");

const entries = glob.sync('./app/assets/js/*.js').reduce((entries, entry) => {
    const entryName = path.parse(entry).name
    entries[entryName] = entry

    return entries
}, {});

console.log(entries);
module.exports = {
    mode: "development",
    devtool: 'eval',
    entry: entries,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './.tmp/assets/js/'),
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(obj|glb|gltf)$/,
                loader: 'file-loader',
                options: {
                    esModule: false
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
};
