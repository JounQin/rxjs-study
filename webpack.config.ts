import path from 'path'

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import tsImportPlugin from 'ts-import-plugin'
import { Configuration } from 'webpack'

const resolve = (...args: string[]) => path.resolve(process.cwd(), ...args)

type Mode = Configuration['mode']

const NODE_ENV = (process.env.NODE_ENV || 'development') as Mode

const isProd = NODE_ENV === 'production'

const hashType = isProd ? 'contenthash' : 'hash'

const cssLoaders = [
  isProd ? MiniCssExtractPlugin.loader : 'style-loader',
  'css-loader',
  'postcss-loader',
]

const config: Configuration = {
  mode: NODE_ENV,
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
        test: /\.scss$/,
        use: [
          ...cssLoaders,
          'sass-loader',
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
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [
              tsImportPlugin({
                style: 'css',
              }),
            ],
          }),
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: `[name].[${hashType}].css`,
    }),
  ],
}

export default config
