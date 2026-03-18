export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: "expense" | "income";
}
