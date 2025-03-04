import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { CategoryForm } from "../_components/CategoryForm";
import { Metadata } from "next";

type PageParams = {
  id: string;
};

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

interface PageProps {
  params: Promise<PageParams>;
  searchParams?: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const category = await prisma.categoria.findUnique({
      where: { id },
      select: { nombre: true },
    });

    if (!category) {
      return {
        title: "Categoría no encontrada | Admin",
        description: "La categoría que buscas no existe",
      };
    }

    return {
      title: `Editar ${category.nombre} | Admin`,
      description: `Modifica los detalles de la categoría ${category.nombre}`,
    };
  } catch {
    return {
      title: "Error | Admin",
      description: "Ocurrió un error al cargar la categoría",
    };
  }
}

export default async function CategoryPage({
  params,
}: PageProps) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      notFound();
    }

    const category = await prisma.categoria.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    if (!category) {
      notFound();
    }

    return (
      <div className="space-y-6 p-8">
        <PageHeader
          title={`Editar ${category.nombre}`}
          description={
            category._count.productos > 0
              ? `Esta categoría contiene ${category._count.productos} producto${
                  category._count.productos === 1 ? "" : "s"
                }`
              : "Esta categoría aún no tiene productos"
          }
        />

        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <CategoryForm category={category} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error al cargar la categoría:", error);
    notFound();
  }
} 