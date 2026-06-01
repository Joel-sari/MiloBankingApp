"use client"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


const DoughnutChart = ({ accounts } : DoughnutChartProps) => {
  const accountBalances = accounts.length
    ? accounts.map((account) => account.currentBalance)
    : [1250, 2500];

  const accountLabels = accounts.length
    ? accounts.map((account) => account.name)
    : ['Bank 1', 'Bank 2'];

  const data = {
    datasets: [
      {
        label: 'Banks',
        data: accountBalances,
        backgroundColor: [
          '#077bff',
          '#2265d8',
          '#2f91fa'
        ],
        borderWidth: 0,
      }
    ],
    labels: accountLabels
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "60%",
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "start",
        labels: {
          boxWidth: 18,
          boxHeight: 8,
          padding: 8,
          font: {
            size: 10,
          },
        },
      },

      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="size-full">
      <Doughnut data={data} options={options} />
    </div>
  )
}

export default DoughnutChart
