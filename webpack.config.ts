import path from 'path'

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { Configuration } from 'webpack'

const resolve = (...args: string[]) => path.resolve(process.cwd(), ...args)

type Mode = Configuration['mode']

const NODE_ENV = (process.env.NODE_ENV as Mode) || 'development'

const isDev = NODE_ENV === 'development'

const hashType = isDev ? 'hash' : 'contenthash'

const sourceMap = isDev

const cssLoaders = [
  isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      sourceMap,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap,
    },
  },
]

const config: Configuration = {
  mode: NODE_ENV,
  devtool: isDev ? 'cheap-module-source-map' : false,
  entry: {
    app: resolve('src/index.tsx'),
  },
  output: {
    filename: `[name].[${hashType}].js`,
  },
  resolve: {
    alias: {
      lodash$: 'lodash-es',
    },
    extensions: ['.ts', '.tsx', '.js', '.scss'],
    modules: [resolve('src'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders,
      },
      {
        test: /\.less$/,
        use: [
          ...cssLoaders,
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
              sourceMap,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          ...cssLoaders,
          {
            loader: 'sass-loader',
            options: {
              sourceMap,
            },
          },
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [resolve('src/styles/_global.scss')],
            },
          },
        ],
      },
      {
        test: /\.eot|svg|ttf|woff2?$/,
        loader: 'url-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: `[name].[${hashType}].css`,
    }),
  ],
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          name: 'vendors',
          test: /node_modules/,
        },
      },
    },
  },
}

export default config
