### single-spa example including vue and react

1. `yarn install`
2. `yarn serve` to start development at `http://localhost:1234`

Micro app set up process: 

1. create a file at `src/manifest.js` filled with: 
```javascript
module.exports = {
  navbar: {
    entrypoint: 'http://localhost:8081',
    mountPath: '/',
  },
  'ng-app': {
    entrypoint: 'http://localhost:8082',
    mountPath: '/angular-singleapp',
    serve: 'ng serve --disable-host-check --port 8082 --deploy-url http://localhost:8082/ --live-reload false'
  },
  'react-app': {
    entrypoint: 'http://localhost:8083',
    mountPath: '/react-singleapp',
    output: 'build',
    serve: 'npm run start'
  },
  'vue-app': {
    entrypoint: 'http://localhost:8084',
    mountPath: '/vue-singleapp'
  },
}
```

2. You have to ensure that assets url in your app must be complete http url.
For `webpack`, you could set `output.publicPath`.

3. You have to ensure that `CORS` is enabled.

4. use `window.singleApp.startApp(appName, appLifecycles)` to start your micro app.
