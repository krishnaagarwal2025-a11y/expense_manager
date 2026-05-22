
export type Member = string;

export interface ClanNode {
  id: string;
  display_name: string;
  manager_id?: string;
  default_shares?: number;
  members?: Member[];
  sub_nodes?: ClanNode[];
}

export interface Trip {
  id: string;
  name: string;
  nodes: ClanNode[];
}

export interface ExpenseAllocation {
  node_id: string;
  shares: number;
  amount: number;
  internal_allocations?: string[]; // Members selected internally
}

export interface Expense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  date: string;
  allocations: ExpenseAllocation[];
  payer_id: string; // Node ID of who paid
  settled?: boolean; // Main cross-clan settlement status
  internal_settled?: boolean; // General internal settlement status
  settled_internal_members?: string[]; // Specifically which members have paid back Nitin
}

export interface Balance {
  node_id: string;
  amount: number; // Positive means owed, negative means owes
}
