import {
  animate,
  keyframes,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ResizableObject } from 'src/app/models/resizable-object.model';
import { SharedService } from 'src/app/services/shared.service';
import { debounceTime, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'openvtt-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  animations: [
    trigger('inOutAnimation', [
      transition('* => slide', [
        query('.detail-numeric-selector', style({ opacity: 0 }), {
          optional: true,
        }),
        query(
          '.detail-numeric-selector',
          stagger('50ms', [
            animate(
              '.3s ease-in',
              keyframes([
                style({ opacity: 0, transform: 'translatex(50%)', offset: 0 }),
                style({
                  opacity: 0.5,
                  transform: 'translatex(10px) scale(1.1)',
                  offset: 0.3,
                }),
                style({ opacity: 1, transform: 'translatex(0)', offset: 1 }),
              ])
            ),
          ]),
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class PropertiesComponent implements OnInit {
  constructor(
    public sharedService: SharedService,
    private _formBuilder: FormBuilder
  ) {}

  formDetails: FormGroup = new FormGroup({});

  animation = 'slide';
  ngOnInit(): void {
    this.formDetails = this._formBuilder.group({
      widthCtrl: new FormControl(null),
      heightCtrl: new FormControl(null),
      xCtrl: new FormControl(null),
      yCtrl: new FormControl(null),
    });

    this.sharedService.onSelectedObjectChanges
      .pipe(throttleTime(200, undefined, { leading: true, trailing: true }))
      .subscribe((changes) => {
        this.patchFormValues(changes);
      });

    this.formDetails.valueChanges.subscribe((value) => {
      this.sharedService.updateSelected(
        new ResizableObject({
          x: value.xCtrl ?? 0,
          y: value.yCtrl ?? 0,
          width: value.widthCtrl ?? 0,
          height: value.heightCtrl ?? 0,
        })
      );
      this.sharedService.render.next(undefined);
    });
  }

  private patchFormValues(resizableObject: ResizableObject | undefined) {
    if (resizableObject) {
      var changes: any = {};
      if (resizableObject.width != this.formDetails.controls.widthCtrl.value) {
        changes.widthCtrl = resizableObject.width;
      }
      if (
        resizableObject.height != this.formDetails.controls.heightCtrl.value
      ) {
        changes.heightCtrl = resizableObject.height;
      }
      if (resizableObject.x != this.formDetails.controls.xCtrl.value) {
        changes.xCtrl = resizableObject.x;
      }
      if (resizableObject.y != this.formDetails.controls.yCtrl.value) {
        changes.yCtrl = resizableObject.y;
      }
      if (changes && Object.keys(changes).length > 0) {
        this.formDetails.patchValue(changes);
      }
    }
  }
}
