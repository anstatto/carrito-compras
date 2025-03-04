import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryList } from "./_components/CategoryList";
import PageHeader from "../_components/PageHeader";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Categorías | Admin",
  description: "Administración de categorías",
};

export default async function CategoriesPage() {
  const categories = await prisma.categoria.findMany({
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Categorías"
          description="Administra las categorías de productos"
        />
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r 
                   from-pink-500 to-violet-500 text-white rounded-xl 
                   hover:from-pink-600 hover:to-violet-600 transition-all 
                   shadow-md hover:shadow-lg"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <CategoryList categories={categories} />
      </div>
    </div>
  );
}