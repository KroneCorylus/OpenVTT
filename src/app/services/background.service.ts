import { Injectable } from '@angular/core';

@Injectable()
export class BackgroundService {
  constructor() {}
  snapToGrid: boolean = false;
  gridSize: number = 45;
}
