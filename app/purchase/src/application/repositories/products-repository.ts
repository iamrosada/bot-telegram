import { Product } from "../../domain/product";

export interface ProductsRepository {
  findById(id: string): Promise<Product | null>;
  create(title: string): Promise<Product | null>;
  list(): Promise<Product[] | []>;
}
