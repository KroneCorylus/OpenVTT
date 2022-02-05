import { Point } from './point.model';
import { ANCHOR_CONFIG } from 'src/app/components/const/anchor.config';

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
    dragOffset: Point,
    mousePos: Point,
    gridOffset: Point,
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
          Math.round((this.x - deltaX + this.width) / gridSize) * gridSize +
          gridOffset.x;
        newHeight = newWidth / ratio;
        newY = this.y + (this.width - newWidth);
        break;
      case 'topRight':
        newWidth =
          Math.round((mousePos.x - this.x) / gridSize) * gridSize +
          gridOffset.x;
        newHeight = newWidth / ratio;
        newY = this.y + (this.width - newWidth);
        break;
      case 'bottomLeft':
        newX = Math.round(deltaX / gridSize) * gridSize;
        newWidth =
          Math.round((this.x - deltaX + this.width) / gridSize) * gridSize +
          gridOffset.x;
        newHeight = newWidth / ratio;
        break;
      case 'bottomRight':
        newWidth =
          Math.round((mousePos.x - this.x) / gridSize) * gridSize +
          gridOffset.x;
        newHeight = newWidth / ratio;
        break;
      case 'top':
        newY = Math.round(deltaY / gridSize) * gridSize;
        newHeight =
          Math.round((this.y - deltaY + this.height) / gridSize) * gridSize +
          gridOffset.y;
        break;
      case 'bottom':
        newHeight =
          Math.round((mousePos.y - this.y) / gridSize) * gridSize +
          gridOffset.y;
        break;
      case 'left':
        newX = Math.round(deltaX / gridSize) * gridSize;
        newWidth =
          Math.round((this.x - deltaX + this.width) / gridSize) * gridSize +
          gridOffset.x;
        break;
      case 'right':
        newWidth =
          Math.round((mousePos.x - this.x) / gridSize) * gridSize +
          gridOffset.x;
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

  public resizeElement(
    AnchorPulled: string,
    lastX: number,
    lastY: number,
    x: number,
    y: number
  ) {
    if (lastX && lastY) {
      var xmovement = lastX - x;
      var ymovement = lastY - y;
      var ratio = this.width / this.height;
      switch (AnchorPulled) {
        case 'topLeft':
          this.width = this.width + xmovement;
          this.height = this.width / ratio;
          this.x = this.x - xmovement;
          this.y = this.y - xmovement;
          break;
        case 'topRight':
          this.width = this.width - xmovement;
          this.height = this.width / ratio;
          this.y = this.y + xmovement;
          break;
        case 'bottomLeft':
          this.width = this.width + xmovement;
          this.height = this.width / ratio;
          this.x = this.x - xmovement;
          break;
        case 'bottomRight':
          this.width = this.width - xmovement;
          this.height = this.width / ratio;
          break;
        case 'top':
          this.height = this.height + ymovement;
          this.y = this.y - ymovement;
          break;
        case 'bottom':
          this.height = this.height - ymovement;
          break;
        case 'left':
          this.width = this.width + xmovement;
          this.x = this.x - xmovement;
          break;
        case 'right':
          this.width = this.width - xmovement;
          break;
        default:
          break;
      }
    }
  }

  public snapToGrid(
    dragOffset: Point,
    mousePos: Point,
    gridOffset: Point,
    gridSize: number
  ) {
    var newX =
      Math.round((mousePos.x - dragOffset.x) / gridSize) * gridSize +
      gridOffset.x;
    var newY =
      Math.round((mousePos.y - dragOffset.y) / gridSize) * gridSize +
      gridOffset.y;

    if (newX != this.x) {
      this.x = newX;
    }
    if (newY != this.y) {
      this.y = newY;
    }
  }

  public moveElement(dragOffset: Point, mousePos: Point) {
    this.x = mousePos.x - dragOffset.x;
    this.y = mousePos.y - dragOffset.y;
  }
}
