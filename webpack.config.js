const path = require('path');

module.exports = {
  entry: './src/index.js', // Update with your entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.geojson$/,
        use: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'data/', // Optional
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.geojson'], // Add .geojson if needed
  },
};
