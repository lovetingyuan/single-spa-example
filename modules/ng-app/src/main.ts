import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';
import singleSpaAngular from 'single-spa-angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { singleSpaPropsSubject } from './single-spa/single-spa-props';
import { name } from '../package.json';
import { LifeCycles } from 'single-spa';

if (environment.production) {
  enableProdMode();
}

if (window.singleApp) {
  const lifecycles: LifeCycles = singleSpaAngular({
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
  window.singleApp.startApp(name, lifecycles)
} else {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}
