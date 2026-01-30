
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  establishment: string;
  recurrence?: 'none' | 'monthly' | 'yearly';
  adjustmentRate?: number; // Porcentagem de reajuste futuro
}

export interface Project {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}

export interface SimulationResult {
  type: 'SAC' | 'PRICE' | 'INVESTMENT' | 'CONSORCIO';
  totalInterest: number;
  totalPaid: number;
  finalValue?: number;
  monthlyPayments?: number[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}
