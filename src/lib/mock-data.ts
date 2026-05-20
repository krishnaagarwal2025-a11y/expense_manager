import { Trip, Expense } from "@/types";

export const MOCK_TRIP: Trip = {
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

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "exp_1",
    trip_id: "trip-2026",
    description: "Grand Hotel Dinner",
    amount: 35000,
    date: "2024-03-15",
    allocations: [
      { node_id: "node_sanjeev_family", shares: 7, amount: 16333 },
      { node_id: "node_nitin_clan", shares: 8, amount: 18667 }
    ],
    payer_id: "node_sanjeev_family"
  },
  {
    id: "exp_2",
    trip_id: "trip-2026",
    description: "Airport Transfer - Nitin Group",
    amount: 5000,
    date: "2024-03-14",
    allocations: [
      { node_id: "node_nitin_core", shares: 4, amount: 2500 },
      { node_id: "node_nitin_cousins", shares: 4, amount: 2500 }
    ],
    payer_id: "node_nitin_core"
  }
];
