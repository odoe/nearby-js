const ArcGISPlugin = require('@arcgis/webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { default: HTMLInlineCSSWebpackPlugin } = require('html-inline-css-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const path = require('path');

module.exports = function build(env, arg) {
  const config = {
    entry: {
      index: ['@babel/polyfill', './src/index.ts'],
    },
    output: {
      path: path.join(__dirname, 'dist'),
      chunkFilename: 'chunks/[id].js',
      publicPath: ''
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 3001,
      writeToDisk: true
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.html$/,
          type: 'asset/resource',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            'postcss-loader',
          ],
        },
      ],
    },
    optimization: {
      minimize: arg.mode === 'production',
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            output: {
              comments: false,
            },
          },
        }),
        new CssMinimizerPlugin()
      ]
    },
    plugins: [
      new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
  
      new Dotenv({
        path: './env/development.env'
      }),
  
      new MiniCssExtractPlugin({
        filename: '[name].bundle.css',
        chunkFilename: '[id].css',
      }),
  
      new ArcGISPlugin(),
  
      new HtmlWebPackPlugin({
          title: 'ArcGIS Template Application',
          template: 'src/index.ejs',
          filename: 'index.html',
          mode: arg.mode
      }),
      new HTMLInlineCSSWebpackPlugin(),
    ],
    resolve: {
          modules: [
            path.resolve(__dirname, '/src'),
            path.resolve(__dirname, 'node_modules/')
          ],
      extensions: ['.ts', '.tsx', '.js', '.scss', '.css'],
    },
  };


  if (arg.mode === 'production') {
    config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true
      })
    );
  }

  return config;
};
