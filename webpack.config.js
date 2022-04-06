import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default options => {
  const webpackConfig = {
    context: path.resolve(__dirname, 'src'),
    entry: './index.js',
    output: {
      library: 'dealerLocator',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: 'dealer-locator.js'
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          postcss: [
            require('postcss-cssnext')({
              browsers: ['last 2 versions', '> 5%']
            }),
            require('postcss-reporter')()
          ]
        }
      }),
      new ExtractTextPlugin({
        filename: 'dealer-locator.css',
        allChunks: true
      }),
      new webpack.ProvidePlugin({
        h: ['preact', 'h']
      })
    ],
    module: {
      loaders: [
        {
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            plugins: [
              'transform-class-properties',
              'transform-object-rest-spread',
              ['transform-react-jsx', {pragma: 'h'}]
            ],
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: ['last 2 versions']
                  },
                  modules: false,
                  loose: true
                }
              ]
            ]
          }
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                query: {
                  modules: true,
                  importLoaders: 1,
                  localIdentName: 'dealerLocator-[local]'
                }
              },
              'postcss-loader'
            ]
          })
        }
      ]
    },
    resolve: {
      modules: ['./src', 'node_modules'],
      extensions: ['.js']
    },
    devServer: {
      port: process.env.PORT || 3000,
      open: true
    }
  };

  if (options.dev) {
    webpackConfig.devtool = 'cheap-module-eval-source-map';
  }

  if (options.prod) {
    webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': 'production'
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        cache: true,
        sourceMap: true
      })
    );
  }

  return webpackConfig;
};