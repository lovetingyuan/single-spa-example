const child_process = require('child_process')
const port = process.env.SINGLE_APP_DEV_PORT || 4200
const { singleapp } = require('./package.json')
child_process.exec(`ng serve --port=${port} --deployUrl=http://localhost:${port}/ --baseHref=${singleapp.mountPath} --publicHost=http://localhost:${port}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
})
