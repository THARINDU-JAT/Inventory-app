import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';

import { Page } from '../../core/models/page.model';
import { Product } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';
import { InventorySceneComponent } from './inventory-scene.component';
import { ProductFormComponent } from './product-form.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CurrencyPipe, InventorySceneComponent, ProductFormComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  @ViewChild('deleteDialog', { static: true }) private readonly deleteDialog!: ElementRef<HTMLDialogElement>;

  private readonly service = inject(ProductService);
  private readonly notifications = inject(NotificationService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly editorOpen = signal(false);
  protected readonly editingProduct = signal<Product | null>(null);
  protected readonly pendingDelete = signal<Product | null>(null);
  protected readonly deleting = signal(false);
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

  protected openEditor(product: Product | null = null): void {
    this.editingProduct.set(product);
    this.editorOpen.set(true);
  }

  protected closeEditor(): void {
    this.editorOpen.set(false);
    this.editingProduct.set(null);
  }

  protected onProductSaved(): void {
    const targetPage = this.editingProduct() ? this.pageInfo().number : 0;
    this.closeEditor();
    this.load(targetPage);
  }

  protected remove(product: Product): void {
    this.pendingDelete.set(product);
    this.deleteDialog.nativeElement.showModal();
  }

  protected cancelDelete(): void {
    this.deleteDialog.nativeElement.close();
    this.pendingDelete.set(null);
  }

  protected onDeleteDialogCancel(): void {
    this.pendingDelete.set(null);
  }

  protected onDeleteDialogClick(event: MouseEvent): void {
    if (event.target === this.deleteDialog.nativeElement) {
      this.cancelDelete();
    }
  }

  protected confirmDelete(): void {
    const product = this.pendingDelete();
    if (!product || this.deleting()) return;

    this.deleting.set(true);
    this.service.delete(product.id).subscribe({
      next: () => {
        this.notifications.success(`"${product.name}" was deleted`);
        this.deleting.set(false);
        this.cancelDelete();
        // If we deleted the last item on a page, go back one page.
        const current = this.pageInfo().number;
        const target = this.products().length === 1 && current > 0 ? current - 1 : current;
        this.load(target);
      },
      error: () => this.deleting.set(false)
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
