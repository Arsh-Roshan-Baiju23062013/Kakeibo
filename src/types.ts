export interface UserProfile {
  name: string;
  jobTitle: string;
  email: string;
  categories: string[];
  earningCategories: string[];
  currency: string;
}

export interface StockInvestment {
  id?: string;
  symbol: string;
  investedAmount: number;
  shares: number;
  purchaseDate: string;
  currency: string;
}

export interface Expense {
  id?: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface Earning {
  id?: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
  }
}
