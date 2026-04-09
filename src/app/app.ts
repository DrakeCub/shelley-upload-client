import { Component } from '@angular/core';
import { UploadComponent } from './uploadcomponent/uploadcomponent';

@Component({
  selector: 'app-root',
  imports: [UploadComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
