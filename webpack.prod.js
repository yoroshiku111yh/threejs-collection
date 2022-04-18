const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const glob = require("glob");

const entries = glob.sync('./app/assets/js/*.js').reduce((entries, entry) => {
    const entryName = path.parse(entry).name
    entries[entryName] = entry

    return entries
}, {});

module.exports = {
    mode: "production",
    entry: entries,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './.dist/assets/js/'),
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
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                    'glslify-loader',
                ],
            },
        ]
    },
    target: ['es5','web'],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                    compress: {
                        drop_console: true,
                    }
                },
                extractComments: false,
            }),
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
};
