import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import singleSpaReact from 'single-spa-react';
import * as serviceWorker from './serviceWorker';

if (window.singleApp) {
  singleApp.startApp('react-app', ({
    mountPath
  }: any) => {
    return singleSpaReact({
      React,
      ReactDOM,
      rootComponent: App.bind(null, mountPath) as any as React.ComponentClass<any, any>,
      domElementGetter: () => document.getElementById('react-app-container') as Element
    })
  })
} else {
  const Root = App.bind(null, process.env.PUBLIC_URL) as any as React.ComponentClass<any, any>
  ReactDOM.render(<Root />, document.getElementById('root'));
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
