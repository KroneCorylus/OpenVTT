import {
  animate,
  keyframes,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { ResizableObject } from 'src/app/models/resizable-object.model';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'openvtt-selected-details',
  templateUrl: './selected-details.component.html',
  styleUrls: ['./selected-details.component.scss'],
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
    trigger('colorsAnimation', [
      transition('void => slide-in', [
        // Initially all colors are hidden
        query(':enter', style({ opacity: 0 }), { optional: true }),
        //slide-in animation
        query(
          ':enter',
          stagger('200ms', [
            animate(
              '.3s ease-in',
              keyframes([
                style({ opacity: 0, transform: 'translatex(-50%)', offset: 0 }),
                style({
                  opacity: 0.5,
                  transform: 'translatex(-10px) scale(1.1)',
                  offset: 0.3,
                }),
                style({ opacity: 1, transform: 'translatex(0)', offset: 1 }),
              ])
            ),
          ]),
          { optional: true }
        ),
      ]),
      //popup animation
      transition('void => popup', [
        query(':enter', style({ opacity: 0, transform: 'scale(0)' }), {
          optional: true,
        }),
        query(
          ':enter',
          stagger('10ms', [
            animate(
              '500ms ease-out',
              keyframes([
                style({ opacity: 0.5, transform: 'scale(.5)', offset: 0.3 }),
                style({ opacity: 1, transform: 'scale(1.1)', offset: 0.8 }),
                style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
              ])
            ),
          ]),
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class SelectedDetailsComponent implements OnInit {
  constructor(public sharedService: SharedService) {}

  animation = 'slide';
  ngOnInit(): void {}
}
