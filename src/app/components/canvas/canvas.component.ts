import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BackgroundService } from 'src/app/services/background.service';
import { ANCHOR_CONFIG } from 'src/app/components/const/anchor.config';
import { ResizableObject } from 'src/app/models/resizable-object.model';
import { Point } from 'src/app/models/point.model';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'openvtt-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, AfterViewInit, OnChanges {
  isDraggingElement: boolean = false;
  constructor(
    public backgroundService: BackgroundService,
    public sharedService: SharedService
  ) {}

  @ViewChild('layer1', { static: true })
  canvasElementRef!: ElementRef<HTMLCanvasElement>;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  lastX?: number;
  lastY?: number;
  dragOffset: Point = new Point(0, 0);
  gridOffset: Point = new Point(0, 0);
  anchorPulled: string | undefined;

  @Input()
  zArray: any[] = [];
  @Output() zArrayChange = new EventEmitter<any[]>();

  selectedElement: ResizableObject | undefined;
  isDraggingMap: boolean = false;
  zoomValue: number = 1;
  xPan = 0;
  yPan = 0;
  potencialMovementX = 0;
  potencialMovementY = 0;

  ngOnInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.context = this.canvas.getContext('2d')!;
    this.sharedService.render.subscribe((changes) => {
      console.log('render', changes);
      this.render();
    });
    // this.addImage();
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges', changes);
    if (this.context) {
      if (changes.zArray) {
        console.log('onChanges', changes.zArray);
        this.render();
      }
    }
  }

  private initCanvas() {
    this.resizeCanvasToDisplaySize();
    this.canvas.addEventListener('mousedown', this.mouseDown.bind(this), false);
    this.canvas.addEventListener('mousemove', this.mouseMove.bind(this), false);
    this.canvas.addEventListener('mouseout', this.mouseOut.bind(this), false);
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

  //Events Handlers
  private mouseDown(event: MouseEvent) {
    console.log('mouseDown this.selectedElement', this.selectedElement);
    console.log(
      'mouseDown this.sharedService.selectedObject',
      this.selectedElement
    );
    //Left Click
    if (event.button === 0) {
      var anchor = undefined;
      //Check if we have an element selected
      if (this.selectedElement) {
        anchor = this.selectedElement.getClickedAnchor(
          event.offsetX,
          event.offsetY
        );
        //Check if we clicked on an anchor
        if (anchor) {
          //#borrar
          this.selectedElement!.potencialMovementX = 0;
          this.selectedElement!.potencialMovementY = 0;
          //#borrar
          this.lastX = event.offsetX;
          this.lastY = event.offsetY;
          this.anchorPulled = anchor;
          this.dragOffset.set(
            event.offsetX - this.selectedElement.x,
            event.offsetY - this.selectedElement.y
          );
          console.log(this.dragOffset);
        }
        //Check if we clicked on the selected element
        else if (
          this.selectedElement.ContainsPoint({
            x: event.offsetX,
            y: event.offsetY,
          })
        ) {
          this.lastX = event.offsetX;
          this.lastY = event.offsetY;
          this.isDraggingElement = true;
          this.dragOffset.set(
            event.offsetX - this.selectedElement.x,
            event.offsetY - this.selectedElement.y
          );
        } else {
          this.selectedElement = undefined;
          this.sharedService.selectedObject = undefined;
        }
      }
      //If there is no element selected
      if (!this.selectedElement) {
        console.log('Search element on click');
        var first = false;
        for (let i = this.zArray.length - 1; i >= 0; i--) {
          const element: ResizableObject = this.zArray[i];
          this.drawGrid();
          if (element.ContainsPoint({ x: event.offsetX, y: event.offsetY })) {
            if (!first) {
              this.selectedElement = element;
              this.sharedService.selectedObject = element;
              this.lastX = event.offsetX;
              this.lastY = event.offsetY;
              this.isDraggingElement = true;
              this.dragOffset.set(
                event.offsetX - element.x,
                event.offsetY - element.y
              );
            }
            element.selected = first ? false : true;
            first = true;
          } else {
            element.selected = false;
          }
        }
        this.render();
      }
    }
    //Middle Click
    if (event.button === 1) {
      console.log('mouseDown middle ?', event);
      this.isDraggingMap = true;
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
    }
  }

  private mouseOut(event: MouseEvent) {
    this.selectedElement = undefined;
    // this.sharedService.selectedObject = undefined;
    this.isDraggingElement = false;
    this.isDraggingMap = false;
    this.dragOffset.set(0, 0);
  }

  private mouseMove(event: MouseEvent) {
    if (this.anchorPulled && this.lastX && this.lastY) {
      console.log('Pulling Anchor', event);
      if (this.backgroundService.snapToGrid) {
        this.selectedElement?.resizeSnapToGrid(
          this.dragOffset,
          new Point(event.offsetX, event.offsetY),
          this.gridOffset,
          this.backgroundService.gridSize,
          this.anchorPulled
        );
      } else {
        this.selectedElement!.resizeElement(
          this.anchorPulled,
          this.lastX,
          this.lastY,
          event.offsetX,
          event.offsetY
        );
      }

      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.render();
    }
    if (this.isDraggingElement && this.lastX && this.lastY) {
      console.log('Draging element', event);

      if (this.backgroundService.snapToGrid) {
        this.selectedElement?.snapToGrid(
          this.dragOffset,
          new Point(event.offsetX, event.offsetY),
          this.gridOffset,
          this.backgroundService.gridSize
        );
      } else {
        this.selectedElement!.moveElement(
          this.dragOffset,
          new Point(event.offsetX, event.offsetY)
        );
      }
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.render();
    }
    if (this.isDraggingMap) {
      this.pan(event.offsetX, event.offsetY);
      var gridOffsetX =
        (((this.xPan % this.backgroundService.gridSize) %
          this.backgroundService.gridSize) +
          this.backgroundService.gridSize) %
        this.backgroundService.gridSize;
      var gridOffsetY =
        (((this.yPan % this.backgroundService.gridSize) %
          this.backgroundService.gridSize) +
          this.backgroundService.gridSize) %
        this.backgroundService.gridSize;
      this.gridOffset.set(gridOffsetX, gridOffsetY);

      console.log(
        'panning',
        this.xPan,
        (((this.xPan % this.backgroundService.gridSize) %
          this.backgroundService.gridSize) +
          this.backgroundService.gridSize) %
          this.backgroundService.gridSize,
        this.yPan,
        (((this.yPan % this.backgroundService.gridSize) %
          this.backgroundService.gridSize) +
          this.backgroundService.gridSize) %
          this.backgroundService.gridSize
      );
    }
  }
  private mouseUp(event: MouseEvent) {
    console.log('mouseUp', event);
    this.dragOffset.set(0, 0);
    if (this.anchorPulled) {
      this.anchorPulled = undefined;
      this.lastX = undefined;
      this.lastY = undefined;
    }
    if (this.isDraggingElement) {
      this.isDraggingElement = false;
      if (this.selectedElement) {
        this.selectedElement.potencialMovementX = 0;
        this.selectedElement.potencialMovementY = 0;
      }
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
    this.backgroundService.gridSize = this.backgroundService.gridSize * zoom;
    this.xPan = this.xPan * zoom;
    this.yPan = this.yPan * zoom;
    this.zoomValue = this.zoomValue + -delta / 1000;
    this.zArray.forEach((element) => {
      element.x = element.x * zoom;
      element.y = element.y * zoom;
      element.width = element.width * zoom;
      element.height = element.height * zoom;
    });
    this.render();
    console.log('zoomValue', this.zoomValue);
  }
  private pan(x: number, y: number) {
    if (this.lastX && this.lastY) {
      console.log('paning', x, y);
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
    this.sharedService.selectedObject = undefined;
    this.zArrayChange.emit(this.zArray);
    this.render();
  }

  private drawGrid() {
    this.context.strokeStyle = '#333333';
    this.context.fillStyle = '#333333';
    this.context.lineWidth = 0.5;
    for (
      let i = this.xPan;
      i < this.canvas.width;
      i += this.backgroundService.gridSize
    ) {
      this.drawLine(i, 0, i, this.canvas.height);
    }
    for (
      let i = this.yPan;
      i < this.canvas.height;
      i += this.backgroundService.gridSize
    ) {
      this.drawLine(0, i, this.canvas.width, i);
    }
    for (let i = this.xPan; i > 0; i -= this.backgroundService.gridSize) {
      this.drawLine(i, 0, i, this.canvas.height);
    }
    for (let i = this.yPan; i > 0; i -= this.backgroundService.gridSize) {
      this.drawLine(0, i, this.canvas.width, i);
    }
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }

  //this function draws a square around a image with a padding and a anchor in every corner
  private drawAnchors(image: any) {
    this.context.strokeStyle = ANCHOR_CONFIG.lineColor;
    this.context.lineWidth = ANCHOR_CONFIG.lineWidth;
    this.context.strokeRect(
      image.x - ANCHOR_CONFIG.padding,
      image.y - ANCHOR_CONFIG.padding,
      image.width + ANCHOR_CONFIG.padding * 2,
      image.height + ANCHOR_CONFIG.padding * 2
    );
    this.drawAnchor(
      image.x - ANCHOR_CONFIG.padding,
      image.y - ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      image.x + image.width + ANCHOR_CONFIG.padding,
      image.y - ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      image.x - ANCHOR_CONFIG.padding,
      image.y + image.height + ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      image.x + image.width + ANCHOR_CONFIG.padding,
      image.y + image.height + ANCHOR_CONFIG.padding
    );
    this.drawAnchor(image.x + image.width / 2, image.y - ANCHOR_CONFIG.padding);
    this.drawAnchor(
      image.x + image.width / 2,
      image.y + image.height + ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      image.x - ANCHOR_CONFIG.padding,
      image.y + image.height / 2
    );
    this.drawAnchor(
      image.x + image.width + ANCHOR_CONFIG.padding,
      image.y + image.height / 2
    );
  }

  private drawAnchor(x: number, y: number) {
    this.context.strokeStyle = ANCHOR_CONFIG.fillColor;
    this.context.fillStyle = ANCHOR_CONFIG.fillColor;
    this.context.lineWidth = ANCHOR_CONFIG.lineWidth;
    this.context.fillRect(
      x - ANCHOR_CONFIG.size / 2,
      y - ANCHOR_CONFIG.size / 2,
      ANCHOR_CONFIG.size,
      ANCHOR_CONFIG.size
    );
  }

  // Resize method for the canvas
  private resizeCanvasToDisplaySize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.render();
  }

  private drawImage(image: any) {
    if (image.height == -1) {
      image.height = image.element.height;
      image.width = image.element.width;
    }
    this.context.drawImage(
      image.element,
      image.x,
      image.y,
      image.width,
      image.height
    );
  }

  private render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.zArray.forEach((element: any) => {
      this.drawImage(element);
    });
    this.drawGrid();
    if (this.selectedElement) {
      this.drawAnchors(this.selectedElement);
    }
    if (this.selectedElement) {
      this.sharedService.onSelectedObjectChanges.next(this.selectedElement);
    }
  }
}
