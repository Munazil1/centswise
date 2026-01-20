import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Credit, Expense, Item, Distribution, DashboardMetrics, Transaction } from '@/types';
import api from '@/lib/api';

interface DataContextType {
  credits: Credit[];
  expenses: Expense[];
  items: Item[];
  distributions: Distribution[];
  metrics: DashboardMetrics;
  recentTransactions: Transaction[];
  addCredit: (credit: Omit<Credit, 'id' | 'serialNumber' | 'createdAt'>) => Promise<Credit>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'distributedQuantity'>) => Promise<void>;
  distributeItem: (distribution: Omit<Distribution, 'id' | 'status'>) => void;
  returnItem: (distributionId: string, conditionOnReturn: string) => void;
  getNextReceiptNumber: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCollected: 0,
    totalSpent: 0,
    availableBalance: 0,
    totalItems: 0,
    distributedItems: 0,
    availableItems: 0,
  });

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard metrics
        const metricsRes = await api.getDashboardMetrics();
        if (metricsRes.data) {
          setMetrics({
            totalCollected: metricsRes.data.financial.total_collected,
            totalSpent: metricsRes.data.financial.total_spent,
            availableBalance: metricsRes.data.financial.available_balance,
            totalItems: metricsRes.data.inventory.total_items,
            distributedItems: metricsRes.data.inventory.distributed_items,
            availableItems: metricsRes.data.inventory.available_items,
          });
        }

        // Fetch credits
        const creditsRes = await api.getCredits();
        if (creditsRes.data?.credits) {
          setCredits(creditsRes.data.credits.map((c: any) => ({
            id: String(c.id),
            serialNumber: c.serial_number || `RCP-${new Date().getFullYear()}-${String(c.id).padStart(4, '0')}`,
            donorName: c.donor_name,
            amount: c.amount,
            date: c.date,
            purpose: c.purpose,
            paymentMethod: c.payment_method,
            contactInfo: c.contact_info,
            createdAt: c.created_at,
          })));
        }

        // Fetch expenses
        const expensesRes = await api.getExpenses();
        if (expensesRes.data?.expenses) {
          setExpenses(expensesRes.data.expenses.map((e: any) => ({
            id: String(e.id),
            amount: e.amount,
            date: e.date,
            purpose: e.purpose,
            category: e.category,
            beneficiaryName: e.beneficiary_name,
            createdAt: e.created_at,
          })));
        }

        // Fetch items
        const itemsRes = await api.getItems();
        if (itemsRes.data?.items) {
          setItems(itemsRes.data.items.map((i: any) => ({
            id: String(i.id),
            name: i.name,
            category: i.category,
            totalQuantity: i.total_quantity,
            availableQuantity: i.available_quantity,
            distributedQuantity: i.distributed_quantity,
            condition: i.condition,
            location: i.location,
            description: i.description,
            createdAt: i.created_at,
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getNextReceiptNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const lastReceipt = credits.reduce((max, c) => {
      const num = parseInt(c.serialNumber.split('-')[2] || '0');
      return num > max ? num : max;
    }, 0);
    return `RCP-${year}-${String(lastReceipt + 1).padStart(4, '0')}`;
  }, [credits]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    try {
      const metricsRes = await api.getDashboardMetrics();
      if (metricsRes.data) {
        setMetrics({
          totalCollected: metricsRes.data.financial.total_collected,
          totalSpent: metricsRes.data.financial.total_spent,
          availableBalance: metricsRes.data.financial.available_balance,
          totalItems: metricsRes.data.inventory.total_items,
          distributedItems: metricsRes.data.inventory.distributed_items,
          availableItems: metricsRes.data.inventory.available_items,
        });
      }

      const creditsRes = await api.getCredits();
      if (creditsRes.data?.credits) {
        setCredits(creditsRes.data.credits.map((c: any) => ({
          id: String(c.id),
          serialNumber: c.serial_number || `RCP-${new Date().getFullYear()}-${String(c.id).padStart(4, '0')}`,
          donorName: c.donor_name,
          amount: c.amount,
          date: c.date,
          purpose: c.purpose,
          paymentMethod: c.payment_method,
          contactInfo: c.contact_info,
          createdAt: c.created_at,
        })));
      }

      const expensesRes = await api.getExpenses();
      if (expensesRes.data?.expenses) {
        setExpenses(expensesRes.data.expenses.map((e: any) => ({
          id: String(e.id),
          amount: e.amount,
          date: e.date,
          purpose: e.purpose,
          category: e.category,
          beneficiaryName: e.beneficiary_name || '',
          createdAt: e.created_at,
        })));
})));
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  const recentTransactions: Transaction[] = [
    ...credits.map(c => ({ id: c.id, type: 'credit' as const, amount: c.amount, description: c.purpose, date: c.date, name: c.donorName })),
    ...expenses.map(e => ({ id: e.id, type: 'expense' as const, amount: e.amount, description: e.purpose, date: e.date, name: e.beneficiaryName || 'General Expense' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  const addCredit = useCallback(async (credit: Omit<Credit, 'id' | 'serialNumber' | 'createdAt'>): Promise<Credit> => {
    // Local optimistic update
    const tempCredit: Credit = {
      ...credit,
      id: String(Date.now()),
      serialNumber: getNextReceiptNumber(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCredits(prev => [tempCredit, ...prev]);
    
    // Call backend API
    try {
      const result = await api.addCredit({
        donor_name: credit.donorName,
        amount: credit.amount,
        date: credit.date,
        purpose: credit.purpose,
        payment_method: credit.paymentMethod,
        contact_info: credit.contactInfo,
      });
      
      if (result.data?.credit) {
        // Update with real ID from backend
        tempCredit.id = String(result.data.credit.id);
      }
    } catch (error) {
      console.error('Failed to save credit to backend:', error);
    }
    
    // Refresh data from API
    setTimeout(() => refreshData(), 500);
    
    return tempCredit;
  }, [getNextReceiptNumber, refreshData]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<void> => {
    // Local optimistic update
    const tempExpense: Expense = {
      ...expense,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExpenses(prev => [tempExpense, ...prev]);
    
    // Call backend API
    try {
      const result = await api.addExpense({
        amount: expense.amount,
        date: expense.date,
        purpose: expense.purpose,
        category: expense.category,
        beneficiary_name: expense.beneficiaryName,
      });
      
      if (result.data?.expense) {
        // Update with real ID from backend
        tempExpense.id = String(result.data.expense.id);
      }
    } catch (error) {
      console.error('Failed to save expense to backend:', error);
    }
    
    // Refresh data from API
    setTimeout(() => refreshData(), 500);
  }, [refreshData]);

  const addItem = useCallback(async (item: Omit<Item, 'id' | 'createdAt' | 'distributedQuantity'>): Promise<void> => {
    // Local optimistic update
    const tempItem: Item = {
      ...item,
      id: String(Date.now()),
      distributedQuantity: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setItems(prev => [tempItem, ...prev]);
    
    // Call backend API
    try {
      const result = await api.addItem({
        name: item.name,
        category: item.category,
        total_quantity: item.totalQuantity,
        available_quantity: item.availableQuantity,
        condition: item.condition,
        location: item.location,
        description: item.description,
      });
      
      if (result.data?.item) {
        // Update with real ID from backend
        tempItem.id = String(result.data.item.id);
      }
    } catch (error) {
      console.error('Failed to save item to backend:', error);
    }
    
    // Refresh items data
    setTimeout(async () => {
      const itemsRes = await api.getItems();
      if (itemsRes.data?.items) {
        setItems(itemsRes.data.items.map((i: any) => ({
          id: String(i.id),
          name: i.name,
          category: i.category,
          totalQuantity: i.total_quantity,
          availableQuantity: i.available_quantity,
          distributedQuantity: i.distributed_quantity,
          condition: i.condition,
          location: i.location,
          description: i.description,
          createdAt: i.created_at,
        })));
      }
    }, 500);
  }, []);

  const distributeItem = useCallback((distribution: Omit<Distribution, 'id' | 'status'>) => {
    const newDistribution: Distribution = {
      ...distribution,
      id: String(Date.now()),
      status: 'distributed',
    };
    setDistributions(prev => [newDistribution, ...prev]);
    
    // Update item quantities
    setItems(prev => prev.map(item => 
      item.id === distribution.itemId 
        ? { 
            ...item, 
            availableQuantity: item.availableQuantity - distribution.quantity,
            distributedQuantity: item.distributedQuantity + distribution.quantity 
          }
        : item
    ));
  }, []);

  const returnItem = useCallback((distributionId: string, conditionOnReturn: string) => {
    const distribution = distributions.find(d => d.id === distributionId);
    if (!distribution) return;

    setDistributions(prev => prev.map(d => 
      d.id === distributionId 
        ? { ...d, status: 'returned' as const, returnedDate: new Date().toISOString().split('T')[0], conditionOnReturn }
        : d
    ));

    // Update item quantities
    setItems(prev => prev.map(item => 
      item.id === distribution.itemId 
        ? { 
            ...item, 
            availableQuantity: item.availableQuantity + distribution.quantity,
            distributedQuantity: item.distributedQuantity - distribution.quantity 
          }
        : item
    ));
  }, [distributions]);

  return (
    <DataContext.Provider value={{
      credits,
      expenses,
      items,
      distributions,
      metrics,
      recentTransactions,
      addCredit,
      addExpense,
      addItem,
      distributeItem,
      returnItem,
      getNextReceiptNumber,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
