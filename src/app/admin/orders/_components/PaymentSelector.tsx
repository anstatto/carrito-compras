import { TipoPago } from "@prisma/client";

interface PaymentSelectorProps {
  onChange: (value: TipoPago) => void; 
}

export default function PaymentSelector({ onChange }: PaymentSelectorProps) {
  return (
    <select onChange={(e) => onChange(e.target.value as TipoPago)} className="border p-2 w-full">
      <option value={TipoPago.TARJETA}>{TipoPago.TARJETA}</option>
      <option value={TipoPago.TRANSFERENCIA}>{TipoPago.TRANSFERENCIA}</option>
      <option value={TipoPago.STRIPE}>{TipoPago.STRIPE}</option>
    </select>
  );
}