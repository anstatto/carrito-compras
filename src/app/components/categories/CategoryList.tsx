import { prisma } from "@/lib/prisma";
import CategoryCard from "./CategoryCard";

async function getCategories() {
  const categories = await prisma.categoria.findMany({
    where: {
      activa: true,
    },
    include: {
      _count: {
        select: { productos: true },
      },
    },
  });
  return categories;
}

export default async function CategoryList() {
  const categories = await getCategories();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-6">
      {categories.map((category, index) => {
        const categoryData = {
          ...category,
          descripcion: category.descripcion || undefined
        };
        return (
          <CategoryCard 
            key={category.id} 
            category={{
              ...categoryData,
              imagen: categoryData.imagen || undefined
            }}
            index={index} 
          />
        );
      })}
    </div>
  );
}
