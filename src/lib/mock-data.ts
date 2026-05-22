
import { Trip, Expense } from "@/types";

// We keep this for initial structure, but actual data will come from Firestore
export const DEFAULT_TRIP_STRUCTURE: Trip = {
  id: "trip-2026",
  name: "Family Vacation 2026",
  nodes: [
    {
      id: "node_sanjeev_family",
      display_name: "Sanjeev's Family",
      manager_id: "user_sanjeev",
      default_shares: 7,
      members: ["Sanjeev 1", "Sanjeev 2", "Sanjeev 3", "Sanjeev 4", "Sanjeev 5", "Sanjeev 6", "Sanjeev 7"]
    },
    {
      id: "node_nitin_clan",
      display_name: "Nitin's Clan",
      manager_id: "user_nitin",
      default_shares: 8,
      sub_nodes: [
        {
          id: "node_nitin_core",
          display_name: "Nitin Core Family",
          manager_id: "user_nitin",
          members: ["Nitin 1", "Nitin 2", "Nitin 3", "Nitin 4"]
        },
        {
          id: "node_nitin_cousins",
          display_name: "Cousins",
          manager_id: "user_nitin",
          members: ["Cousin 1", "Cousin 2", "Cousin 3", "Cousin 4"]
        }
      ]
    }
  ]
};

export const MOCK_TRIP = DEFAULT_TRIP_STRUCTURE;
export const MOCK_EXPENSES: Expense[] = []; // Starting with data = 0
