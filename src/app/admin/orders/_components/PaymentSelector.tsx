import { TipoPago } from "@prisma/client";
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaCcStripe 
} from "react-icons/fa";

interface PaymentSelectorProps {
  onChange: (value: TipoPago) => void;
  value?: TipoPago;
}

export default function PaymentSelector({ onChange, value = TipoPago.TARJETA }: PaymentSelectorProps) {
  const getPaymentIcon = (tipo: TipoPago) => {
    switch (tipo) {
      case TipoPago.TARJETA:
        return <FaCreditCard className="text-blue-500" />;
      case TipoPago.TRANSFERENCIA:
        return <FaMoneyBillWave className="text-green-500" />;
      case TipoPago.STRIPE:
        return <FaCcStripe className="text-purple-500" />;
      default:
        return <FaCreditCard className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-2">
      {Object.values(TipoPago).map((tipo) => (
        <label
          key={tipo}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
            ${value === tipo 
              ? 'border-pink-500 bg-pink-50 shadow-sm' 
              : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'
            }`}
        >
          <input
            type="radio"
            name="payment"
            value={tipo}
            checked={value === tipo}
            onChange={(e) => onChange(e.target.value as TipoPago)}
            className="hidden"
          />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
            {getPaymentIcon(tipo)}
          </div>
          <span className="flex-grow font-medium text-gray-700">
            {tipo}
          </span>
          {value === tipo && (
            <div className="w-2 h-2 rounded-full bg-pink-500" />
          )}
        </label>
      ))}
    </div>
  );
}