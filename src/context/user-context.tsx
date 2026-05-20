"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "sanjeev" | "nitin" | null;

interface UserContextType {
  user: UserRole;
  setUser: (user: UserRole) => void;
  userId: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRole>(null);

  const userId = user === "sanjeev" ? "user_sanjeev" : user === "nitin" ? "user_nitin" : null;

  return (
    <UserContext.Provider value={{ user, setUser, userId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
