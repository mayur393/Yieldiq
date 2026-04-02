'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from './client';
import { saveFarmDataAction, fetchFarmDataAction, fetchCollectionAction } from '@/app/actions/farm';

// React Context for Supabase Client
const SupabaseContext = createContext({ supabase });

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};

/** Hook to access core Supabase client */
export const useSupabaseContext = () => {
  return useContext(SupabaseContext);
};

export const useSupabase = () => supabase;

/**
 * Hook specifically for accessing the authenticated user's state via NextAuth.
 * This mirrors the old Firebase useUser hook for easier migration.
 */
export const useUser = () => {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user ? { 
      uid: (session.user as any).id || (session.user as any).sub, 
      ...session.user 
    } : null,
    isUserLoading: status === 'loading',
    userError: null,
  };
};

/** Hook to access a user's primary farm */
export const useFarm = (userId?: string | null) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      if (userId === null) setIsLoading(false);
      return;
    }

    const fetchFarm = async () => {
      setIsLoading(true);
      try {
        const { data: farm, error } = await fetchFarmDataAction(userId);

        if (error) {
           throw new Error(error);
        } else {
          setData(farm);
        }
      } catch (err: any) {
        console.warn('Error fetching farm (Supabase Action):', err.message);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarm();
  }, [userId]);

  return { data, isLoading, error };
};

/** Export a standalone function for saving farm data */
export const saveFarmData = async (userId: string, payload: any) => {
  if (!userId) throw new Error("User ID required to save farm data.");
  
  try {
    const result = await saveFarmDataAction(userId, payload);
    return result;
  } catch (error: any) {
    console.error("Save Farm Data Action failed:", error.message);
    throw error;
  }
};

/** Export a general collection hook if needed (mimics useCollection) */
export const useCollection = (tableName: string, userIdKey: string, userIdVal?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!userIdVal) {
      setIsLoading(false);
      return;
    }
    
    const fetchCol = async () => {
      setIsLoading(true);
      try {
        const { data: rows, error } = await fetchCollectionAction(tableName, userIdKey, userIdVal);
        
        if (!error && rows) {
          setData(rows);
        }
      } catch (err) {
        console.error("useCollection error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCol();
  }, [tableName, userIdKey, userIdVal]);

  return { data, isLoading, error: null };
};
