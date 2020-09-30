### single-spa example including vue, react and angular.

1. `yarn install` and `cd modules && npx lerna bootstrap`
2. `yarn serve` to start development at `http://localhost:3000`

Micro app set up process: 

1. add config `singleapp` in `modules/package.json`
```json
{
  "new-app": {
    "port": 8081,
    "mountPath": "/new-app-route",
    "publicPath": "/new-app/",
    "output": "dist",
    "default": false
  }
}
```

2. You have to ensure that assets url in your app must be complete url(with http or https) in development.
For `webpack`, you could set `output.publicPath`.

3. You have to offer `singlespa:serve` and `singlespa:build` npm scripts to perform development and build.

4. use `window.singleApp.startApp(appName, singleSpaLifecycles)` to start your app.
