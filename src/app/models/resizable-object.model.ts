import { IPoint, Point } from './point.model';
import { ANCHOR_CONFIG } from 'src/app/components/const/anchor.config';
import { ResolveData } from '@angular/router';

export class ResizableObject {
  constructor(params: any) {
    this.x = params.x;
    this.y = params.y;
    this.width = params.width;
    this.height = params.height;
    this.selected = params.selected;
  }
  public height: number;
  public width: number;
  public x: number;
  public y: number;
  public selected: boolean | undefined;
  public potencialMovementX: number = 0;
  public potencialMovementY: number = 0;

  public getClickedAnchor(x: number, y: number): string | undefined {
    if (!this) return undefined;
    var topLeft: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x - 10 - 8,
      y: this.y - 10 - 8,
    });
    var topRight: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x + this.width + 10 - 8,
      y: this.y - 10 - 8,
    });
    var bottomLeft: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x - 10 - 8,
      y: this.y + this.height + 10 - 8,
    });
    var bottomRight: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x + this.width + 10 - 8,
      y: this.y + this.height + 10 - 8,
    });
    var top: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x + this.width / 2 - 8,
      y: this.y - 10 - 8,
    });
    var bottom: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x + this.width / 2 - 8,
      y: this.y + this.height + 10 - 8,
    });
    var left: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x - 10 - 8,
      y: this.y + this.height / 2 - 8,
    });
    var right: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: this.x + this.width + 10 - 8,
      y: this.y + this.height / 2 - 8,
    });
    if (topLeft.ContainsPoint({ x, y })) {
      return 'topLeft';
    } else if (topRight.ContainsPoint({ x, y })) {
      return 'topRight';
    } else if (bottomLeft.ContainsPoint({ x, y })) {
      return 'bottomLeft';
    } else if (bottomRight.ContainsPoint({ x, y })) {
      return 'bottomRight';
    } else if (top.ContainsPoint({ x, y })) {
      return 'top';
    } else if (bottom.ContainsPoint({ x, y })) {
      return 'bottom';
    } else if (left.ContainsPoint({ x, y })) {
      return 'left';
    } else if (right.ContainsPoint({ x, y })) {
      return 'right';
    } else {
      return undefined;
    }
  }
  public ContainsPoint(point: { x: number; y: number }): boolean {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }

  public resizeSnapToGrid(
    dragOffset: IPoint,
    mousePos: IPoint,
    gridSize: number,
    AnchorPulled: string
  ) {
    var ratio = this.width / this.height;
    var deltaX = this.x - mousePos.x;
    var deltaY = this.y - mousePos.y;
    var newWidth = this.width;
    var newHeight = this.height;
    var newX = this.x;
    var newY = this.y;
    var deltaX = mousePos.x - dragOffset.x;
    var deltaY = mousePos.y - dragOffset.y;
    switch (AnchorPulled) {
      case 'topLeft':
        newX = Math.round(deltaX / gridSize) * gridSize;
        newWidth =
          Math.round((this.x - deltaX + this.width) / gridSize) * gridSize;
        newHeight = newWidth / ratio;
        newY = this.y + (this.width - newWidth);
        break;
      case 'topRight':
        newWidth = Math.round((mousePos.x - this.x) / gridSize) * gridSize;
        newHeight = newWidth / ratio;
        newY = this.y + (this.width - newWidth);
        break;
      case 'bottomLeft':
        newX = Math.round(deltaX / gridSize) * gridSize;
        newWidth =
          Math.round((this.x - deltaX + this.width) / gridSize) * gridSize;
        newHeight = newWidth / ratio;
        break;
      case 'bottomRight':
        newWidth = Math.round((mousePos.x - this.x) / gridSize) * gridSize;
        newHeight = newWidth / ratio;
        break;
      case 'top':
        newY = Math.round(deltaY / gridSize) * gridSize;
        newHeight =
          Math.round((this.y - deltaY + this.height) / gridSize) * gridSize;
        break;
      case 'bottom':
        newHeight = Math.round((mousePos.y - this.y) / gridSize) * gridSize;
        break;
      case 'left':
        newX = Math.round(deltaX / gridSize) * gridSize;
        newWidth =
          Math.round((this.x - deltaX + this.width) / gridSize) * gridSize;
        break;
      case 'right':
        newWidth = Math.round((mousePos.x - this.x) / gridSize) * gridSize;
        break;
      default:
        break;
    }
    // var newWidth =
    //   Math.round((mousePos.x - dragOffset.x) / gridSize) * gridSize +
    //   gridOffset.x;
    // var newHeight =
    //   Math.round((mousePos.y - dragOffset.y) / gridSize) * gridSize +
    //   gridOffset.y;

    if (newWidth != this.width) {
      this.width = newWidth;
      this.x = newX;
    }
    if (newHeight != this.height) {
      this.height = newHeight;
      this.y = newY;
    }
  }

  public resizeElement(AnchorPulled: string, x: number, y: number) {
    var ratio = this.width / this.height;
    switch (AnchorPulled) {
      case 'topLeft':
        this.width = this.x - x + this.width;
        this.y -= this.width / ratio - this.height;
        this.height = this.width / ratio;
        this.x = x;
        break;
      case 'topRight':
        this.width = x - this.x;
        this.y -= this.width / ratio - this.height;
        this.height = this.width / ratio;
        break;
      case 'bottomLeft':
        this.width = this.x - x + this.width;
        this.height = this.width / ratio;
        this.x = x;
        break;
      case 'bottomRight':
        this.width = x - this.x;
        this.height = this.width / ratio;
        break;
      case 'top':
        this.height = this.y - y + this.height;
        this.y = y;
        break;
      case 'bottom':
        this.height = y - this.y;
        break;
      case 'left':
        this.width = this.x - x + this.width;
        this.x = x;
        break;
      case 'right':
        this.width = x - this.x;
        break;
      default:
        break;
    }
  }

  public snapToGrid(dragOffset: IPoint, mousePos: IPoint, gridSize: number) {
    var newX = Math.round((mousePos.x - dragOffset.x) / gridSize) * gridSize;
    var newY = Math.round((mousePos.y - dragOffset.y) / gridSize) * gridSize;

    if (newX != this.x) {
      this.x = newX;
    }
    if (newY != this.y) {
      this.y = newY;
    }
  }

  public moveElement(mousePos: IPoint, dragOffset: IPoint) {
    this.x = Math.round(mousePos.x - dragOffset.x);
    this.y = Math.round(mousePos.y - dragOffset.y);
  }

  public patchValues(params: any) {
    for (const key in params) {
      if (this.hasOwnProperty(key)) {
        const keySan = key as keyof ResizableObject;
        (this[keySan] as any) = params[keySan];
      }
    }
  }
}
