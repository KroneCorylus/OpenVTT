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
import { FormsModule } from '@angular/forms';
import { BackgroundService } from './services/background.service';
@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    ToolbarComponent,
    SidebarComponent,
    ToolOptionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule,
  ],
  providers: [BackgroundService],
  bootstrap: [AppComponent],
})
export class AppModule {}
