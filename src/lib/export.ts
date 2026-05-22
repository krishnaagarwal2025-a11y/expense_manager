
import { Expense } from "@/types";

/**
 * Utility to generate and trigger a CSV download from expense data.
 */
export function downloadExpensesCSV(expenses: Expense[]) {
  if (!expenses || expenses.length === 0) return;

  const headers = [
    "Date",
    "Description",
    "Total Amount",
    "Payer",
    "Allocations (Node: Amount [Shares])",
    "Internal Allocations",
    "Settled"
  ];

  const rows = expenses.map(exp => {
    // Format allocations into a readable string for a single CSV cell
    const allocationsStr = exp.allocations
      .map(a => `${a.node_id.split('_')[1].toUpperCase()}: ₹${a.amount.toFixed(2)} [${a.shares}]`)
      .join(" | ");

    // Format internal members if any
    const internalStr = exp.allocations
      .filter(a => a.internal_allocations && a.internal_allocations.length > 0)
      .map(a => `${a.node_id.split('_')[1].toUpperCase()}: ${a.internal_allocations?.join(", ")}`)
      .join(" | ") || "None";

    return [
      exp.date,
      `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes
      exp.amount.toFixed(2),
      exp.payer_id.split('_')[1].toUpperCase(),
      `"${allocationsStr}"`,
      `"${internalStr}"`,
      exp.settled ? "YES" : "NO"
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  const fileName = `clan-split-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
