const path = require('path');
const project = 'gl14';

module.exports = {
    mode: 'development',
    entry: './src/' + project + '/js/main.js',
    output:{
		path: `${__dirname}/dist/gl/js/`,
		publicPath: '/gl/js/',
        filename: 'main.js'
    },
    devServer: {
		contentBase: path.join(__dirname, '/dist/'),
		openPage:"gl/",
		compress: true,
        open: true,
		port: 9000,
		host: '0.0.0.0',
		disableHostCheck: true
	},
	module: {
		rules: [
			{
				test: /\.(glsl|vs|fs)$/,
				loader: 'shader-loader',
				options: {
					glsl: {
						chunkPath: path.resolve("/glsl/chunks")
					}
				}
			}
		]
	}
}

