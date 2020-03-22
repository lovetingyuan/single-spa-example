import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import singleSpaReact from 'single-spa-react';
import * as serviceWorker from './serviceWorker';

if (typeof singleApp === 'object') {
  singleApp.startApp(singleSpaReact({
    React,
    ReactDOM,
    rootComponent: App as any as React.ComponentClass<any, any>,
    domElementGetter: () => document.getElementById('react-app-container') as Element
  }))
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
