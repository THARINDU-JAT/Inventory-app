export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductRequest = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
