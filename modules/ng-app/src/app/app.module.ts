import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {APP_BASE_HREF} from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

export default function getAppModule (mountPath = '/') {
  @NgModule({
    declarations: [
      AppComponent
    ],
    imports: [
      BrowserModule,
      AppRoutingModule
    ],
    providers: [{provide: APP_BASE_HREF, useValue: mountPath}],
    bootstrap: [AppComponent]
  })
  class AppModule { }
  return AppModule
}
