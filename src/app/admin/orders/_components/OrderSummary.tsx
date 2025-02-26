interface OrderSummaryProps {
  total: number;
  onSave: () => Promise<void>;
  isSubmitting: boolean;
}

export default function OrderSummary({
  total,
  onSave,
  isSubmitting,
}: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de la Orden</h3>
        <div className="text-2xl font-bold text-pink-600">
          RD${total.toFixed(2)}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onSave}
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-violet-500 
                   text-white rounded-lg font-medium shadow-lg hover:from-pink-600 
                   hover:to-violet-600 focus:outline-none focus:ring-2 
                   focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-all duration-200 
                   flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            'Crear Orden'
          )}
        </button>
      </div>
    </div>
  );
}
