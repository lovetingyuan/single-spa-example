import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { AppProps } from 'single-spa';
import { singleSpaAngular, getSingleSpaExtraProviders } from 'single-spa-angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

declare global {
  interface Window {
    singleApp: any
  }
}

if (environment.production) {
  enableProdMode();
}

if (window.singleApp) {
  const singleSpaPropsSubject = new ReplaySubject<AppProps & {}>(1);
  window.singleApp.startApp('ng-app', singleSpaAngular({
    bootstrapFunction: singleSpaProps => {
      singleSpaPropsSubject.next(singleSpaProps);
      return platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule);
    },
    template: '<ng-singleapp-root />',
    domElementGetter() {
      return document.getElementById('ng-app')
    },
    Router,
    NgZone,
  }))
} else {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}
