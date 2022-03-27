import {
  AfterViewInit,
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
import { ImageObject } from 'src/app/models/image-object.model';
import { fromEvent, zip } from 'rxjs';
import {
  concatAll,
  map,
  concatWith,
  take,
  finalize,
  delay,
} from 'rxjs/operators';

@Component({
  selector: 'openvtt-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, AfterViewInit, OnChanges {
  constructor(
    public backgroundService: BackgroundService,
    public sharedService: SharedService
  ) {}

  @Input()
  zArray: any[] = [];
  @Output() zArrayChange = new EventEmitter<any[]>();

  @ViewChild('canvas', { static: true })
  private canvasElementRef!: ElementRef<HTMLCanvasElement>;
  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;

  private dragOffset: Point = new Point(0, 0);
  private gridOffset: Point = new Point(0, 0);
  private panOffset: Point = new Point(0, 0);
  private mousePos: Point = new Point(0, 0);

  //FLAGS
  private isDraggingMap: boolean = false;
  private isDraggingElement: boolean = false;
  private anchorPulled: string | undefined;
  private selectedElement: ResizableObject | undefined;

  ngOnInit(): void {
    this.canvas = this.canvasElementRef.nativeElement;
    this.context = this.canvas.getContext('2d')!;
    this.sharedService.render.subscribe((changes) => {
      this.render();
    });
  }

  test() {
    var token = new ImageObject({
      height: 700,
      width: undefined,
      x: 450,
      y: 225,
      selected: false,
      element: new window.Image(),
      url: 'https://i.imgur.com/INLD2IJ.jpg',
    });

    var clipmask = new ImageObject({
      height: undefined,
      width: undefined,
      x: 450,
      y: 225,
      selected: false,
      element: new window.Image(),
      url: 'https://i.imgur.com/Y7VG1Qq.png',
    });

    var frame = new ImageObject({
      height: undefined,
      width: undefined,
      x: 450,
      y: 225,
      selected: false,
      element: new window.Image(),
      url: 'https://i.imgur.com/bHEemdi.jpg',
    });

    const token$ = fromEvent(token.element, 'load').pipe(
      take(1),
      map(() => {
        return { image: token, composition: 'source-over' };
      })
    );

    const clipMask$ = fromEvent(clipmask.element, 'load').pipe(
      take(1),
      map(() => {
        return { image: clipmask, composition: 'destination-in' };
      })
    );

    const frame$ = fromEvent(frame.element, 'load').pipe(
      take(1),
      map(() => {
        return { image: frame, composition: 'source-over' };
      })
    );
    //load img
    token.element.src = token.url;
    clipmask.element.src = clipmask.url;
    frame.element.src = frame.url;

    zip(token$, clipMask$, frame$).subscribe((res) => {
      res.forEach((img) => {
        if (img.composition == 'source-over') {
          this.context.globalCompositeOperation = img.composition;
        }
        if (img.composition == 'destination-in') {
          this.context.globalCompositeOperation = img.composition;
        }
        this.context.drawImage(
          img.image.element,
          img.image.x,
          img.image.y,
          img.image.width,
          img.image.height
        );
      });
    });
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.context) {
      if (changes.zArray) {
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
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keypress', this.keyPress.bind(this), false);
    window.addEventListener(
      'resize',
      this.resizeCanvasToDisplaySize.bind(this),
      false
    );
  }

  /* EVENTS HANDLERS */
  private mouseDown(event: MouseEvent) {
    // Convert mouse coordinates to world coordinates
    const wMousePos = this.ScreenToWorld(event.offsetX, event.offsetY);

    // [ LEFT CLICK ]
    if (event.button === 0) {
      //First check if we have clicked on an anchor from the selected object
      var anchor = this.getClickedAnchor(
        event.offsetX,
        event.offsetY,
        this.selectedElement
      );
      if (anchor) {
        this.anchorPulled = anchor;
      }
      // If not, check if we have clicked on an object
      else {
        var match = false;
        for (let i = this.zArray.length - 1; i >= 0 && !match; i--) {
          const element: ResizableObject = this.zArray[i];
          if (
            element.ContainsPoint({
              x: wMousePos.x,
              y: wMousePos.y,
            })
          ) {
            this.selectedElement = element;
            this.sharedService.selectedObject = element;
            this.isDraggingElement = true;
            this.dragOffset.set(
              event.offsetX - element.x * this.sharedService.zoom,
              event.offsetY - element.y * this.sharedService.zoom
            );
            match = true;
          }
          if (!match) {
            this.selectedElement = undefined;
          }
        }
        this.render();
      }
    }

    //[ MIDDLE CLICK ]
    if (event.button === 1) {
      this.isDraggingMap = true;
      this.dragOffset.set(event.offsetX, event.offsetY);
    }
  }

  private mouseOut(event: MouseEvent) {
    this.isDraggingElement = false;
    this.isDraggingMap = false;
    this.dragOffset.set(0, 0);
  }

  private mouseMove(event: MouseEvent) {
    const wMousePos = this.ScreenToWorld(event.offsetX, event.offsetY);
    if (this.anchorPulled) {
      if (this.backgroundService.snapToGrid) {
        this.selectedElement?.resizeSnapToGrid(
          this.ScreenToWorld(this.dragOffset.x, this.dragOffset.y),
          wMousePos,
          this.backgroundService.gridSize,
          this.anchorPulled
        );
      } else {
        this.selectedElement!.resizeElement(
          this.anchorPulled,
          wMousePos.x,
          wMousePos.y
        );
      }

      this.render();
    }
    if (this.isDraggingElement) {
      if (this.backgroundService.snapToGrid) {
        this.selectedElement?.snapToGrid(
          this.ScreenToWorld(this.dragOffset.x, this.dragOffset.y),
          wMousePos,
          this.backgroundService.gridSize
        );
      } else {
        this.selectedElement!.moveElement(
          wMousePos,
          this.ScreenToWorld(this.dragOffset.x, this.dragOffset.y)
        );
      }
      this.render();
    }
    if (this.isDraggingMap) {
      this.pan(event.offsetX, event.offsetY);
      var gridOffsetX =
        (((this.panOffset.x % this.backgroundService.gridSize) %
          this.backgroundService.gridSize) +
          this.backgroundService.gridSize) %
        this.backgroundService.gridSize;
      var gridOffsetY =
        (((this.panOffset.y % this.backgroundService.gridSize) %
          this.backgroundService.gridSize) +
          this.backgroundService.gridSize) %
        this.backgroundService.gridSize;
      this.gridOffset.set(gridOffsetX, gridOffsetY);
    }
  }
  private mouseUp(event: MouseEvent) {
    this.dragOffset.set(0, 0);
    this.anchorPulled = undefined;
    this.isDraggingElement = false;
    this.isDraggingMap = false;
  }

  private wheelEvent(event: WheelEvent) {
    this.zoom(event);
  }

  private zoom(event: WheelEvent) {
    this.mousePos.set(event.offsetX, event.offsetY);
    var mouseWorldPosBeforeZoom = this.ScreenToWorld(
      this.mousePos.x,
      this.mousePos.y
    );
    var zoom = 1 + -event.deltaY / 1000;
    this.sharedService.zoom = this.sharedService.zoom * zoom;
    var mouseWorldPosAfterZoom = this.ScreenToWorld(
      this.mousePos.x,
      this.mousePos.y
    );

    this.panOffset.x += mouseWorldPosBeforeZoom.x - mouseWorldPosAfterZoom.x;
    this.panOffset.y += mouseWorldPosBeforeZoom.y - mouseWorldPosAfterZoom.y;

    this.render();
  }
  private pan(x: number, y: number, dragOffset: Point = this.dragOffset) {
    this.panOffset.x -= (x - dragOffset.x) / this.sharedService.zoom;
    this.panOffset.y -= (y - dragOffset.y) / this.sharedService.zoom;
    dragOffset.y = y;
    dragOffset.x = x;
    this.render();
  }

  private keyPress(event: KeyboardEvent) {
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

  //draw a grid on the canvas considering the grid size, the grid offset(this.panOffset) and the zoom(this.sharedService.zoom)
  private drawGrid() {
    this.context.strokeStyle = '#333333';
    this.context.fillStyle = '#333333';
    this.context.lineWidth = 0.5;
    for (
      var x =
        (-this.panOffset.x % this.backgroundService.gridSize) *
        this.sharedService.zoom;
      x < this.canvas.width;
      x += this.backgroundService.gridSize * this.sharedService.zoom
    ) {
      this.drawLine(x, 0, x, this.canvas.height);
    }
    for (
      var y =
        (-this.panOffset.y % this.backgroundService.gridSize) *
        this.sharedService.zoom;
      y < this.canvas.height;
      y += this.backgroundService.gridSize * this.sharedService.zoom
    ) {
      this.drawLine(0, y, this.canvas.width, y);
    }
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }

  //this function draws a square around a image with a padding and a anchor in every corner
  private drawAnchors(image: ResizableObject) {
    const zoom = this.sharedService.zoom;
    const adjustedPoint = this.WorldToScreen(image.x, image.y);
    const adjustedWidth = image.width * zoom;
    const adjustedHeight = image.height * zoom;
    this.context.strokeStyle = ANCHOR_CONFIG.lineColor;
    this.context.lineWidth = ANCHOR_CONFIG.lineWidth;

    this.context.strokeRect(
      adjustedPoint.x - ANCHOR_CONFIG.padding,
      adjustedPoint.y - ANCHOR_CONFIG.padding,
      adjustedWidth + ANCHOR_CONFIG.padding * 2,
      adjustedHeight + ANCHOR_CONFIG.padding * 2
    );
    this.drawAnchor(
      adjustedPoint.x - ANCHOR_CONFIG.padding,
      adjustedPoint.y - ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      adjustedPoint.x + adjustedWidth + ANCHOR_CONFIG.padding,
      adjustedPoint.y - ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      adjustedPoint.x - ANCHOR_CONFIG.padding,
      adjustedPoint.y + adjustedHeight + ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      adjustedPoint.x + adjustedWidth + ANCHOR_CONFIG.padding,
      adjustedPoint.y + adjustedHeight + ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      adjustedPoint.x + adjustedWidth / 2,
      adjustedPoint.y - ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      adjustedPoint.x + adjustedWidth / 2,
      adjustedPoint.y + adjustedHeight + ANCHOR_CONFIG.padding
    );
    this.drawAnchor(
      adjustedPoint.x - ANCHOR_CONFIG.padding,
      adjustedPoint.y + adjustedHeight / 2
    );
    this.drawAnchor(
      adjustedPoint.x + adjustedWidth + ANCHOR_CONFIG.padding,
      adjustedPoint.y + adjustedHeight / 2
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

    var ajustedCoords = this.WorldToScreen(image.x, image.y);
    this.context.drawImage(
      image.element,
      ajustedCoords.x,
      ajustedCoords.y,
      image.width * this.sharedService.zoom,
      image.height * this.sharedService.zoom
    );
  }

  private WorldToScreen(x: number, y: number) {
    return {
      x: Math.round((x - this.panOffset.x) * this.sharedService.zoom),
      y: Math.round((y - this.panOffset.y) * this.sharedService.zoom),
    };
  }

  private ScreenToWorld(x: number, y: number) {
    return {
      x: x / this.sharedService.zoom + this.panOffset.x,
      y: y / this.sharedService.zoom + this.panOffset.y,
    };
  }

  public getClickedAnchor(
    x: number,
    y: number,
    image: ResizableObject | undefined
  ): string | undefined {
    if (!image) return undefined;

    var ImageTopLeft = this.WorldToScreen(image.x, image.y);
    var ImageBottomRight = this.WorldToScreen(
      image.x + image.width,
      image.y + image.height
    );

    var topLeft: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: ImageTopLeft.x - ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
      y: ImageTopLeft.y - ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
    });
    var topRight: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: ImageBottomRight.x + ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
      y: ImageTopLeft.y - ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
    });
    var bottomLeft: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: ImageTopLeft.x - ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
      y: ImageBottomRight.y + ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
    });
    var bottomRight: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: ImageBottomRight.x + ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
      y: ImageBottomRight.y + ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
    });
    var top: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x:
        ImageTopLeft.x +
        (ImageBottomRight.x - ImageTopLeft.x) / 2 -
        ANCHOR_CONFIG.size,
      y: ImageTopLeft.y - ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
    });
    var bottom: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x:
        ImageTopLeft.x +
        (ImageBottomRight.x - ImageTopLeft.x) / 2 -
        ANCHOR_CONFIG.size,
      y: ImageBottomRight.y + ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
    });
    var left: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: ImageTopLeft.x - ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
      y:
        ImageTopLeft.y +
        (ImageBottomRight.y - ImageTopLeft.y) / 2 -
        ANCHOR_CONFIG.size,
    });
    var right: ResizableObject = new ResizableObject({
      width: 16,
      height: 16,
      x: ImageBottomRight.x + ANCHOR_CONFIG.padding - ANCHOR_CONFIG.size,
      y: ImageTopLeft.y + (ImageBottomRight.y - ImageTopLeft.y) / 2,
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

  private render() {
    console.log('render');
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
