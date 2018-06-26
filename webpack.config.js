const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const env = process.env.NODE_ENV;

const config = {
  entry: {
    'toggle-desktop-button': [
      './src/extensions/toggle-desktop-button/less/index.less',
      './src/extensions/toggle-desktop-button/extension.js',
    ]
  },
  optimization: {
    minimize: env === 'production',
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          mangle: {
            reserved: ['global'],
          },
        },
      }),
    ],
  },
  output: {
    filename: 'extensions/[name]/package.js',
    path: path.resolve(__dirname, 'build'),
    library: 'ext',
    libraryTarget: 'var',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          'babel-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
  node: {
    global: false,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'extensions/[name]/stylesheet.css',
    }),
  ],
  resolve: {
    alias: {
      'lib': path.resolve(__dirname, 'lib'),
    },
  },
};

// Copy files for each extension
Object.keys(config.entry).forEach(k => {
  config.plugins.push(new CopyWebpackPlugin([
    {
      from: './src/extension.js',
      to: `extensions/${k}/extension.js`,
    },
    {
      from: `./src/extensions/${k}/icons`,
      to: `extensions/${k}/icons`,
    },
    {
      from: `./src/extensions/${k}/schemas`,
      to: `extensions/${k}/schemas`,
    },
    {
      from: `./src/extensions/${k}/metadata.json`,
      to: `extensions/${k}/metadata.json`,
    }
  ]));
});

module.exports = config;
