var path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "/src/Masonry/index.js"),
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js",
    library: "react-masonry",
    libraryTarget: "commonjs2"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, "src"),
        exclude: /(node_modules|bower_components|build)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["es2016, react"],
            plugins: ["transform-object-rest-spread", "transform-react-jsx"]
          }
        }
      }
    ]
  },
  resolve: {
    modules: [path.resolve("./node_modules")],
    extensions: [".json", ".js"]
  },
  externals: {
    react: "react",
    "resize-observer-polyfill": "resize-observer-polyfill"
  }
};
