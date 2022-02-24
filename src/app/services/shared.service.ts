import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ResizableObject } from '../models/resizable-object.model';

@Injectable()
export class SharedService {
  constructor() {}

  public selectedTool: string = 'background';
  public selectedObject: ResizableObject | undefined;
  public zoom: number = 1;

  public onSelectedObjectChanges: Subject<ResizableObject | undefined> =
    new Subject<ResizableObject | undefined>();

  render: Subject<undefined> = new Subject();

  public updateSelected(params: ResizableObject | undefined) {
    if (this.selectedObject && params) {
      if (params.width != undefined) {
        this.selectedObject.width = params.width;
      }
      if (params.height != undefined) {
        this.selectedObject.height = params.height;
      }
      if (params.x != undefined) {
        this.selectedObject.x = params.x;
      }
      if (params.y != undefined) {
        this.selectedObject.y = params.y;
      }
      this.onSelectedObjectChanges.next(this.selectedObject);
    }
  }
}
