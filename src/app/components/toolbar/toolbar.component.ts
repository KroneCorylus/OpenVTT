import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'openvtt-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  constructor(public sharedService: SharedService) {}

  ngOnInit(): void {}

  onClickTool(tool: string) {
    this.setTool(tool);
  }

  private setTool(tool: string) {
    this.sharedService.selectedTool = tool;
  }
}
