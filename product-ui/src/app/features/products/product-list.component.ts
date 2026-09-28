import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Page } from '../../core/models/page.model';
import { Product } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private readonly service = inject(ProductService);
  private readonly notifications = inject(NotificationService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly pageInfo = signal<Pick<Page<Product>, 'number' | 'totalPages' | 'totalElements'>>({
    number: 0,
    totalPages: 0,
    totalElements: 0
  });

  protected readonly pageSize = 10;

  ngOnInit(): void {
    this.load(0);
  }

  protected load(page: number): void {
    this.loading.set(true);
    this.service.getAll(page, this.pageSize).subscribe({
      next: (res) => {
        this.products.set(res.content);
        this.pageInfo.set({
          number: res.number,
          totalPages: res.totalPages,
          totalElements: res.totalElements
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false) // toast is shown by the interceptor
    });
  }

  protected remove(product: Product): void {
    if (!confirm(`Delete "${product.name}"?`)) {
      return;
    }
    this.service.delete(product.id).subscribe(() => {
      this.notifications.success('Product deleted');
      // If we deleted the last item on a page, go back one page.
      const current = this.pageInfo().number;
      const target = this.products().length === 1 && current > 0 ? current - 1 : current;
      this.load(target);
    });
  }

  protected previous(): void {
    if (this.pageInfo().number > 0) {
      this.load(this.pageInfo().number - 1);
    }
  }

  protected next(): void {
    const { number, totalPages } = this.pageInfo();
    if (number < totalPages - 1) {
      this.load(number + 1);
    }
  }
}
