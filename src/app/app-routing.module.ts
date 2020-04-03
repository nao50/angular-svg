import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ZoomComponent } from './zoom/zoom.component';
import { GridComponent } from './grid/grid.component';


const routes: Routes = [
  {
    path: 'zoom',
    component: ZoomComponent,
  },
  {
    path: 'grid',
    component: GridComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
