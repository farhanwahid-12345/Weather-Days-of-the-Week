import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';

export const BankingPage: React.FC = () => {
  const finances = useGameStore(state => state.finances);
  const takeLoan = useGameStore(state => state.takeLoan);
  const repayLoan = useGameStore(state => state.repayLoan);
  const [activeTab, setActiveTab] = useState('accounts');
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedLender, setSelectedLender] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const lenders = [
    { id: 'barclays', name: 'Barclays' },
    { id: 'lloyds', name: 'Lloyds' },
    { id: 'natwest', name: 'NatWest' },
    { id: 'hsbc', name: 'HSBC' },
    { id: 'halifax', name: 'Halifax' },
  ];

  const handleTakeLoan = () => {
    if (!loanAmount || !selectedLender) return;
    
    const amount = parseInt(loanAmount) * 100; // Convert to pence
    const monthlyPayment = Math.floor(amount * 0.007); // Simplified 0.7% monthly payment
    
    takeLoan({
      type: 'business',
      lender: selectedLender,
      amount: amount,
      interestRate: 0.035, // 3.5% annual
      termMonths: 240, // 20 years
      monthlyPayment: monthlyPayment,
      startDate: new Date(),
      endDate: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000),
      remainingBalance: amount,
    });
    
    setLoanAmount('');
    setSelectedLender('');
  };

  const handleRepayLoan = () => {
    if (!selectedLoanId || !repayAmount) return;
    repayLoan(selectedLoanId, parseInt(repayAmount) * 100);
    setRepayAmount('');
    setSelectedLoanId(null);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="accounts">Accounts</TabsTrigger>
        <TabsTrigger value="loans">Loans & Mortgages</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="accounts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finances.bankAccounts.map(account => (
                <Card key={account.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{account.accountType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          £{(account.balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {account.overdraftLimit && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Overdraft: £{(account.overdraftLimit / 100).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="loans" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loans & Mortgages</CardTitle>
          </CardHeader>
          <CardContent>
            {finances.loans.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">You have no active loans or mortgages.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lender</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finances.loans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.lender}</TableCell>
                      <TableCell><Badge variant="outline">{loan.type}</Badge></TableCell>
                      <TableCell>£{(loan.amount / 100).toLocaleString()}</TableCell>
                      <TableCell>{(loan.interestRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>£{(loan.monthlyPayment / 100).toLocaleString()}</TableCell>
                      <TableCell>£{(loan.remainingBalance / 100).toLocaleString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedLoanId(loan.id)}>Repay</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Repay Loan</DialogTitle>
                              <DialogDescription>
                                Enter the amount you want to repay toward this loan
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="repay-amount" className="text-right">Amount (£)</Label>
                                <Input 
                                  id="repay-amount" 
                                  type="number" 
                                  className="col-span-3"
                                  value={repayAmount}
                                  onChange={(e) => setRepayAmount(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleRepayLoan}>Repay Loan</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Apply for a New Loan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="loan-amount">Loan Amount (£)</Label>
                  <Input 
                    id="loan-amount" 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(e.target.value)} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="lender">Select Lender</Label>
                  <select
                    id="lender"
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedLender}
                    onChange={(e) => setSelectedLender(e.target.value)}
                  >
                    <option value="">Choose a lender</option>
                    {lenders.map(lender => (
                      <option key={lender.id} value={lender.id}>{lender.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    className="w-full" 
                    onClick={handleTakeLoan}
                    disabled={!loanAmount || !selectedLender}
                  >
                    Apply for Loan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="transactions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finances.transactionHistory.slice(0, 20).map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell><Badge variant="outline">{transaction.category}</Badge></TableCell>
                    <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.amount >= 0 ? '+' : ''}£{(transaction.amount / 100).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
