import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { AiRouterConfig } from '../types/index';
import { getAiRouterConfig } from '../lib/ai-router';
import { getGeoLocation } from '../lib/geo-currency';
import { getNotifications } from '../lib/notifications';
import { getS3Storage } from '../lib/s3-storage';
import { getSeoGenerator } from '../lib/seo-generator';
import Layout from '../app/layout';
import PageComponent from '../components/marketplace/ProductGrid';

const Page: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [aiRouterConfig, setAiRouterConfig] = useState<AiRouterConfig | null>(null);
  const [geoLocation, setGeoLocation] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [s3Storage, setS3Storage] = useState<any | null>(null);
  const [seoGenerator, setSeoGenerator] = useState<any | null>(null);

  useEffect(() => {
    const fetchAiRouterConfig = async () => {
      const config = await getAiRouterConfig();
      setAiRouterConfig(config);
    };
    fetchAiRouterConfig();

    const fetchGeoLocation = async () => {
      const location = await getGeoLocation();
      setGeoLocation(location);
    };
    fetchGeoLocation();

    const fetchNotifications = async () => {
      const notifications = await getNotifications();
      setNotifications(notifications);
    };
    fetchNotifications();

    const fetchS3Storage = async () => {
      const storage = await getS3Storage();
      setS3Storage(storage);
    };
    fetchS3Storage();

    const fetchSeoGenerator = async () => {
      const generator = await getSeoGenerator();
      setSeoGenerator(generator);
    };
    fetchSeoGenerator();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <Layout>
      <Head>
        <title>NexusVault Global Enterprise / MystoriumX AI Studio</title>
        <meta name="description" content="Autonomous, self-evolving enterprise-grade digital marketplace & AI orchestration monorepo engine" />
      </Head>
      <PageComponent
        aiRouterConfig={aiRouterConfig}
        geoLocation={geoLocation}
        notifications={notifications}
        s3Storage={s3Storage}
        seoGenerator={seoGenerator}
        handleSignOut={handleSignOut}
      />
    </Layout>
  );
};

export default Page;