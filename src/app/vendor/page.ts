// src/app/vendor/page.ts
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AiOutlinePlus } from 'react-icons/ai';
import { VendorLayout } from '../../components/vendor/Layout';
import { ProductGrid } from '../../components/marketplace/ProductGrid';
import { WalletOverview } from '../../components/vendor/WalletOverview';
import { prisma } from '../../lib/prisma';
import { getVendorProducts } from '../../lib/api';
import type { Product } from '../../types/Product';

const VendorPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      getVendorProducts(session.user.id).then((products) => {
        setProducts(products);
      });
    }
  }, [status, session, router]);

  const handleCreateProduct = () => {
    router.push('/vendor/create-product');
  };

  return (
    <VendorLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Products</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateProduct}
        >
          <AiOutlinePlus size={20} className="mr-2" />
          Create Product
        </button>
      </div>
      <ProductGrid products={products} />
      <WalletOverview />
    </VendorLayout>
  );
};

export default VendorPage;

// src/components/vendor/Layout.tsx
import type { ReactNode } from 'react';

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <header className="bg-white shadow-md p-4 mb-4">
        <nav>
          <ul>
            <li>
              <a href="#" className="text-blue-500 hover:text-blue-700">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-500 hover:text-blue-700">
                Products
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-500 hover:text-blue-700">
                Orders
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default VendorLayout;

// src/components/marketplace/ProductGrid.tsx
import type { Product } from '../../types/Product';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white shadow-md p-4">
          <h2 className="text-lg font-bold">{product.name}</h2>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-lg font-bold">${product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;

// src/components/vendor/WalletOverview.tsx
import type { WalletTransaction } from '../../types/WalletTransaction';

interface WalletOverviewProps {
  transactions: WalletTransaction[];
}

const WalletOverview: React.FC<WalletOverviewProps> = ({ transactions }) => {
  return (
    <div className="bg-white shadow-md p-4">
      <h2 className="text-lg font-bold">Wallet Overview</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id} className="py-2">
            <span className="text-gray-600">{transaction.date}</span>
            <span className="text-lg font-bold">
              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WalletOverview;

// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://example.com/api',
});

export const getVendorProducts = async (vendorId: number) => {
  const response = await api.get(`/vendors/${vendorId}/products`);
  return response.data;
};

// src/types/Product.ts
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

export default Product;

// src/types/WalletTransaction.ts
interface WalletTransaction {
  id: number;
  date: string;
  type: 'credit' | 'debit';
  amount: number;
}

export default WalletTransaction;