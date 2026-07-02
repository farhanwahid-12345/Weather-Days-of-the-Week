import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const AccountsPage: React.FC = () => {
  const finances = useGameStore(state => state.finances);
  const player = useGameStore(state => state.player);
  const calculateMonthlyIncome = useGameStore(state => state.calculateMonthlyIncome);
  const calculateMonthlyExpenses = useGameStore(state => state.calculateMonthlyExpenses);
  const calculateNetWorth = useGameStore(state => state.calculateNetWorth);
  const [activeTab, setActiveTab] = React.useState('tax');

  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const netWorth = calculateNetWorth();
  const properties = useGameStore(state => state.properties);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tax">Tax & Compliance</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="statements">Statements</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tax" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tax Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Current Tax Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Entity Type</p>
                  <p className="font-semibold">{player.entity === 'soleTrader' ? 'Sole Trader' : 'Limited Company'}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Credit Score</p>
                  <p className="font-semibold">{player.creditScore}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reputation</p>
                  <p className="font-semibold">{player.reputation}%</p>
                </div>
              </div>
            </div>
            
            {finances.taxLiabilities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No outstanding tax liabilities.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finances.taxLiabilities.map(tax => (
                    <TableRow key={tax.id}>
                      <TableCell><Badge variant="outline">{tax.type}</Badge></TableCell>
                      <TableCell>£{(tax.amount / 100).toLocaleString()}</TableCell>
                      <TableCell>{new Date(tax.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={tax.paid ? "default" : "destructive"}>
                          {tax.paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!tax.paid && (
                          <Button variant="outline" size="sm">Pay Now</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="performance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
                <p className="text-xl font-bold text-green-600">£{(monthlyIncome / 100).toLocaleString()}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
                <p className="text-xl font-bold text-red-600">£{(monthlyExpenses / 100).toLocaleString()}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Monthly</p>
                <p className={`text-xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{((monthlyIncome - monthlyExpenses) / 100).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Worth</p>
                <p className="text-xl font-bold text-purple-600">£{(netWorth / 100).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Yield Analysis</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Rent (Monthly)</TableHead>
                    <TableHead>Gross Yield</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map(property => {
                    const rent = property.tenant?.rentAmount || 0;
                    const grossYield = property.price > 0 ? (rent * 12) / property.price * 100 : 0;
                    
                    return (
                      <TableRow key={property.id}>
                        <TableCell>{property.address}</TableCell>
                        <TableCell>£{(property.price / 100).toLocaleString()}</TableCell>
                        <TableCell>£{(rent / 100).toLocaleString()}</TableCell>
                        <TableCell>{grossYield.toFixed(2)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="statements" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Financial Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Profit & Loss Statement (Last 12 Months)</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Expenses</TableHead>
                      <TableHead>Net Profit/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>£{(monthlyIncome * 12 / 100).toLocaleString()}</TableCell>
                      <TableCell>£{(monthlyExpenses * 12 / 100).toLocaleString()}</TableCell>
                      <TableCell className={monthlyIncome * 12 - monthlyExpenses * 12 >= 0 ? 'text-green-600' : 'text-red-600'}>
                        £{((monthlyIncome - monthlyExpenses) * 12 / 100).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Balance Sheet</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assets</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Cash</TableCell>
                      <TableCell>£{(finances.cash / 100).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Properties</TableCell>
                      <TableCell>£{((netWorth - finances.cash + properties.reduce((sum, p) => sum + p.price, 0)) / 100).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Total Assets</TableCell>
                      <TableCell className="font-semibold">£{(netWorth / 100).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Liabilities</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finances.loans.map(loan => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.lender} {loan.type} Loan</TableCell>
                        <TableCell>£{(loan.remainingBalance / 100).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold">Total Liabilities</TableCell>
                      <TableCell className="font-semibold">
                        £{(finances.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0) / 100).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
