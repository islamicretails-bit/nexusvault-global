import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AiRouterConfig } from '../types/index';
import { getAnalyticsData, getAIServiceLogs } from '../lib/api/admin/analytics/route';
import { getWalletOverview } from '../lib/api/vendor/payouts/route';
import { getLiveTrafficMap } from '../lib/api/admin/live-traffic/route';
import { getSalesAnalyticsChart } from '../lib/api/admin/sales-analytics/route';
import { getCustomRequestsTable } from '../lib/api/admin/custom-requests/route';
import { getAIOperationsHub } from '../lib/api/admin/ai-operations/route';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState({});
  const [aiServiceLogs, setAIServiceLogs] = useState([]);
  const [walletOverview, setWalletOverview] = useState({});
  const [liveTrafficMap, setLiveTrafficMap] = useState({});
  const [salesAnalyticsChart, setSalesAnalyticsChart] = useState({});
  const [customRequestsTable, setCustomRequestsTable] = useState([]);
  const [aiOperationsHub, setAIOperationsHub] = useState({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    } else {
      getAnalyticsData().then((data) => setAnalyticsData(data));
      getAIServiceLogs().then((logs) => setAIServiceLogs(logs));
      getWalletOverview().then((overview) => setWalletOverview(overview));
      getLiveTrafficMap().then((map) => setLiveTrafficMap(map));
      getSalesAnalyticsChart().then((chart) => setSalesAnalyticsChart(chart));
      getCustomRequestsTable().then((table) => setCustomRequestsTable(table));
      getAIOperationsHub().then((hub) => setAIOperationsHub(hub));
    }
  }, [status]);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white p-4">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">NexusVault Global Enterprise</h1>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Analytics Data</h2>
          <div className="bg-white p-4 rounded shadow-md">
            <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
          </div>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-2">AI Service Logs</h2>
          <div className="bg-white p-4 rounded shadow-md">
            <ul>
              {aiServiceLogs.map((log, index) => (
                <li key={index}>{JSON.stringify(log, null, 2)}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Wallet Overview</h2>
          <div className="bg-white p-4 rounded shadow-md">
            <pre>{JSON.stringify(walletOverview, null, 2)}</pre>
          </div>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Live Traffic Map</h2>
          <div className="bg-white p-4 rounded shadow-md">
            <pre>{JSON.stringify(liveTrafficMap, null, 2)}</pre>
          </div>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Sales Analytics Chart</h2>
          <div className="bg-white p-4 rounded shadow-md">
            <pre>{JSON.stringify(salesAnalyticsChart, null, 2)}</pre>
          </div>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Custom Requests Table</h2>
          <div className="bg-white p-4 rounded shadow-md">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Requester</th>
                  <th>Request</th>
                </tr>
              </thead>
              <tbody>
                {customRequestsTable.map((request, index) => (
                  <tr key={index}>
                    <td>{request.id}</td>
                    <td>{request.requester}</td>
                    <td>{request.request}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-2">AI Operations Hub</h2>
          <div className="bg-white p-4 rounded shadow-md">
            <pre>{JSON.stringify(aiOperationsHub, null, 2)}</pre>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;