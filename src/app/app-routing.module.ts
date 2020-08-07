import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './shared/error/error.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./secure/secure.module').then(m => m.SecureModule)
  },
  {
    path: '**', redirectTo: '404'
  },
  {
    path: '404', component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
