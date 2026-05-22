"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Expense } from "@/types";

const EXPENSES_STORAGE_KEY = "clansplit:trip-2026:expenses";

function readStoredExpenses(): Expense[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredExpenses(expenses: Expense[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setExpenses(readStoredExpenses());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      writeStoredExpenses(expenses);
    }
  }, [expenses, hasLoaded]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === EXPENSES_STORAGE_KEY) {
        setExpenses(readStoredExpenses());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.id.localeCompare(a.id)),
    [expenses]
  );

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((current) => [expense, ...current.filter((item) => item.id !== expense.id)]);
  }, []);

  const deleteExpense = useCallback((expenseId: string) => {
    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
  }, []);

  const updateExpense = useCallback((expenseId: string, updates: Partial<Expense>) => {
    setExpenses((current) =>
      current.map((expense) =>
        expense.id === expenseId ? { ...expense, ...updates } : expense
      )
    );
  }, []);

  const updateExpenses = useCallback((updater: (expenses: Expense[]) => Expense[]) => {
    setExpenses((current) => updater(current));
  }, []);

  return {
    expenses: sortedExpenses,
    addExpense,
    deleteExpense,
    updateExpense,
    updateExpenses,
  };
}
