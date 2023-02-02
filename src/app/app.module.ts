import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { ToolOptionsComponent } from './components/tool-options/tool-options.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackgroundService } from './services/background.service';
import { NgxColorsModule } from 'ngx-colors';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { PropertiesComponent } from './components/properties/properties.component';
import { SharedService } from './services/shared.service';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    ToolbarComponent,
    SidebarComponent,
    ToolOptionsComponent,
    PropertiesComponent,
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
    MatButtonModule,
  ],
  providers: [BackgroundService, SharedService],
  bootstrap: [AppComponent],
})
export class AppModule {}
