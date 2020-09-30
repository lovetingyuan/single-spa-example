# PostCSS Plugin Classns

[PostCSS] plugin add global class name before all selectors.

[PostCSS]: https://github.com/postcss/postcss

```css
.foo {
    /* Input example */
}
.g-bar {
    color: red;
}
.global { /* classns-ignore */
    color: blue;
}
```

```css
.namespace .foo {
  /* Output example */
}
.g-bar {
    color: red;
}
.global {
    color: blue;
}
```

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-plugin-classns
```

**Step 2:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-plugin-classns')({
+     namespaceClass: '.namespace',
+     ignoreSelector(selector) {
+       if (selector.startsWith('.g-')) return true
+     }
+   }),
    require('autoprefixer')
  ]
}
```

[official docs]: https://github.com/postcss/postcss#usage
