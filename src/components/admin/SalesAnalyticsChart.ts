// src/components/admin/SalesAnalyticsChart.ts
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define chart data interface
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    tension: number;
  }[];
}

// Define sales analytics chart component
const SalesAnalyticsChart = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      },
    ],
  });

  // Fetch sales data from API
  const fetchSalesData = async () => {
    try {
      const response = await axios.get('/api/admin/analytics/sales');
      const salesData = response.data;

      // Process sales data
      const labels: string[] = [];
      const data: number[] = [];
      salesData.forEach((sale: any) => {
        labels.push(sale.date);
        data.push(sale.amount);
      });

      // Update chart data
      setChartData({
        labels,
        datasets: [
          {
            label: 'Sales',
            data,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch sales data on component mount
  useEffect(() => {
    fetchSalesData();
  }, []);

  // Render sales analytics chart
  return (
    <div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default SalesAnalyticsChart;

This code defines a `SalesAnalyticsChart` component that fetches sales data from an API and displays it in a line chart using `react-chartjs-2`. The chart data is updated when the component mounts, and the chart is rendered with a responsive design and a legend. The sales data is fetched from the `/api/admin/analytics/sales` endpoint, which is assumed to return a list of sales data with `date` and `amount` properties.