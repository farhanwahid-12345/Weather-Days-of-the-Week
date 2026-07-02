// Game state types
export interface GameState {
  time: Date;
  player: Player;
  properties: Property[];
  finances: Finances;
  gameSettings: GameSettings;
  marketProperties: MarketProperty[];
  alerts: Alert[];
}

export interface Player {
  id: string;
  name: string;
  reputation: number;
  experience: number;
  level: number;
  entity: 'soleTrader' | 'limitedCompany';
  creditScore: number;
}

export interface Property {
  id: string;
  address: string;
  price: number; // in pence
  condition: 'dilapidated' | 'standard' | 'premium';
  epcRating: EPCRating;
  squareFootage: number;
  neighborhoodCeiling: number; // max rent in area
  mortgage?: Mortgage;
  tenant?: Tenant;
  renovations: Renovation[];
  furnishingLevel: 'basic' | 'standard' | 'premium';
  conditionScore: number; // 0-100
  createdAt: Date;
}

export interface Mortgage {
  id: string;
  lender: string;
  principal: number; // in pence
  interestRate: number;
  termMonths: number;
  monthlyPayment: number; // in pence
  ltv: number;
  startDate: Date;
  endDate: Date;
  remainingBalance: number; // in pence
}

export interface Tenant {
  id: string;
  type: 'premium' | 'standard' | 'budget' | 'risky';
  rentAmount: number; // in pence
  satisfaction: number; // 0-100
  concerns: TenantConcern[];
  moveInDate: Date;
  leaseEndDate?: Date;
  rentMultiplier: number;
}

export interface TenantConcern {
  type: 'maintenance' | 'noise' | 'mould' | 'appliance' | 'safety';
  severity: 'low' | 'medium' | 'high';
  reportedDate: Date;
  resolved: boolean;
}

export interface Renovation {
  id: string;
  type: 'maintenance' | 'improvement' | 'extension' | 'conversion';
  cost: number; // in pence
  effectiveness: number; // impact on property value
  date: Date;
  epcUpgrade?: EPCRating;
}

export interface Finances {
  cash: number; // in pence
  bankAccounts: BankAccount[];
  loans: Loan[];
  taxLiabilities: TaxLiability[];
  transactionHistory: Transaction[];
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number; // in pence
  overdraftLimit?: number; // in pence
  accountType: 'current' | 'savings';
}

export interface Loan {
  id: string;
  type: 'personal' | 'business' | 'portfolio' | 'mortgage';
  lender: string;
  amount: number; // in pence
  interestRate: number;
  termMonths: number;
  monthlyPayment: number; // in pence
  startDate: Date;
  endDate: Date;
  remainingBalance: number; // in pence;
}

export interface TaxLiability {
  id: string;
  type: 'income' | 'corporation' | 'capitalGains';
  amount: number; // in pence
  dueDate: Date;
  paid: boolean;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number; // in pence
  category: 'rent' | 'mortgage' | 'renovation' | 'purchase' | 'sale' | 'tax' | 'loan' | 'other';
  accountId: string;
}

export interface GameSettings {
  speed: number; // 1x, 2x, 4x, paused
  notifications: boolean;
  sound: boolean;
}

// Additional types
export type EPCRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface MarketProperty {
  id: string;
  address: string;
  price: number; // in pence
  condition: 'dilapidated' | 'standard' | 'premium';
  epcRating: EPCRating;
  squareFootage: number;
  neighborhoodCeiling: number;
  source: 'estateAgent' | 'auction';
  completionTimeline: number; // days
}

export interface PlanningApplication {
  id: string;
  propertyId: string;
  type: 'extension' | 'conversion' | 'changeOfUse';
  submittedDate: Date;
  outcome?: 'approved' | 'refused' | 'withdrawn';
  decisionDate?: Date;
  cost: number; // in pence
}

export interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}
