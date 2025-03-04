import { TipoPago } from "@prisma/client";
import { 
  FaMoneyBillWave,
  FaUniversity,
} from "react-icons/fa";
import { IconType } from "react-icons";

interface PaymentMethod {
  type: TipoPago;
  label: string;
  icon: IconType;
  color: string;
}

interface PaymentSelectorProps {
  onChange: (value: TipoPago) => void;
  value: TipoPago;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { 
    type: TipoPago.EFECTIVO, 
    label: 'Efectivo', 
    icon: FaMoneyBillWave, 
    color: 'text-green-500' 
  },
  { 
    type: TipoPago.TRANSFERENCIA, 
    label: 'Transferencia', 
    icon: FaUniversity, 
    color: 'text-blue-500' 
  }
];

export default function PaymentSelector({ onChange, value }: PaymentSelectorProps) {
  const handleChange = (newValue: string) => {
    const paymentType = newValue as TipoPago;
    if (Object.values(TipoPago).includes(paymentType)) {
      onChange(paymentType);
    }
  };

  return (
    <div className="space-y-2">
      {PAYMENT_METHODS.map(({ type, label, icon: Icon, color }) => (
        <label
          key={type}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
            ${value === type 
              ? 'border-pink-500 bg-pink-50 shadow-sm' 
              : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'
            }`}
        >
          <input
            type="radio"
            name="payment"
            value={type}
            checked={value === type}
            onChange={(e) => handleChange(e.target.value)}
            className="hidden"
          />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
            <Icon className={color} />
          </div>
          <span className="flex-grow font-medium text-gray-700">
            {label}
          </span>
          {value === type && (
            <div className="w-2 h-2 rounded-full bg-pink-500" />
          )}
        </label>
      ))}
    </div>
  );
}