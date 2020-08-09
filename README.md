### single-spa example including vue, react and angular.

1. `yarn install`
2. `yarn serve` to start development at `http://localhost:3000`

Micro app set up process: 

1. add config `single-app.json`
```json
{
  "new-app": {
    "port": 8081,
    "mountPath": "/new-app-route",
    "publicPath": "/new-app/",
    "serve": "npm run serve",
    "build": "npm run build",
    "output": "dist",
    "default": false
  }
}
```

2. You have to ensure that assets url in your app must be complete http url.
For `webpack`, you could set `output.publicPath`.

3. You have to ensure that `CORS` is enabled.

4. use `window.singleApp.startApp(appName, singleAppLifecycles)` to start your app.
