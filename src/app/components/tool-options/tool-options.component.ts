import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ImageObject } from 'src/app/models/image-object.model';
import { BackgroundService } from 'src/app/services/background.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'openvtt-tool-options',
  templateUrl: './tool-options.component.html',
  styleUrls: ['./tool-options.component.scss'],
})
export class ToolOptionsComponent implements OnInit {
  constructor(
    public backgroundService: BackgroundService,
    public sharedService: SharedService
  ) {}

  selectedColor: string = '#c32af3';

  @ViewChild('imageUploader', { static: false })
  imageUploader!: ElementRef<HTMLCanvasElement>;

  @ViewChild('fileUpload', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  @Input()
  layer: any[] = [];
  @Output() layerChange = new EventEmitter<any[]>();

  fileName: string | undefined = undefined;

  onFileSelected(event: any) {
    console.log('onFileSelected', event, this.fileInput.nativeElement.value);
    if (event.target.files[0].name) {
      console.log(event.target.files[0].name);
      this.handleImage(event);
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // this.imageUploader.nativeElement.addEventListener(
    //   'change',
    //   this.handleImage.bind(this),
    //   false
    // );
  }

  private handleImage(e: any): void {
    this.fileName = e.target.files[0].name;
    var reader = new FileReader();
    reader.addEventListener('load', (event) => {
      var img = new Image();
      if (typeof event?.target?.result === 'string') {
        var bg = new ImageObject({
          height: -1,
          width: -1,
          x: 450,
          y: 225,
          selected: false,
          element: new window.Image(),
          url: event.target.result,
        });
        bg.element.src = bg.url;
        bg.element.addEventListener('load', () => {
          this.layer = [...this.layer, bg];
          this.layerChange.emit(this.layer);
        });
        this.fileInput.nativeElement.value = '';
      }
    });
    if (e?.target?.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  onLoadToken() {}
}
