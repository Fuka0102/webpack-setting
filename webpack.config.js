const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const globule = require("globule");
const ESLintPlugin = require("eslint-webpack-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const ImageminMozjpeg = require("imagemin-mozjpeg");

const app = {
  entry: path.resolve(__dirname, "src/js/index.ts"),

  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: "pug-loader",
            options: {
              pretty: true,
            },
          },
        ],
      },
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            // Babel のオプションを指定する
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      ie: 11,
                      esmodules: true,
                    },
                    useBuiltIns: "usage",
                    corejs: { version: "3", proposals: true },
                  },
                ],
                ["@babel/preset-typescript"],
              ],
            },
          },
        ],
      },
      {
        test: /.(jpg|png|gif|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "../img/[name].[ext]",
          },
        },
      },
      {
        test: /\.scss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  require("autoprefixer")(),
                  require("css-declaration-sorter")({
                    order: "alphabetical",
                  }),
                  require("postcss-sort-media-queries")({
                    sort: "mobile-first",
                  }),
                ],
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "expanded",
              },
            },
          },
        ],
      },
    ],
  },
  target: "web",
  resolve: {
    // 拡張子を配列で指定
    extensions: [".ts", ".js"],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/style.css",
      ignoreOrder: true,
    }),
    new StylelintPlugin({
      fix: true,
    }),
    new ESLintPlugin(),
    new BrowserSyncPlugin({
      host: "localhost",
      port: 2000,
      server: `${__dirname}/dist`,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: `${path.resolve(__dirname, "src")}/images`,
          to: `${path.resolve(__dirname, "dist")}/images/[name]_min[ext]`,
        },
      ],
    }),
    new ImageminPlugin({
      //画像圧縮処理の指定
      test: /\.(jpe?g|png|gif|svg)$/i,
      plugins: [
        ImageminMozjpeg({
          quality: 89,
          progressive: true,
        }),
      ],
      pngquant: {
        quality: "80-89",
      },
      gifsicle: {
        interlaced: false,
        optimizationLevel: 10,
        colors: 256,
      },
      svgo: {},
    }),
  ],
  mode: "development",
};

//srcフォルダからpngを探す
const templates = globule.find("./src/templates/**/*.pug", {
  ignore: ["./src/templates/**/_*.pug"],
});

//pugファイルがある分だけhtmlに変換する
templates.forEach((template) => {
  const fileName = template
    .replace("./src/templates/", "")
    .replace(".pug", ".html");
  app.plugins.push(
    new HtmlWebpackPlugin({
      filename: `${fileName}`,
      template: template,
      inject: false, //false, head, body, trueから選べる
      minify: false, //本番環境でも圧縮しない
    })
  );
});

module.exports = app;
