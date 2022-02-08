import { Injectable } from '@angular/core';
import { ResizableObject } from '../models/resizable-object.model';

@Injectable()
export class SharedService {
  constructor() {}
  selectedObject: ResizableObject | undefined = undefined;
}
