import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import InsightCard from "../components/InsightCard";
import AnalyzeToken from "../components/AnalyzeToken";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [insightsData, setInsightsData] = useState({ profile: null, insights: [], totalPosts: 0, totalComments: 0 });
  const { profile, insights, totalPosts, totalComments } = insightsData;

  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
  let nightPosts = 0, locationMentions = 0, respectfulCount = 0;

  insights.forEach(item => {
    const label = (item.label || "").toLowerCase();
    if (sentimentCounts[label] !== undefined) sentimentCounts[label]++;
    const timestamp = item.timestamp;
    if (timestamp && new Date(timestamp).getHours() >= 23) nightPosts++;
    if (item.mentions_location) locationMentions++;
    if (item.is_respectful) respectfulCount++;
  });

  const total = insights.length || 1;
  const posPercent = (sentimentCounts.positive / total) * 100;
  const privacyScore = (locationMentions / total) * 100;
  const respectfulScore = (respectfulCount / total) * 100;

  const insightMetrics = {
    sentiment: `${Math.round(posPercent)}%`,
    healthy: `${Math.round(100 - (nightPosts / total) * 100)}%`,
    privacy: `${Math.round(100 - privacyScore)}%`,
    respect: `${Math.round(respectfulScore)}%`,
  };

  const chartData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "# of Interactions",
        data: [sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral],
        backgroundColor: ["#4caf50", "#f44336", "#ffc107"],
        borderWidth: 1,
      },
    ],
  };

  const recommendations = [];
  if (posPercent > 80) recommendations.push("✅ Great Job! Your interactions are consistently positive and respectful.");
  if (privacyScore > 20) recommendations.push("🔒 Privacy Tip: You mention location in many posts/comments. Consider adjusting privacy settings.");
  if (nightPosts > 0) recommendations.push("🌙 Usage Insight: You tend to post late at night.");
  if ((sentimentCounts.positive + sentimentCounts.neutral) > sentimentCounts.negative) recommendations.push("💬 Engagement Quality: Your tone is constructive.");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Digital Responsibility Dashboard</h2>

      <AnalyzeToken
        token={localStorage.getItem("token")}
        method="ml"
        onInsightsFetched={setInsightsData}
      />

      <div className="text-gray-700 mb-4">
        <p>Total Posts: {totalPosts} | Total Comments: {totalComments} | Total Interactions: {insights.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
        <InsightCard title="Positive Sentiment" value={insightMetrics.sentiment} rating={getSentimentRating(insightMetrics.sentiment)} />
        <InsightCard title="Healthy Usage" value={insightMetrics.healthy} rating={getHealthyRating(insightMetrics.healthy)} />
        <InsightCard title="Privacy Awareness" value={insightMetrics.privacy} rating={getPrivacyRating(insightMetrics.privacy)} />
        <InsightCard title="Respectful Interactions" value={insightMetrics.respect} rating={getRespectRating(insightMetrics.respect)} />
      </div>

      {insights.length > 0 && (
        <div className="max-w-sm mx-auto mb-6">
          <Pie key={JSON.stringify(sentimentCounts)} data={chartData} />
        </div>
      )}

      <div className="bg-gray-100 p-6 rounded shadow mb-6">
        <h4 className="text-xl font-semibold mb-3">Personalized Recommendations</h4>
        <ul className="list-disc ml-5 text-gray-700">
          {recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="text-xl font-semibold mb-2">Post & Comment Details</h4>
        <div className="bg-white rounded shadow p-4 overflow-auto max-h-[300px]">
          {insights.map((item, idx) => (
            <div key={idx} className="border-b py-2">
              <p className="text-sm">{item.original}</p>
              <p className="text-xs text-gray-500">
                Type: {item.type} | Sentiment: <span className="font-semibold">{item.label}</span> |{' '}
                Privacy Disclosure: {item.privacy_disclosure ? "Yes" : "No"} |{' '}
                Toxic: {item.toxic ? "Yes" : "No"} |{' '}
                Misinformation Risk: {item.misinformation_risk ? "Yes" : "No"} |{' '}
                Time: {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSentimentRating(val) {
  const percent = parseInt(val);
  if (percent >= 75) return "Excellent";
  if (percent >= 50) return "Good";
  return "Needs Work";
}
function getHealthyRating(val) {
  const percent = parseInt(val);
  return percent >= 80 ? "Balanced" : "Try Reducing Late Usage";
}
function getPrivacyRating(val) {
  const percent = parseInt(val);
  return percent >= 80 ? "Good" : "Watch Location Sharing";
}
function getRespectRating(val) {
  const percent = parseInt(val);
  return percent >= 75 ? "Excellent" : "Improve Respectfulness";
}
