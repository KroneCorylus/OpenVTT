import { ResizableObject } from './resizable-object.model';

export class ImageObject extends ResizableObject {
  constructor(params: any) {
    super(params);
    this.url = params.url;
    this.element = params.element;
  }
  public url: string;
  public element: HTMLImageElement;
}
