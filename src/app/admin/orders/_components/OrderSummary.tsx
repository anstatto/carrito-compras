import { FaShoppingCart, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface OrderSummaryProps {
  total: number;
  onSave: () => Promise<void>;
  isSubmitting: boolean;
}

const formatMoney = (amount: number): string => {
  return `RD$${amount.toFixed(2)}`;
};

export default function OrderSummary({
  total,
  onSave,
  isSubmitting,
}: OrderSummaryProps) {
  const hasItems = total > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-lg border border-gray-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaShoppingCart className="text-pink-500" />
          Resumen de la Orden
        </h3>
        <div 
          className={`text-2xl font-bold transition-colors duration-200
            ${hasItems 
              ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text' 
              : 'text-gray-400'
            }`}
        >
          {formatMoney(total)}
        </div>
      </div>

      {!hasItems && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg mb-4">
          <FaInfoCircle className="mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            Agrega productos a la orden para continuar
          </p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={onSave}
          disabled={isSubmitting || !hasItems}
          className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-violet-500 
                   text-white rounded-lg font-medium shadow-lg hover:from-pink-600 
                   hover:to-violet-600 focus:outline-none focus:ring-2 
                   focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-all duration-200 
                   flex items-center justify-center gap-2 relative overflow-hidden"
          aria-busy={isSubmitting}
          aria-disabled={!hasItems}
        >
          <motion.div
            animate={{ 
              scale: isSubmitting ? [1, 1.2, 1] : 1,
              rotate: isSubmitting ? 360 : 0 
            }}
            transition={{ 
              duration: 1,
              repeat: isSubmitting ? Infinity : 0,
              ease: "linear"
            }}
          >
            {isSubmitting ? <FaSpinner /> : <FaShoppingCart />}
          </motion.div>
          <span>
            {isSubmitting 
              ? 'Procesando...' 
              : hasItems 
                ? 'Crear Orden' 
                : 'Agrega productos para continuar'
            }
          </span>
        </button>
      </div>
    </motion.div>
  );
}
