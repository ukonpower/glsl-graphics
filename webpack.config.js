import path from 'path';

console.log(path.resolve(__dirname,"/src/glsl-chunks/"));

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
                        chunkPath: "./src/glsl-chunks/"
                    }
                }
            }
        ]
    }
};