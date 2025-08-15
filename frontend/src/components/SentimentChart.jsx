import React from 'react';
import { Pie } from 'react-chartjs-2';

export default function SentimentChart({ sentimentCounts }) {
  const total = Object.values(sentimentCounts).reduce((a,b)=>a+b,0);
  if (total === 0) return <p className="text-center text-gray-500 mb-10">No sentiment data to show.</p>;

  const data = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "# of Messages",
        data: [sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral],
        backgroundColor: ["#4caf50", "#f44336", "#ffc107"],
        borderWidth: 1,
      },
    ],
  };

  return <div className="max-w-sm mx-auto mb-10"><Pie data={data} /></div>;
}
