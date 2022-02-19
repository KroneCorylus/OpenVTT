import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ToolOptionsComponent } from './components/tool-options/tool-options.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackgroundService } from './services/background.service';
import { NgxColorsModule } from 'ngx-colors';
import { MatInputModule } from '@angular/material/input';
import { SelectedDetailsComponent } from './components/selected-details/selected-details.component';
import { SharedService } from './services/shared.service';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    ToolbarComponent,
    SidebarComponent,
    ToolOptionsComponent,
    SelectedDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule,
    NgxColorsModule,
    MatInputModule,
  ],
  providers: [BackgroundService, SharedService],
  bootstrap: [AppComponent],
})
export class AppModule {}
