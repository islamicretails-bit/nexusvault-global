// src/app/affiliate/page.ts
import { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { AffiliateReferral } from '@prisma/client';
import { getAffiliateReferrals } from '../lib/api/affiliate/referrals';
import { AffiliateReferralCard } from '../components/affiliate/AffiliateReferralCard';
import { Layout } from '../components/Layout';

interface AffiliatePageProps {
  affiliateReferrals: AffiliateReferral[];
}

const AffiliatePage: NextPage<AffiliatePageProps> = () => {
  const [affiliateReferrals, setAffiliateReferrals] = useState<AffiliateReferral[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAffiliateReferrals = async () => {
      setLoading(true);
      try {
        const referrals = await getAffiliateReferrals();
        setAffiliateReferrals(referrals);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAffiliateReferrals();
  }, []);

  return (
    <Layout title="Affiliate Referrals">
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
        <h1 className="text-3xl font-bold mb-4">Affiliate Referrals</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliateReferrals.map((referral) => (
              <AffiliateReferralCard key={referral.id} referral={referral} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AffiliatePage;

// src/components/affiliate/AffiliateReferralCard.tsx
import React from 'react';
import { AffiliateReferral } from '@prisma/client';

interface AffiliateReferralCardProps {
  referral: AffiliateReferral;
}

const AffiliateReferralCard: React.FC<AffiliateReferralCardProps> = ({ referral }) => {
  return (
    <div className="bg-white rounded shadow-md p-4">
      <h2 className="text-lg font-bold mb-2">{referral.productName}</h2>
      <p className="text-gray-600 mb-2">Referral ID: {referral.id}</p>
      <p className="text-gray-600 mb-2">Referral Date: {referral.createdAt.toISOString()}</p>
      <p className="text-gray-600 mb-2">Earnings: ${referral.earnings}</p>
    </div>
  );
};

export default AffiliateReferralCard;

// src/lib/api/affiliate/referrals.ts
import { prisma } from '../prisma';

const getAffiliateReferrals = async (): Promise<AffiliateReferral[]> => {
  return prisma.affiliateReferral.findMany();
};

export { getAffiliateReferrals };

// src/types/index.ts
import { AffiliateReferral } from '@prisma/client';

interface AffiliatePageProps {
  affiliateReferrals: AffiliateReferral[];
}

export { AffiliatePageProps };

// src/app/layout.tsx
import React from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <main>{children}</main>
    </div>
  );
};

export default Layout;