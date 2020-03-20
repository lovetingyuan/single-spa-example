### single-spa example including vue and react

1. `yarn install`
2. `yarn serve` to start development at `http://localhost:1234`
3. `yarn build` to build at `dist`

First fill field `singleapp` in the `package.json` following the format:
```json
{
  "singleapp": {
    "require": true, // always to be included, default false
    "route": "/app-name", // pathname starts with this will be loaded, default "/"
    "output": "dist", // static assets ouput dir, default "dist"
    "port": 8080 // dev server port, just for development and no need to set this in general
  }
}
```
