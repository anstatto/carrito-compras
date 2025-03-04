import { PageHeader } from "../../_components/PageHeader";
import { CategoryForm } from "../_components/CategoryForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nueva Categoría | Admin",
  description: "Crea una nueva categoría de productos",
};

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Nueva Categoría"
        description="Crea una nueva categoría de productos"
      />

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <CategoryForm />
        </div>
      </div>
    </div>
  );
} 