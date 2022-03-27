import { ResizableObject } from './resizable-object.model';

export class ImageObject extends ResizableObject {
  constructor(params: any) {
    super(params);
    this.url = params.url;
    this.element = params.element;
    if (!this.height || !this.width)
      this.element.addEventListener('load', () => {
        if (!this.height && !this.width) {
          this.height = this.element.height;
          this.width = this.element.width;
        } else if (!this.height) {
          var ratio = this.element.width / this.element.height;
          this.height = this.width / ratio;
        } else {
          var ratio = this.element.height / this.element.width;
          this.width = this.height / ratio;
        }
      });
  }

  public url: string;
  public element: HTMLImageElement;
}
