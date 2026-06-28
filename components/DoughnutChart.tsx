"use client"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


const DoughnutChart = ({ accounts } : DoughnutChartProps) => {

  const hasAccounts = accounts.length > 0;
  const accountNames = hasAccounts
    ? accounts.map((account) => account.name)
    : ["No accounts"];
  const balances = hasAccounts
    ? accounts.map((account) => account.currentBalance)
    : [1];
  

  const data = {
    datasets: [
      {
        label: 'Banks',
        data: balances,
        backgroundColor: hasAccounts
          ? [
              '#077bff',
              '#2265d8',
              '#2f91fa'
            ]
          : ['#475569'],
        borderWidth: 0,
        hoverBackgroundColor: hasAccounts
          ? [
              '#077bff',
              '#2265d8',
              '#2f91fa'
            ]
          : ['#475569'],
      }
    ],
    labels: accountNames
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "60%",
    plugins: {
      legend: {
        display: hasAccounts,
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
        enabled: hasAccounts,
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
