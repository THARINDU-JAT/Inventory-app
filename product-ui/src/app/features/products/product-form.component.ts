import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductRequest } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  @Input() modal = false;
  @Input() productId: number | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @ViewChild('formDialog') private readonly formDialog?: ElementRef<HTMLDialogElement>;

  /** null = create mode, number = edit mode */
  protected id: number | null = null;
  protected readonly saving = signal(false);
  protected readonly loadingProduct = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]]
  });

  ngOnInit(): void {
    this.id = this.modal ? this.productId : Number(this.route.snapshot.paramMap.get('id')) || null;
    if (this.id) {
      this.loadingProduct.set(true);
      this.service.getById(this.id).subscribe({
        next: (product) => {
          this.form.patchValue({ ...product, description: product.description ?? '' });
          this.loadingProduct.set(false);
        },
        error: () => {
          this.loadingProduct.set(false);
          this.cancel();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.modal) this.formDialog?.nativeElement.showModal();
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
        this.notifications.success(`"${payload.name}" was ${this.id ? 'updated' : 'created'}`);
        if (this.modal) {
          this.formDialog?.nativeElement.close();
          this.saved.emit();
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: () => this.saving.set(false)
    });
  }

  protected cancel(): void {
    if (this.modal) {
      this.formDialog?.nativeElement.close();
      this.closed.emit();
    } else {
      this.router.navigate(['/products']);
    }
  }

  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.formDialog?.nativeElement) this.cancel();
  }

  protected onDialogCancel(): void {
    this.closed.emit();
  }

  protected hasError(control: 'name' | 'description' | 'price' | 'quantity', error: string): boolean {
    const c = this.form.controls[control];
    return c.touched && c.hasError(error);
  }
}
