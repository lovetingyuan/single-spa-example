import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';
import singleSpaAngular from 'single-spa-angular';

import getAppModule from './app/app.module';
import { environment } from './environments/environment';
import { singleSpaPropsSubject } from './single-spa/single-spa-props';
import { LifeCycles } from 'single-spa';

if (environment.production) {
  enableProdMode();
}

if (window.singleApp) {
  const lifecycles: (a: { mountPath: string, name: string }) => LifeCycles = ({ mountPath }) => {
    const AppModule = getAppModule(mountPath)
    const lifecycles = singleSpaAngular({
      bootstrapFunction: singleSpaProps => {
        singleSpaPropsSubject.next(singleSpaProps);
        return platformBrowserDynamic().bootstrapModule(AppModule);
      },
      template: '<app-root></app-root>',
      domElementGetter: () => document.getElementById('ng-app-container'),
      Router,
      NgZone,
    })
    const unmount = lifecycles.unmount
    lifecycles.unmount = function (...args) {
      return unmount.call(this, ...args).then((res) => {
        document.getElementById('ng-app-container').innerHTML = ''
        return res
      })
    }
    return lifecycles
  }
  window.singleApp.startApp('ng-app', lifecycles)
} else {
  platformBrowserDynamic().bootstrapModule(getAppModule())
    .catch(err => console.error(err));
}
