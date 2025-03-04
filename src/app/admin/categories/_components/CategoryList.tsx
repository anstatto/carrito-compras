"use client";

import { useState } from "react";
import { FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Categoria } from "@prisma/client";

interface CategoryListProps {
  categories: Categoria[];
}

export function CategoryList({ categories: initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar categoría");

      toast.success("Categoría eliminada");
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      toast.error("Error al eliminar la categoría");
      console.error(error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !currentStatus }),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");
      
      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, activa: !currentStatus } : cat
        )
      );
      
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar estado");
      console.error(error);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 
                   focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                   transition-all shadow-sm"
        />
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
      </div>

      <div className="grid gap-6">
        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md 
                     transition-all border border-gray-100 group"
          >
            <div className="flex items-center gap-6">
              <Link
                href={`/admin/categories/${category.id}`}
                className="relative h-20 w-20 rounded-xl overflow-hidden 
                         shadow-md group-hover:scale-105 transition-transform"
              >
                <Image
                  src={category.imagen || "/placeholder.jpg"}
                  alt={category.nombre}
                  sizes="80px"
                  priority={true}
                  className="object-cover"
                  fill
                />
              </Link>

              <Link
                href={`/admin/categories/${category.id}`}
                className="flex-1 hover:opacity-75 transition-opacity"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {category.nombre}
                </h3>
                <p className="text-gray-600 mt-1">{category.descripcion}</p>
              </Link>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleStatus(category.id, category.activa)}
                  className={`p-3 rounded-xl transition-all ${
                    category.activa
                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >
                  {category.activa ? (
                    <FaEye className="w-5 h-5" />
                  ) : (
                    <FaEyeSlash className="w-5 h-5" />
                  )}
                </motion.button>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="p-3 text-blue-600 hover:bg-blue-50 
                             rounded-xl transition-all inline-block"
                  >
                    <FaEdit className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(category.id)}
                  className="p-3 text-red-600 hover:bg-red-50 
                           rounded-xl transition-all"
                >
                  <FaTrash className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm"
          >
            <p className="text-xl text-gray-500 font-medium">
              No se encontraron categorías
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 