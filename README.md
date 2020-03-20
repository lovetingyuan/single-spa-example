### single-spa example including vue and react

1. `yarn install`
2. `yarn serve` to start development at `http://localhost:1234`
3. `yarn build` to build at `dist`

Micro app set up process: 

1. fill field `singleapp` in the `package.json` following the format:
```javascript
{
  "singleapp": {
    "require": true, // always to be included, default false
    "route": "/app-name", // pathname starts with this will be loaded, default "/"
    "output": "dist", // static assets ouput dir, default "dist"
    "port": 8080 // dev server port, just for development and no need to set this in general
  }
}
```
2. add `singleapp-webpack-plugin` to webpack config and set dev port
3. [set webpack public path on the fly](https://webpack.js.org/guides/public-path/#on-the-fly) at the beginning of you app code
```javascript
if (process.env.NODE_ENV === 'development' && typeof singleApp === 'object') {
  __webpack_public_path__ = process.env.SINGLE_APP_DEV_ORIGIN + '/' // eslint-disable-line
}
```
4. Make sure the app use npm script `npm run serve` to start development and `npm run build` to production build.
