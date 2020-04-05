import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// material
import { MatButtonModule } from '@angular/material/button';

import { DrdrDirective } from './directives/drdr.directive';
import { ZoomComponent } from './zoom/zoom.component';
import { GridComponent } from './grid/grid.component';
import { Grid2Component } from './grid2/grid2.component';

@NgModule({
  declarations: [
    AppComponent,
    DrdrDirective,
    ZoomComponent,
    GridComponent,
    Grid2Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
