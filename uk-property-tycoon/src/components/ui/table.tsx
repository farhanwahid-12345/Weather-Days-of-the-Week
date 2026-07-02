import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className="relative w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
);
