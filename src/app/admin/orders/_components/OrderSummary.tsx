import { FaShoppingCart, FaSpinner } from 'react-icons/fa';

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
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaShoppingCart className="text-pink-500" />
          Resumen de la Orden
        </h3>
        <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 
                      text-transparent bg-clip-text">
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
                   flex items-center justify-center gap-2 relative overflow-hidden"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <FaShoppingCart />
              <span>Crear Orden</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
