import { ThisReceiver } from '@angular/compiler';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, AfterViewInit {
  isDraggingElement: boolean = false;
  constructor() {}

  @ViewChild('layer1', { static: true })
  canvasElementRef!: ElementRef<HTMLCanvasElement>;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  lastX?: number;
  lastY?: number;
  AnchorPulled: string | undefined;

  zArray: any[] = [];
  selectedElement: any;
  isDraggingMap: boolean = false;
  zoomValue: number = 1;
  gridSize = 45;
  xPan = 0;
  yPan = 0;
  snapToGrid: boolean = true;
  potencialMovementX = 0;
  potencialMovementY = 0;

  ngOnInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.context = this.canvas.getContext('2d')!;
    this.addImage();
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  private initCanvas() {
    this.resizeCanvasToDisplaySize();

    this.canvas.addEventListener('mousedown', this.mouseDown.bind(this), false);
    this.canvas.addEventListener('mousemove', this.mouseDrag.bind(this), false);
    this.canvas.addEventListener('mouseup', this.mouseUp.bind(this), false);
    this.canvas.addEventListener('wheel', this.wheelEvent.bind(this), false);
    document.addEventListener('keypress', this.keyPress.bind(this), false);
    window.addEventListener(
      'resize',
      this.resizeCanvasToDisplaySize.bind(this),
      false
    );
  }

  //Events

  private mouseDown(event: MouseEvent) {
    console.log('mouseDown', event);
    if (event.button === 0) {
      var anchor = this.getClickedAnchor(
        event.offsetX,
        event.offsetY,
        this.selectedElement
      );
      if (anchor) {
        this.lastX = event.offsetX;
        this.lastY = event.offsetY;
        this.AnchorPulled = anchor;
      } else {
        console.log('searching for element on click');
        var first = false;
        for (let i = this.zArray.length - 1; i >= 0; i--) {
          const element = this.zArray[i];
          this.drawGrid();
          if (this.isInBounds(event.offsetX, event.offsetY, element)) {
            if (!first) {
              this.selectedElement = element;
            }
            element.selected = first ? false : true;
            first = true;
          } else {
            element.selected = false;
          }
        }
        this.render();
      }
      if (
        this.selectedElement &&
        this.isInBounds(event.offsetX, event.offsetY, this.selectedElement)
      ) {
        this.lastX = event.offsetX;
        this.lastY = event.offsetY;
        this.isDraggingElement = true;
      } else {
        this.isDraggingElement = false;
      }
    }
    if (event.button === 1) {
      console.log('mouseDown middle ?', event);
      this.isDraggingMap = true;
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
    }
  }
  private mouseDrag(event: MouseEvent) {
    if (this.AnchorPulled && this.lastX && this.lastY) {
      console.log('Pulling Anchor', event);
      this.resizeElement(
        this.AnchorPulled,
        event.offsetX,
        event.offsetY,
        this.selectedElement
      );
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.render();
    }
    if (this.isDraggingElement && this.lastX && this.lastY) {
      console.log('Draging element', event);
      this.moveElement(event.offsetX, event.offsetY, this.selectedElement);
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.render();
    }
    if (this.isDraggingMap) {
      console.log('is dragging');
      this.moveMap(event.offsetX, event.offsetY);
    }
  }
  private mouseUp(event: MouseEvent) {
    console.log('mouseUp', event);
    if (this.AnchorPulled) {
      this.AnchorPulled = undefined;
      this.lastX = undefined;
      this.lastY = undefined;
    }
    if (this.isDraggingElement) {
      this.isDraggingElement = false;
    }
    if (this.isDraggingMap) {
      this.isDraggingMap = false;
    }
  }

  private wheelEvent(event: WheelEvent) {
    console.log('wheelEvent', event);
    this.zoom(event.deltaY);
  }

  private zoom(delta: number) {
    var zoom = 1 + -delta / 1000;
    this.gridSize = this.gridSize * zoom;
    this.xPan = this.xPan * zoom;
    this.yPan = this.yPan * zoom;
    // if (zoom > 0) {
    this.zArray.forEach((element) => {
      element.x = element.x * zoom;
      element.y = element.y * zoom;
      element.w = element.w * zoom;
      element.h = element.h * zoom;
    });
    this.render();
    // }
  }
  private moveMap(x: number, y: number) {
    if (this.lastX && this.lastY) {
      console.log('inside moveMap');
      var xmovement = this.lastX - x;
      var ymovement = this.lastY - y;
      this.zArray.forEach((element) => {
        element.x = element.x - xmovement;
        element.y = element.y - ymovement;
      });
      this.xPan = this.xPan - xmovement;
      this.yPan = this.yPan - ymovement;
      this.lastX = x;
      this.lastY = y;
      this.render();
    }
  }
  private moveElement(x: number, y: number, element: any) {
    if (this.lastX && this.lastY) {
      var xmovement = this.lastX - x;
      var ymovement = this.lastY - y;
      if (this.snapToGrid) {
        this.potencialMovementX = this.potencialMovementX + xmovement;
        this.potencialMovementY = this.potencialMovementY + ymovement;
        var newX =
          Math.round((element.x - this.potencialMovementX) / this.gridSize) *
          this.gridSize;
        Math.round((element.y - this.potencialMovementY) / this.gridSize) *
          this.gridSize;

        if (newX != element.x) {
          element.x = newX;
          this.potencialMovementX = 0;
        }
        // if (newY != element.y - (this.yPan % this.gridSize)) {
        //   element.y = newY;
        //   this.potencialMovementY = 0;
        // }
      } else {
        element.x = element.x - xmovement;
        element.y = element.y - ymovement;
      }
    }
  }
  private resizeElement(
    AnchorPulled: string,
    x: number,
    y: number,
    element: any
  ) {
    if (this.lastX && this.lastY) {
      var xmovement = this.lastX - x;
      var ymovement = this.lastY - y;
      if (AnchorPulled === 'topLeft') {
        element.w = element.w + xmovement;
        element.h = element.h + xmovement;
        element.x = element.x - xmovement;
        element.y = element.y - xmovement;
      }
      if (AnchorPulled === 'topRight') {
        element.w = element.w - xmovement;
        element.h = element.h - xmovement;
        element.y = element.y + xmovement;
      }
      if (AnchorPulled === 'bottomLeft') {
        element.w = element.w + xmovement;
        element.h = element.h + xmovement;
        element.x = element.x - xmovement;
      }
      if (AnchorPulled === 'bottomRight') {
        element.w = element.w - xmovement;
        element.h = element.h - xmovement;
      }
      if (AnchorPulled === 'top') {
        element.h = element.h + ymovement;
        element.y = element.y - ymovement;
      }
      if (AnchorPulled === 'bottom') {
        element.h = element.h - ymovement;
      }
      if (AnchorPulled === 'left') {
        element.w = element.w + xmovement;
        element.x = element.x - xmovement;
      }
      if (AnchorPulled === 'right') {
        element.w = element.w - xmovement;
      }
    }
  }

  private keyPress(event: KeyboardEvent) {
    console.log('keyPress', event);
    if (event.key === 'Delete') {
      this.deleteElement(this.selectedElement);
    }
  }

  private deleteElement(element: any) {
    if (!element) return;
    const index = this.zArray.indexOf(element);
    this.zArray.splice(index, 1);
    this.selectedElement = undefined;
    this.render();
  }

  private drawGrid() {
    this.context.strokeStyle = '#333333';
    this.context.fillStyle = '#333333';
    this.context.lineWidth = 0.5;
    for (let i = this.xPan; i < this.canvas.width; i += this.gridSize) {
      this.drawLine(i, 0, i, this.canvas.height);
    }
    for (let i = this.yPan; i < this.canvas.height; i += this.gridSize) {
      this.drawLine(0, i, this.canvas.width, i);
    }
    for (let i = this.xPan; i > 0; i -= this.gridSize) {
      this.drawLine(i, 0, i, this.canvas.height);
    }
    for (let i = this.yPan; i > 0; i -= this.gridSize) {
      this.drawLine(0, i, this.canvas.width, i);
    }
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }

  private getClickedAnchor(
    x: number,
    y: number,
    element: any
  ): string | undefined {
    if (!element) return undefined;
    var topLeft = {
      w: 16,
      h: 16,
      x: element.x - 10 - 8,
      y: element.y - 10 - 8,
    };
    var topRight = {
      w: 16,
      h: 16,
      x: element.x + element.w + 10 - 8,
      y: element.y - 10 - 8,
    };
    var bottomLeft = {
      w: 16,
      h: 16,
      x: element.x - 10 - 8,
      y: element.y + element.h + 10 - 8,
    };
    var bottomRight = {
      w: 16,
      h: 16,
      x: element.x + element.w + 10 - 8,
      y: element.y + element.h + 10 - 8,
    };
    var top = {
      w: 16,
      h: 16,
      x: element.x + element.w / 2 - 8,
      y: element.y - 10 - 8,
    };
    var bottom = {
      w: 16,
      h: 16,
      x: element.x + element.w / 2 - 8,
      y: element.y + element.h + 10 - 8,
    };
    var left = {
      w: 16,
      h: 16,
      x: element.x - 10 - 8,
      y: element.y + element.h / 2 - 8,
    };
    var right = {
      w: 16,
      h: 16,
      x: element.x + element.w + 10 - 8,
      y: element.y + element.h / 2 - 8,
    };
    if (this.isInBounds(x, y, topLeft)) {
      return 'topLeft';
    } else if (this.isInBounds(x, y, topRight)) {
      return 'topRight';
    } else if (this.isInBounds(x, y, bottomLeft)) {
      return 'bottomLeft';
    } else if (this.isInBounds(x, y, bottomRight)) {
      return 'bottomRight';
    } else if (this.isInBounds(x, y, top)) {
      return 'top';
    } else if (this.isInBounds(x, y, bottom)) {
      return 'bottom';
    } else if (this.isInBounds(x, y, left)) {
      return 'left';
    } else if (this.isInBounds(x, y, right)) {
      return 'right';
    } else {
      return undefined;
    }
  }

  //this function draws a square around a image with a padding of 10px and a anchor in every corner
  private drawAnchors(image: any) {
    this.context.strokeStyle = '#2196f3';
    this.context.lineWidth = 1;
    this.context.strokeRect(
      image.x - 10,
      image.y - 10,
      image.w + 20,
      image.h + 20
    );
    this.drawAnchor(image.x - 10, image.y - 10);
    this.drawAnchor(image.x + image.w + 10, image.y - 10);
    this.drawAnchor(image.x - 10, image.y + image.h + 10);
    this.drawAnchor(image.x + image.w + 10, image.y + image.h + 10);
    this.drawAnchor(image.x + image.w / 2, image.y - 10);
    this.drawAnchor(image.x + image.w / 2, image.y + image.h + 10);
    this.drawAnchor(image.x - 10, image.y + image.h / 2);
    this.drawAnchor(image.x + image.w + 10, image.y + image.h / 2);
  }

  private drawAnchor(x: number, y: number) {
    this.context.strokeStyle = '#2196f3';
    this.context.fillStyle = '#2196f3';
    this.context.lineWidth = 1;
    this.context.fillRect(x - 4, y - 4, 8, 8);
  }

  private isInBounds(x: number, y: number, element: any) {
    return (
      x >= element.x &&
      x <= element.x + element.w &&
      y >= element.y &&
      y <= element.y + element.h
    );
  }

  // Resize method for the canvas
  private resizeCanvasToDisplaySize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.render();
  }

  private addImage() {
    var bg = {
      h: 1620,
      w: 1620,
      x: 0,
      y: 0,
      selected: false,
      element: new window.Image(),
      url: 'assets/map1.jpg',
    };
    bg.element.addEventListener('load', () => {
      this.render();
    });
    bg.element.src = bg.url;
    this.zArray.push(bg);
    // var bg2 = {
    //   h: 900,
    //   w: 900,
    //   x: 400,
    //   y: 400,
    //   selected: false,
    //   element: new window.Image(),
    //   url: 'assets/map1.jpg',
    // };
    // bg2.element.addEventListener('load', () => {
    //   this.render();
    // });
    // bg2.element.src = bg2.url;

    // this.zArray.push(bg2);

    // var bg3 = {
    //   h: 200,
    //   w: 200,
    //   x: 800,
    //   y: 300,
    //   selected: false,
    //   element: new window.Image(),
    //   url: 'assets/map1.jpg',
    // };
    // bg3.element.addEventListener('load', () => {
    //   this.render();
    // });
    // bg3.element.src = bg3.url;

    // this.zArray.push(bg3);
  }

  drawImage(image: any) {
    this.context.drawImage(image.element, image.x, image.y, image.w, image.h);
  }

  private render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.zArray.forEach((element: any) => {
      this.drawImage(element);
    });
    if (this.selectedElement) {
      this.drawAnchors(this.selectedElement);
    }
    this.drawGrid();
  }
}
