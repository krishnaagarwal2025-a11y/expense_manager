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

export interface Expense {
  id: string;
  trip_id: string;
  description: string;
  amount: number;
  date: string;
  allocated_to: string[]; // Node IDs
  payer_id: string; // Node ID of who paid
}

export interface Balance {
  node_id: string;
  amount: number; // Positive means owed, negative means owes
}
