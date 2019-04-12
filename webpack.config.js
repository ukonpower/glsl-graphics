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
                test: /\.(frag|vert|glsl|vs|fs)$/,
                use: [{
                    loader: 'glsl-shader-loader',
                    options: {}
                }]
            }
        ]
    }
};