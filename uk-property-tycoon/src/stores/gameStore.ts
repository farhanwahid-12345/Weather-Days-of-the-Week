import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  GameState, 
  Player, 
  Property, 
  Tenant, 
  Mortgage, 
  Finances, 
  BankAccount, 
  Loan,
  Transaction,
  TaxLiability,
  GameSettings,
  MarketProperty,
  Renovation,
  TenantConcern,
  Alert,
  EPCRating
} from '../types';

const generateId = () => Math.random().toString(36).substring(2, 15);

const initialGameState: GameState = {
  time: new Date('2024-01-01'),
  player: {
    id: generateId(),
    name: 'Player',
    reputation: 50,
    experience: 0,
    level: 1,
    entity: 'soleTrader',
    creditScore: 650,
  },
  properties: [],
  finances: {
    cash: 5000000, // £50,000 in pence
    bankAccounts: [
      {
        id: generateId(),
        name: 'Main Current Account',
        balance: 5000000,
        accountType: 'current',
      }
    ],
    loans: [],
    taxLiabilities: [],
    transactionHistory: [],
  },
  gameSettings: {
    speed: 1,
    notifications: true,
    sound: true,
  },
  marketProperties: [],
  alerts: [],
};

interface GameStore extends GameState {
  // Time control
  setTime: (newTime: Date) => void;
  incrementTime: (seconds: number) => void;
  
  // Property management
  purchaseProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  sellProperty: (propertyId: string) => void;
  addTenant: (propertyId: string, tenant: Tenant) => void;
  removeTenant: (propertyId: string) => void;
  renovateProperty: (propertyId: string, renovation: Renovation) => void;
  
  // Financial operations
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  takeLoan: (loan: Omit<Loan, 'id'>) => void;
  repayLoan: (loanId: string, amount: number) => void;
  payTax: (taxId: string) => void;
  
  // Player management
  updatePlayer: (updates: Partial<Player>) => void;
  changeEntity: (entity: 'soleTrader' | 'limitedCompany') => void;
  
  // Game settings
  updateGameSettings: (settings: Partial<GameSettings>) => void;
  
  // Alerts
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveAlert: (alertId: string) => void;
  
  // Utility functions
  getPropertyValue: (propertyId: string) => number;
  calculateMonthlyIncome: () => number;
  calculateMonthlyExpenses: () => number;
  calculateNetWorth: () => number;
  
  // Market
  refreshMarket: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialGameState,

      // Time control methods
      setTime: (newTime) => set({ time: newTime }),
      incrementTime: (seconds) => 
        set((state) => ({ 
          time: new Date(state.time.getTime() + seconds * 1000) 
        })),

      // Property management methods
      purchaseProperty: (propertyData) => set((state) => {
        const newProperty: Property = { 
          ...propertyData, 
          id: generateId(), 
          createdAt: state.time,
          renovations: [],
          conditionScore: propertyData.condition === 'dilapidated' ? 30 : propertyData.condition === 'standard' ? 60 : 90,
          furnishingLevel: 'basic',
        };
        
        // Deduct purchase price from cash
        const newCash = state.finances.cash - propertyData.price;
        
        // Add transaction
        const transaction: Transaction = {
          id: generateId(),
          date: state.time,
          description: `Purchase of ${propertyData.address}`,
          amount: -propertyData.price,
          category: 'purchase',
          accountId: state.finances.bankAccounts[0].id,
        };

        return {
          properties: [...state.properties, newProperty],
          finances: {
            ...state.finances,
            cash: newCash,
            transactionHistory: [...state.finances.transactionHistory, transaction]
          }
        };
      }),

      sellProperty: (propertyId) => set((state) => {
        const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
        if (propertyIndex === -1) return state;

        const property = state.properties[propertyIndex];
        const salePrice = Math.floor(property.price * 0.95); // Assume slight discount

        // Add cash from sale
        const newCash = state.finances.cash + salePrice;

        // Remove property
        const newProperties = state.properties.filter(p => p.id !== propertyId);

        // Add transaction
        const transaction: Transaction = {
          id: generateId(),
          date: state.time,
          description: `Sale of ${property.address}`,
          amount: salePrice,
          category: 'sale',
          accountId: state.finances.bankAccounts[0].id,
        };

        return {
          properties: newProperties,
          finances: {
            ...state.finances,
            cash: newCash,
            transactionHistory: [...state.finances.transactionHistory, transaction]
          }
        };
      }),

      addTenant: (propertyId, tenant) => set((state) => {
        const updatedProperties = state.properties.map(property => {
          if (property.id === propertyId) {
            return { ...property, tenant };
          }
          return property;
        });

        return { properties: updatedProperties };
      }),

      removeTenant: (propertyId) => set((state) => {
        const updatedProperties = state.properties.map(property => {
          if (property.id === propertyId) {
            return { ...property, tenant: undefined };
          }
          return property;
        });

        return { properties: updatedProperties };
      }),

      renovateProperty: (propertyId, renovation) => set((state) => {
        const updatedProperties = state.properties.map(property => {
          if (property.id === propertyId) {
            return {
              ...property,
              renovations: [...property.renovations, renovation],
              conditionScore: Math.min(100, property.conditionScore + renovation.effectiveness),
              epcRating: renovation.epcUpgrade || property.epcRating
            };
          }
          return property;
        });

        // Deduct renovation cost
        const newCash = state.finances.cash - renovation.cost;

        // Add transaction
        const transaction: Transaction = {
          id: generateId(),
          date: state.time,
          description: `Renovation of ${updatedProperties.find(p => p.id === propertyId)?.address}`,
          amount: -renovation.cost,
          category: 'renovation',
          accountId: state.finances.bankAccounts[0].id,
        };

        return {
          properties: updatedProperties,
          finances: {
            ...state.finances,
            cash: newCash,
            transactionHistory: [...state.finances.transactionHistory, transaction]
          }
        };
      }),

      // Financial operations
      addTransaction: (transactionData) => set((state) => {
        const fullTransaction: Transaction = {
          ...transactionData,
          id: generateId()
        };

        return {
          finances: {
            ...state.finances,
            cash: state.finances.cash + transactionData.amount,
            transactionHistory: [...state.finances.transactionHistory, fullTransaction]
          }
        };
      }),

      takeLoan: (loanData) => set((state) => {
        const loanWithId: Loan = {
          ...loanData,
          id: generateId()
        };

        // Add loan amount to cash
        const newCash = state.finances.cash + loanData.amount;

        return {
          finances: {
            ...state.finances,
            cash: newCash,
            loans: [...state.finances.loans, loanWithId]
          }
        };
      }),

      repayLoan: (loanId, amount) => set((state) => {
        const updatedLoans = state.finances.loans.map(loan => {
          if (loan.id === loanId) {
            const newRemaining = Math.max(0, loan.remainingBalance - amount);
            return {
              ...loan,
              remainingBalance: newRemaining
            };
          }
          return loan;
        }).filter(loan => loan.remainingBalance > 0); // Remove fully paid loans

        // Deduct payment from cash
        const newCash = state.finances.cash - amount;

        return {
          finances: {
            ...state.finances,
            cash: newCash,
            loans: updatedLoans
          }
        };
      }),

      payTax: (taxId) => set((state) => {
        const taxToPay = state.finances.taxLiabilities.find(tax => tax.id === taxId);
        if (!taxToPay) return state;

        const updatedTaxLiabilities = state.finances.taxLiabilities
          .map(tax => tax.id === taxId ? { ...tax, paid: true } : tax)
          .filter(tax => !tax.paid); // Remove paid taxes

        const newCash = state.finances.cash - taxToPay.amount;

        return {
          finances: {
            ...state.finances,
            cash: newCash,
            taxLiabilities: updatedTaxLiabilities
          }
        };
      }),

      // Player management
      updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates }
      })),

      changeEntity: (entity) => set((state) => ({
        player: { ...state.player, entity }
      })),

      // Game settings
      updateGameSettings: (settings) => set((state) => ({
        gameSettings: { ...state.gameSettings, ...settings }
      })),

      // Alerts
      addAlert: (alertData) => set((state) => ({
        alerts: [...state.alerts, {
          ...alertData,
          id: generateId(),
          timestamp: state.time,
          resolved: false
        }]
      })),

      resolveAlert: (alertId) => set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      })),

      // Utility functions
      getPropertyValue: (propertyId) => {
        const state = get();
        const property = state.properties.find(p => p.id === propertyId);
        if (!property) return 0;
        
        // Simplified property valuation based on original price and improvements
        const baseValue = property.price;
        const renovationValue = property.renovations.reduce((sum, r) => sum + r.effectiveness * 10000, 0);
        const conditionMultiplier = property.conditionScore / 100;
        
        return Math.floor(baseValue * 1.05 + renovationValue) * conditionMultiplier; // 5% appreciation + improvements
      },

      calculateMonthlyIncome: () => {
        const { properties } = get();
        const monthlyIncome = properties.reduce((sum, property) => {
          if (property.tenant) {
            // Calculate monthly rent income
            return sum + property.tenant.rentAmount;
          }
          return sum;
        }, 0);

        return monthlyIncome;
      },

      calculateMonthlyExpenses: () => {
        const { properties, finances } = get();
        let totalExpenses = 0;

        // Mortgage payments
        finances.loans.forEach(loan => {
          totalExpenses += loan.monthlyPayment;
        });

        // Property expenses (estimated)
        properties.forEach(property => {
          // General maintenance costs based on condition
          if (property.condition === 'dilapidated') {
            totalExpenses += 20000; // £200/month in pence
          } else if (property.condition === 'standard') {
            totalExpenses += 15000; // £150/month in pence
          } else {
            totalExpenses += 10000; // £100/month in pence
          }

          // If there's a tenant, add tenant-related expenses
          if (property.tenant) {
            // Assume some management costs per tenant
            totalExpenses += 5000; // £50/month in pence
          }
        });

        return totalExpenses;
      },

      calculateNetWorth: () => {
        const { properties, finances } = get();
        
        // Cash
        let netWorth = finances.cash;
        
        // Properties value
        properties.forEach(property => {
          netWorth += get().getPropertyValue(property.id);
        });
        
        // Subtract debts
        finances.loans.forEach(loan => {
          netWorth -= loan.remainingBalance;
        });
        
        // Subtract unpaid taxes
        finances.taxLiabilities.forEach(tax => {
          if (!tax.paid) {
            netWorth -= tax.amount;
          }
        });

        return netWorth;
      },

      // Market
      refreshMarket: () => set((state) => {
        // Generate random market properties
        const addresses = [
          '123 High Street, London',
          '45 Oak Avenue, Manchester',
          '7 Beach Road, Brighton',
          '22 Victoria Road, Birmingham',
          '88 Church Lane, Leeds',
          '15 Park View, Bristol',
          '33 Station Road, Liverpool',
          '99 Market Square, Newcastle',
        ];
        
        const conditions: Array<'dilapidated' | 'standard' | 'premium'> = ['dilapidated', 'standard', 'premium'];
        const epcRatings: EPCRating[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const sources: Array<'estateAgent' | 'auction'> = ['estateAgent', 'auction'];
        
        const newMarketProperties: MarketProperty[] = Array.from({ length: 5 }, (_, i) => {
          const condition = conditions[Math.floor(Math.random() * conditions.length)];
          const price = Math.floor(Math.random() * 30000000) + 10000000; // £100k-£400k
          
          return {
            id: generateId(),
            address: addresses[Math.floor(Math.random() * addresses.length)],
            price,
            condition,
            epcRating: epcRatings[Math.floor(Math.random() * epcRatings.length)],
            squareFootage: Math.floor(Math.random() * 1000) + 500,
            neighborhoodCeiling: Math.floor(price * 0.006), // Approx 0.6% monthly rent
            source: sources[Math.floor(Math.random() * sources.length)],
            completionTimeline: Math.floor(Math.random() * 20) + 5,
          };
        });
        
        return { marketProperties: newMarketProperties };
      }),
    }),
    {
      name: 'uk-property-tycoon-storage', // Local storage key
      partialize: (state) => ({ 
        time: state.time,
        player: state.player,
        properties: state.properties,
        finances: state.finances,
        gameSettings: state.gameSettings,
        marketProperties: state.marketProperties,
        alerts: state.alerts
      })
    }
  )
);
