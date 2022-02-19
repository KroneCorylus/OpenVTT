import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ResizableObject } from '../models/resizable-object.model';

@Injectable()
export class SharedService {
  constructor() {}

  public selectedObject: ResizableObject | undefined;

  public onSelectedObjectChanges: Subject<ResizableObject | undefined> =
    new Subject<ResizableObject | undefined>();

  render: Subject<undefined> = new Subject();

  public updateSelected(params: ResizableObject | undefined) {
    console.debug('updateSelected', params);
    if (this.selectedObject && params) {
      if (params.width) {
        this.selectedObject.width = params.width;
      }
      if (params.height) {
        this.selectedObject.height = params.height;
      }
      if (params.x) {
        this.selectedObject.x = params.x;
      }
      if (params.y) {
        this.selectedObject.y = params.y;
      }
      this.onSelectedObjectChanges.next(this.selectedObject);
    }
  }
}
