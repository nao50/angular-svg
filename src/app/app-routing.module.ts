import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ZoomComponent } from './zoom/zoom.component';
import { GridComponent } from './grid/grid.component';
import { Grid2Component } from './grid2/grid2.component';


const routes: Routes = [
  {
    path: 'zoom',
    component: ZoomComponent,
  },
  {
    path: 'grid',
    component: GridComponent,
  },
  {
    path: 'grid2',
    component: Grid2Component,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
