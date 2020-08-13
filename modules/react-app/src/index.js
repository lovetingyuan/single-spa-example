import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import singleSpaReact from 'single-spa-react';

if (window.singleApp) {
  window.singleApp.startApp('react-app', singleSpaReact({
    React,
    ReactDOM,
    rootComponent: () => (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ),
    domElementGetter() {
      return document.getElementById('react-app')
    },
    errorBoundary(err, info, props) {
      // https://reactjs.org/docs/error-boundaries.html
      return (
        <div>This renders when a catastrophic error occurs</div>
      );
    },
  }))
} else {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
