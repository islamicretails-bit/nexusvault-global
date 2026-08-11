// src/components/vendor/WalletOverview.ts
import React, { useState, useEffect } from 'react';
import { WalletTransaction } from '../types';
import { getWalletTransactions } from '../lib/api';
import { formatCurrency } from '../lib/geo-currency';

interface WalletOverviewProps {
  vendorId: number;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({ vendorId }) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await getWalletTransactions(vendorId);
        setTransactions(response.data);
        setBalance(response.data.reduce((acc, curr) => acc + curr.amount, 0));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [vendorId]);

  const handleTransactionClick = (transaction: WalletTransaction) => {
    // Handle transaction click event
  };

  return (
    <div className="wallet-overview">
      <h2>Wallet Overview</h2>
      <p>Balance: {formatCurrency(balance)}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} onClick={() => handleTransactionClick(transaction)}>
              <td>{transaction.date}</td>
              <td>{formatCurrency(transaction.amount)}</td>
              <td>{transaction.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default WalletOverview;

// src/types/index.ts
interface WalletTransaction {
  id: number;
  vendorId: number;
  date: string;
  amount: number;
  type: string;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Order {
  id: number;
  vendorId: number;
  productId: number;
  date: string;
  amount: number;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
}

interface CustomRequest {
  id: number;
  vendorId: number;
  date: string;
  description: string;
}

interface AnalyticsLog {
  id: number;
  vendorId: number;
  date: string;
  event: string;
}

interface AffiliateReferral {
  id: number;
  affiliateId: number;
  vendorId: number;
  date: string;
  amount: number;
}

interface PayoutRequest {
  id: number;
  vendorId: number;
  date: string;
  amount: number;
}

interface AIServiceLog {
  id: number;
  vendorId: number;
  date: string;
  event: string;
}

// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
});

export const getWalletTransactions = async (vendorId: number) => {
  try {
    const response = await api.get(`/vendors/${vendorId}/wallet-transactions`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// src/lib/geo-currency.ts
const currencyExchangeRates = {
  USD: 1,
  PKR: 160,
  EUR: 0.88,
  GBP: 0.76,
  AED: 3.67,
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return `${currency} ${amount * currencyExchangeRates[currency]}`;
};