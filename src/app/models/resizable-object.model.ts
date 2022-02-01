import { NgStyle } from '@angular/common';
import { ɵɵsetComponentScope } from '@angular/core';
import { Point } from './point.model';

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

  public resizeElement(
    AnchorPulled: string,
    lastX: number,
    lastY: number,
    x: number,
    y: number,
    backgroundService: any,
    xPan: number,
    yPan: number
  ) {
    console.log(
      AnchorPulled,
      lastX,
      lastY,
      x,
      y,
      xPan,
      yPan,
      this.potencialMovementX,
      this.potencialMovementY,
      backgroundService.snapToGrid
    );
    if (lastX && lastY) {
      var xmovement = lastX - x;
      var ymovement = lastY - y;
      var ratio = this.width / this.height;
      if (backgroundService.snapToGrid) {
        this.potencialMovementX = this.potencialMovementX + xmovement;
        this.potencialMovementY = this.potencialMovementY + ymovement;
        var newX =
          Math.round(
            (this.x -
              (xPan % backgroundService.gridSize) -
              this.potencialMovementX) /
              backgroundService.gridSize
          ) *
            backgroundService.gridSize +
          (xPan % backgroundService.gridSize);

        var newY =
          Math.round(
            (this.y -
              (yPan % backgroundService.gridSize) -
              this.potencialMovementY) /
              backgroundService.gridSize
          ) *
            backgroundService.gridSize +
          (yPan % backgroundService.gridSize);
        var deltaX = this.x - newX;
        var deltaY = this.y - newY;
        switch (AnchorPulled) {
          case 'topLeft':
            if (newX != this.x) {
              this.width = this.width + deltaX;
              this.height = this.width / ratio;
              this.y = this.y - deltaX;
              this.x = newX;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          case 'topRight':
            if (newX != this.x) {
              this.width = this.width - deltaX;
              this.height = this.width / ratio;
              this.y = this.y + deltaX;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          case 'bottomLeft':
            if (newX != this.x) {
              this.width = this.width + deltaX;
              this.height = this.width / ratio;
              this.x = this.x - deltaX;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          case 'bottomRight':
            if (newX != this.x) {
              this.width = this.width - deltaX;
              this.height = this.width / ratio;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          case 'top':
            if (newY != this.y) {
              this.height = this.height + deltaY;
              this.y = this.y - deltaY;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          case 'bottom':
            if (newY != this.y) {
              this.height = this.height - deltaY;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          case 'left':
            if (newX != this.x) {
              this.width = this.width + deltaX;
              this.x = this.x - deltaX;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          case 'right':
            if (newX != this.x) {
              this.width = this.width - deltaX;
              this.potencialMovementX = 0;
              this.potencialMovementY = 0;
            }
            break;
          default:
            break;
        }
      } else {
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
