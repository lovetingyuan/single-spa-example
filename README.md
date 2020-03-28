### single-spa example including vue and react

1. `yarn install`
2. `yarn serve` to start development at `http://localhost:1234`

Micro app set up process: 

1. fill field `singleapp` in the `package.json` following the format:
```javascript
{
  "singleapp": {
    "name": "app name", // micro app name, must be unique, default is "name" of package.json
    "mountPath": "/app-name", // pathname starts with this will be loaded, default "/"
    "output": "dist", // static assets ouput dir, default "dist"
  }
}
```

2. You have to ensure that assets url in your app must be complete http url. For `webpack`, you could set `output.publicPath`.

3. use `process.env.SINGLE_APP_DEV_PORT` as your dev server port.

4. use `"mountPath"` as your app router base path.

5. Make sure the app use npm script `npm run serve` to start development and `npm run build` to production build.
