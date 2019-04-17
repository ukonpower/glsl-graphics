import path from 'path';
module.exports = {
    mode: '',
    entry: {
        main: ''
    },
    output: {
        filename: ''
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(glsl|vs|fs)$/,
                loader: 'shader-loader',
                options: {
                    glsl: {
                    }
                }
            }
        ]
    }
};