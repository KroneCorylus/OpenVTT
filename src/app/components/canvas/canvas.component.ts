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

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, AfterViewInit, OnChanges {
  isDraggingElement: boolean = false;
  constructor(public backgroundService: BackgroundService) {}

  @ViewChild('layer1', { static: true })
  canvasElementRef!: ElementRef<HTMLCanvasElement>;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  lastX?: number;
  lastY?: number;
  AnchorPulled: string | undefined;

  @Input()
  zArray: any[] = [];
  @Output() zArrayChange = new EventEmitter<any[]>();

  selectedElement: any;
  isDraggingMap: boolean = false;
  zoomValue: number = 1;
  xPan = 0;
  yPan = 0;
  potencialMovementX = 0;
  potencialMovementY = 0;

  ngOnInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.context = this.canvas.getContext('2d')!;
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
    console.log(this.zArray);
    if (event.button === 0) {
      var anchor;
      if (this.selectedElement) {
        anchor = this.selectedElement.getClickedAnchor(
          event.offsetX,
          event.offsetY
        );
      }
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
          if (element.isInBounds(event.offsetX, event.offsetY)) {
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
        this.selectedElement.isInBounds(event.offsetX, event.offsetY)
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
      this.selectedElement.resizeElement(
        this.AnchorPulled,
        this.lastX,
        this.lastY,
        event.offsetX,
        event.offsetY,
        this.backgroundService,
        this.xPan,
        this.yPan
      );
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.render();
    }
    if (this.isDraggingElement && this.lastX && this.lastY) {
      console.log('Draging element', event);
      this.selectedElement.moveElement(
        this.lastX,
        this.lastY,
        event.offsetX,
        event.offsetY,
        this.backgroundService,
        this.xPan,
        this.yPan
      );
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.render();
    }
    if (this.isDraggingMap) {
      console.log('is dragging');
      this.pan(event.offsetX, event.offsetY);
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
  }
}
