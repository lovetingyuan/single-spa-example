import { Component } from '@angular/core';
import logo from '../assets/logo-nav@2x.png'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-app';
  logo = logo
}
