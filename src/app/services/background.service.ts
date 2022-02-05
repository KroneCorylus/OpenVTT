import { Injectable } from '@angular/core';

@Injectable()
export class BackgroundService {
  constructor() {}
  snapToGrid: boolean = true;
  gridSize: number = 45;
}
