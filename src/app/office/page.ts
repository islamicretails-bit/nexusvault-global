import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AiRouterConfig } from '../types/index';
import { getAiRouterConfig } from '../lib/ai-router';
import { getGeoLocation } from '../lib/geo-currency';
import { getNotifications } from '../lib/notifications';
import { getSeoMetadata } from '../lib/seo-generator';
import { getSecurityToken } from '../lib/security';
import { getWalletOverview } from '../components/vendor/WalletOverview';
import { getCustomRequestsTable } from '../components/admin/CustomRequestsTable';
import { getSalesAnalyticsChart } from '../components/admin/SalesAnalyticsChart';
import { getLiveTrafficMap } from '../components/admin/LiveTrafficMap';
import { getAIOperationsHub } from '../components/admin/AIOperationsHub';

const OfficePage: NextPage = () => {
  const router = useRouter();
  const [aiRouterConfig, setAiRouterConfig] = useState<AiRouterConfig | null>(null);
  const [geoLocation, setGeoLocation] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[] | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<any | null>(null);
  const [securityToken, setSecurityToken] = useState<string | null>(null);
  const [walletOverview, setWalletOverview] = useState<any | null>(null);
  const [customRequestsTable, setCustomRequestsTable] = useState<any | null>(null);
  const [salesAnalyticsChart, setSalesAnalyticsChart] = useState<any | null>(null);
  const [liveTrafficMap, setLiveTrafficMap] = useState<any | null>(null);
  const [aiOperationsHub, setAIOperationsHub] = useState<any | null>(null);

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

    const fetchSeoMetadata = async () => {
      const metadata = await getSeoMetadata();
      setSeoMetadata(metadata);
    };
    fetchSeoMetadata();

    const fetchSecurityToken = async () => {
      const token = await getSecurityToken();
      setSecurityToken(token);
    };
    fetchSecurityToken();

    const fetchWalletOverview = async () => {
      const overview = await getWalletOverview();
      setWalletOverview(overview);
    };
    fetchWalletOverview();

    const fetchCustomRequestsTable = async () => {
      const table = await getCustomRequestsTable();
      setCustomRequestsTable(table);
    };
    fetchCustomRequestsTable();

    const fetchSalesAnalyticsChart = async () => {
      const chart = await getSalesAnalyticsChart();
      setSalesAnalyticsChart(chart);
    };
    fetchSalesAnalyticsChart();

    const fetchLiveTrafficMap = async () => {
      const map = await getLiveTrafficMap();
      setLiveTrafficMap(map);
    };
    fetchLiveTrafficMap();

    const fetchAIOperationsHub = async () => {
      const hub = await getAIOperationsHub();
      setAIOperationsHub(hub);
    };
    fetchAIOperationsHub();
  }, []);

  return (
    <div className="office-page">
      <h1>Office Page</h1>
      {aiRouterConfig && <div>Ai Router Config: {JSON.stringify(aiRouterConfig)}</div>}
      {geoLocation && <div>Geo Location: {geoLocation}</div>}
      {notifications && <div>Notifications: {JSON.stringify(notifications)}</div>}
      {seoMetadata && <div>SEO Metadata: {JSON.stringify(seoMetadata)}</div>}
      {securityToken && <div>Security Token: {securityToken}</div>}
      {walletOverview && <div>Wallet Overview: {JSON.stringify(walletOverview)}</div>}
      {customRequestsTable && <div>Custom Requests Table: {JSON.stringify(customRequestsTable)}</div>}
      {salesAnalyticsChart && <div>Sales Analytics Chart: {JSON.stringify(salesAnalyticsChart)}</div>}
      {liveTrafficMap && <div>Live Traffic Map: {JSON.stringify(liveTrafficMap)}</div>}
      {aiOperationsHub && <div>AI Operations Hub: {JSON.stringify(aiOperationsHub)}</div>}
    </div>
  );
};

export default OfficePage;