import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductRequest } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  /** null = create mode, number = edit mode */
  protected readonly id = Number(this.route.snapshot.paramMap.get('id')) || null;
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]]
  });

  ngOnInit(): void {
    if (this.id) {
      this.service.getById(this.id).subscribe({
        next: (product) => this.form.patchValue({ ...product, description: product.description ?? '' }),
        error: () => this.router.navigate(['/products'])
      });
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ProductRequest = this.form.getRawValue();
    const request$ = this.id ? this.service.update(this.id, payload) : this.service.create(payload);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.notifications.success(this.id ? 'Product updated' : 'Product created');
        this.router.navigate(['/products']);
      },
      error: () => this.saving.set(false)
    });
  }

  protected hasError(control: 'name' | 'description' | 'price' | 'quantity', error: string): boolean {
    const c = this.form.controls[control];
    return c.touched && c.hasError(error);
  }
}
