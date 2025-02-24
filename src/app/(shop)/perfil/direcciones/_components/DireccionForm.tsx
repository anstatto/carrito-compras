"use client";

import React, { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { AgenciaEnvio, ProvinciaRD } from "@prisma/client";

interface DireccionFormProps {
  onSuccess?: () => void;
  direccionInicial?: {
    id?: string;
    calle: string;
    numero: string;
    sector: string;
    municipio: string;
    provincia: ProvinciaRD;
    codigoPostal?: string;
    referencia?: string;
    telefono: string;
    celular?: string;
    agenciaEnvio?: AgenciaEnvio;
    sucursalAgencia?: string;
    predeterminada: boolean;
  };
}

const SubmitButton = memo(({ isSubmitting }: { isSubmitting: boolean }) => (
  <motion.button
    type="submit"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={isSubmitting}
    className="px-8 py-2.5 text-white bg-gradient-to-r from-pink-500 to-violet-500 
               rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
  >
    {isSubmitting ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
      />
    ) : (
      "Guardar Dirección"
    )}
  </motion.button>
));
SubmitButton.displayName = "SubmitButton";

export default function DireccionForm({
  onSuccess,
  direccionInicial,
}: DireccionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    calle: direccionInicial?.calle || "",
    numero: direccionInicial?.numero || "",
    sector: direccionInicial?.sector || "",
    municipio: direccionInicial?.municipio || "",
    provincia: direccionInicial?.provincia || ("SANTO_DOMINGO" as ProvinciaRD),
    codigoPostal: direccionInicial?.codigoPostal || "",
    referencia: direccionInicial?.referencia || "",
    telefono: direccionInicial?.telefono || "",
    celular: direccionInicial?.celular || "",
    agenciaEnvio: direccionInicial?.agenciaEnvio,
    sucursalAgencia: direccionInicial?.sucursalAgencia || "",
    predeterminada: direccionInicial?.predeterminada || false,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const url = direccionInicial?.id
          ? `/api/direcciones/${direccionInicial.id}`
          : "/api/direcciones";

        const res = await fetch(url, {
          method: direccionInicial?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Error al guardar dirección");
        }

        toast.success(
          direccionInicial?.id
            ? "Dirección actualizada correctamente"
            : "Dirección agregada correctamente"
        );

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al guardar la dirección"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, direccionInicial, onSuccess]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 max-w-2xl mx-auto bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-xl"
    >
      <div className="space-y-6">
        {/* Calle y Número */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Calle
            </label>
            <input
              type="text"
              value={formData.calle}
              onChange={(e) =>
                setFormData({ ...formData, calle: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Número de Casa o Apartamento
            </label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
              required
            />
          </motion.div>
        </div>

        {/* Sector y Municipio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Sector
            </label>
            <input
              type="text"
              value={formData.sector}
              onChange={(e) =>
                setFormData({ ...formData, sector: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Municipio
            </label>
            <input
              type="text"
              value={formData.municipio}
              onChange={(e) =>
                setFormData({ ...formData, municipio: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
              required
            />
          </motion.div>
        </div>

        {/* Provincia y Código Postal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Provincia
            </label>
            <select
              value={formData.provincia}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  provincia: e.target.value as ProvinciaRD,
                })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
              required
            >
              {Object.entries(ProvinciaRD).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Código Postal
            </label>
            <input
              type="text"
              value={formData.codigoPostal}
              onChange={(e) =>
                setFormData({ ...formData, codigoPostal: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
            />
          </motion.div>
        </div>

        {/* Teléfonos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Celular (Opcional)
            </label>
            <input
              type="tel"
              value={formData.celular}
              onChange={(e) =>
                setFormData({ ...formData, celular: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
            />
          </motion.div>
        </div>

        {/* Agencia de Envío */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Agencia de Envío
            </label>
            <select
              value={formData.agenciaEnvio || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  agenciaEnvio: e.target.value as AgenciaEnvio,
                })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
            >
              <option value="">Seleccione una agencia</option>
              {Object.entries(AgenciaEnvio).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
              Sucursal de Agencia
            </label>
            <input
              type="text"
              value={formData.sucursalAgencia}
              onChange={(e) =>
                setFormData({ ...formData, sucursalAgencia: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                       focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                       transition-all duration-200 bg-white shadow-inner"
            />
          </motion.div>
        </div>

        {/* Referencia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group"
        >
          <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600">
            Referencia (Opcional)
          </label>
          <textarea
            value={formData.referencia}
            onChange={(e) =>
              setFormData({ ...formData, referencia: e.target.value })
            }
            rows={2}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                     focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                     transition-all duration-200 bg-white shadow-inner resize-none"
            placeholder="Punto de referencia para ubicar la dirección..."
          />
        </motion.div>

        {/* Predeterminada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg"
        >
          <div className="relative inline-block">
            <input
              type="checkbox"
              id="predeterminada-toggle"
              checked={formData.predeterminada}
              onChange={(e) =>
                setFormData({ ...formData, predeterminada: e.target.checked })
              }
              className="sr-only peer"
            />
            <label
              htmlFor="predeterminada-toggle"
              className="flex w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 
                       peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full 
                       peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                       after:left-[2px] after:bg-white after:border-gray-300 after:border 
                       after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r 
                       peer-checked:from-pink-500 peer-checked:to-violet-500 cursor-pointer shadow-inner"
            />
          </div>
          <span className="text-sm font-semibold text-gray-800">
            Dirección Predeterminada
          </span>
        </motion.div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-200 
                   rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                   shadow-sm hover:shadow focus:outline-none focus:ring-4 
                   focus:ring-gray-200 font-medium"
        >
          Cancelar
        </button>
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
}
