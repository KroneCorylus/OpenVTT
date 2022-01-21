import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  backgrounds: any[] = [];
  layerZArray: any[] = this.backgrounds;
  title = 'OpenVTT';
}
