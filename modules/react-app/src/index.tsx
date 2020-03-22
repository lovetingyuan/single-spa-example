import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import singleSpaReact from 'single-spa-react';
import * as serviceWorker from './serviceWorker';

if (typeof singleApp === 'object') {
  singleApp.loadApp(singleSpaReact({
    React,
    ReactDOM,
    rootComponent: App as any as React.ComponentClass<any, any>,
    domElementGetter: () => document.getElementById('react-app-container') as Element
  }))
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
  if (window.location.search.startsWith('?singleapp=')) {
    window.parent.postMessage({
      type: 'singleapp',
      origin: window.location.origin,
      js: [...window.document.querySelectorAll('script[src]')].map((v: any) => v.src),
      css: [...window.document.querySelectorAll('link[rel="stylesheet"]')].map((v: any) => v.href).filter(Boolean)
    }, 'http://localhost:1234')
  }
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
