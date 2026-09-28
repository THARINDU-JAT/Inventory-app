import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/products/product-list.component').then((m) => m.ProductListComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'products' }
];
