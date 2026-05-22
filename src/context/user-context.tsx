"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type UserRole = "sanjeev" | "nitin" | null;
const USER_STORAGE_KEY = "clansplit:selected-user";

interface UserContextType {
  user: UserRole;
  setUser: (user: UserRole) => void;
  userId: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRole>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    setUser(storedUser === "sanjeev" || storedUser === "nitin" ? storedUser : null);
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, user);
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user, hasLoaded]);

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
