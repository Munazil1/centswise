export interface Credit {
  id: string;
  serialNumber: string;
  donorName: string;
  amount: number;
  date: string;
  purpose: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'online';
  contactInfo?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  purpose: string;
  category: 'medical' | 'educational' | 'emergency' | 'events' | 'other';
  beneficiaryName?: string;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  distributedQuantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  location: string;
  description?: string;
  createdAt: string;
}

export interface Distribution {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  recipientName: string;
  recipientContact: string;
  distributedDate: string;
  expectedReturnDate?: string;
  status: 'distributed' | 'returned' | 'overdue';
  returnedDate?: string;
  conditionOnReturn?: string;
}

export interface DashboardMetrics {
  totalCollected: number;
  totalSpent: number;
  availableBalance: number;
  totalItems: number;
  distributedItems: number;
  availableItems: number;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'expense';
  amount: number;
  description: string;
  date: string;
  name?: string;
}
