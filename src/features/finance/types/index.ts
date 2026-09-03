export const movementTypes = ["ingreso", "egreso"] as const;
export type MovementType = (typeof movementTypes)[number];

export const paymentStatuses = ["pagado", "parcial", "pendiente"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export type FamilyFinanceEntry = {
  id: string;
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isPaid: boolean;
  paymentStatus: PaymentStatus;
  createdBy: string;
};

export type FamilyFinanceInput = {
  date: string;
  category: string;
  description: string;
  movementType: MovementType;
  totalAmount: number;
  paidAmount: number;
  isPaid: boolean;
};

export function getPaymentStatus(
  totalAmount: number,
  paidAmount: number,
  isPaid: boolean,
): PaymentStatus {
  if (isPaid || paidAmount >= totalAmount) {
    return "pagado";
  }

  if (paidAmount > 0) {
    return "parcial";
  }

  return "pendiente";
}
