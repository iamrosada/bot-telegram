import { ProductsRepository } from "../../../../application/repositories/products-repository";
import { Product } from "../../../../domain/product";
import { prisma } from "../prisma";

export class PrismaProductsRepository implements ProductsRepository {
  async create(title: string): Promise<Product | null> {
    try {
      const createdProduct = await prisma.product.create({
        data: {
          title: title,
          id: crypto.randomUUID(),
        },
      });

      return new Product(
        {
          title: createdProduct.title,
        },
        createdProduct.id
      );
    } catch (error) {
      console.error("Error creating product:", error);
      return null;
    }
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return null;
    }

    return new Product(
      {
        title: product.title,
      },
      product.id
    );
  }
}
