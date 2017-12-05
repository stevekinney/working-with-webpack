# Working with Webpack

Okay, so what is webpack?

It’s a _module bundler_. Okay, so what is that?

You give it an entry point; it builds a _dependency graph_.

Alright, alright: here is a better question, maybe: _why_ does it exist? Up until recently JavaScript had no concept of modules in the specification. This means that you couldn’t require other files. You theoretically had to write everything in one file. Technically, you could have your HTML page load multiple files, but you didn’t want to do this too much because it was slow and blocking–and if you messed up the order of the files, then it was bad news bears.

The Asset Pipeline in Rails (and a myriad of other tools), basically takes all of your JavaScript files and then concatenates them together into one big file. Yes, this is better than having to write everything in one file from a ergonomics perspective, but it’s effectively the thing with the same problems: global leak all over the place, order could still technically matter.

Along the way, we invented a number of different ways to modularize our code to prevent these problems, even when concatenated together. The most notably of these was AMD. To this day, I still haven’t figured out how to write AMD modules without staring at an existing one.

The Node folks adopted the CommonJS module system, but they also have a file system and whatnot. Eventually, someone adapted AMD to CommonJS. That was cool.

There is also the ES2015 module specification. That’s another story for another day.

There are four core concepts:

- Entry
- Output
- Loaders
- Plugins

Let’s walk through each of them, shall we?

The entry is the starting point in the dependency graph that webpack builds for your application. Here is the world’s simplest entry file.

```js
module.exports = {
  entry: './entry.js'
};
```

Cool, so you made an a entry, neat. You probably wanted webpack to actually build something for you. In this situation, we need an output.

```js
const path = require('path');

module.exports = {
  entry: './src/a.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js' // This could be literally anything
  }
};
```

For the purposes of using modules in your application, this is all you need in order to get started with webpack. You can now use modules and this will spit out a bundle where they are all wired together.

Loaders transform the code in your modules when the graph is being built.

```js
const path = require('path');

module.exports = {
  entry: './src/b.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js' // This could be literally anything
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  }
};
```

With the **module** property, we can set up some rules. If the given file passes a particular test, then we use the corresponding loader. 

So, this should give you a hint between the difference between loaders and plugins. Loaders act on a per module basis. They look at the file name and then pump it through a given loader. But what if we need to do something at a higher level?

That’s where **plugins** come in. Plugins are commonly used to perform actions and/or custom functionality on “compilations” or “chunks” of bundled modules. You can require the plugins and then use them in the configurations plugins array.

```js
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
  entry: './src/c.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js' // This could be literally anything
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  },
  plugins: [
    new BabiliPlugin()
  ]
};
```

## Entries

There are a few patterns for setting up the entry point with webpack.

There was the simple single-entry we saw earlier. This is really just sugar over.

```js
const config = {
  entry: {
    main: './entry.js'
  }
};
```

As you can guess, you can have any keys you want in here.

We typically use multiple entry points in one of two situations: splitting out vendor bundles or in a multi-page application, you might have one bundle for every page. Each page would only load exactly what it needs.

## Outputs and Cache-busting

```js
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
  entry: {
    main: './src/c.js',
    vendor: './src/a.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  }
};
```

Now, replace `[hash]` with `[chunkhash]` and build a few times. It didn’t change if the file didn’t change.

- `[hash]` changes if the entire build changes and is shared between all of the chunks.
- `[chunkhash]` is specific to each chunk and is independent of anything else going on.

Okay, so, does this mean that we have to just regenerate these things? It's definitely tedious to have to update the hash in the HTML file every time and a bit error-prone. So, why don't we automate it?

```js
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/c.js',
    vendor: './src/a.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  },
  plugins: [
    new BabiliPlugin(),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};
```

It turns out that plugins are just functions.

There are some libraries that help with this:

- [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin)
- [assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin)

### A Side-Note on CDNs

Let's say you knew you were going to host the files on a CDN instead of from a folder. You could update your output as follows:

```js
output: {
  path: "/home/nlvx/cdn/assets/[hash]",
  publicPath: "http://cdn.example.com/assets/[hash]/"
}
```

## Working with CSS

Earlier, we saw that we could bring in plain text and just interpolate it. It's more likely that we would want to bring in some CSS. If we split up the CSS, then we could only pull in what we actually needed.

We can use a loader and process it as part of our JavaScript bundle.

```js
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/d.js',
    vendor: './src/a.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // new BabiliPlugin(),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};
```

I disabled Babili because I wanted to see my output. But, what if you wanted an old-fashioned CSS file?

```js
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/d.js',
    vendor: './src/a.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
    ]
  },
  plugins: [
    // new BabiliPlugin(),
    new ExtractTextPlugin('[name].[chunkhash].css'),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};
```

Tasting notes:

- We can use the same `[name]`, `[hash]`, and `[chunkhash]` variables we used earlier.
- `HtmlWebpackPlugin` also properly included the hashed version in `index.html`.

## Common Chunks

Sometimes you have bundles that share code. The `CommonChunks` plugin will figure out what's shared and pull it out into it's own module. This avoids duplication.

```js
const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: './src/e.js',
    vendor: './src/f.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
    ]
  },
  plugins: [
    // new BabiliPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
    }),
    new ExtractTextPlugin('[name].[hash].css'),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};
```

## Random Stuff We've Talked About Before But I'll Mention Again If We Have Time

- [Lazy loading](https://webpack.js.org/guides/lazy-loading/)
- [Tree Shaking](https://alexjoverm.github.io/2017/03/06/Tree-shaking-with-Webpack-2-TypeScript-and-Babel/)