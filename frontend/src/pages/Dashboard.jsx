import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import InsightCard from '../components/InsightCard';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [insights, setInsights] = useState([]);
  const [profile, setProfile] = useState(null);
  const [sentimentCounts, setSentimentCounts] = useState({ positive: 0, negative: 0, neutral: 0 });
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [insightMetrics, setInsightMetrics] = useState({
    sentiment: "0%", healthy: "0%", privacy: "0%", respect: "0%"
  });

  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const queryToken = queryParams.get("token");
    const queryExpiresAt = queryParams.get("expires_at");

    if (queryToken) {
      localStorage.setItem("token", queryToken);
      localStorage.setItem("expires_at", queryExpiresAt);
    }

    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expires_at");

    if (!token || !expiresAt || Date.now() > parseInt(expiresAt) * 1000) {
      alert("Your session expired. Please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("expires_at");
      return navigate("/");
    }

    const fetchData = async () => {
      try {
        const profileRes = await axios.get(`https://graph.facebook.com/me?fields=id,name,birthday,gender,picture.width(150).height(150)&access_token=${token}`);
        setProfile(profileRes.data);
        localStorage.setItem("fb_profile", JSON.stringify(profileRes.data));
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }

      try {
        const res = await axios.get(`http://localhost:8000/insights/analyze?token=${token}&method=ml`);
        const insights = res.data.insights || [];
        setInsights(insights);

        const counts = { positive: 0, negative: 0, neutral: 0 };
        let nightPosts = 0, locationMentions = 0, respectfulCount = 0;

        insights.forEach(item => {
          const label = (item.label || "").toLowerCase();
          if (counts[label] !== undefined) counts[label]++;

          const timestamp = item.timestamp;
          if (timestamp && new Date(timestamp).getHours() >= 23) nightPosts++;
          if (item.mentions_location) locationMentions++;
          if (item.is_respectful) respectfulCount++;
        });

        setSentimentCounts(counts);
        const total = insights.length || 1;
        const pos = (counts.positive / total) * 100;
        const privacyScore = (locationMentions / total) * 100;
        const respectfulScore = (respectfulCount / total) * 100;

        const recs = [];
        if (pos > 80) recs.push("✅ Great Job! Your interactions are consistently positive and respectful.");
        if (privacyScore > 20) recs.push("🔒 Privacy Tip: Consider reviewing your privacy settings. You mention location in many posts.");
        if (nightPosts > 0) recs.push("🌙 Usage Insight: You tend to post late at night. Consider daytime posting for better balance.");
        if ((counts.positive + counts.neutral) > counts.negative) recs.push("💬 Engagement Quality: Your tone is constructive. Keep it up!");

        setRecommendations(recs);
        const sentimentPercent = Math.round(pos);
        const healthyPercent = Math.round(100 - (nightPosts / total) * 100);
        const privacyPercent = Math.round(100 - privacyScore);
        const respectPercent = Math.round(respectfulScore);

        setInsightMetrics({
          sentiment: `${sentimentPercent}%`,
          healthy: `${healthyPercent}%`,
          privacy: `${privacyPercent}%`,
          respect: `${respectPercent}%`
        });
      } catch (err) {
        console.error("Failed to fetch insights", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const expiresAt = localStorage.getItem("expires_at");
    if (expiresAt) {
      const timeLeft = parseInt(expiresAt) * 1000 - Date.now();
      if (timeLeft > 0) {
        const timeout = setTimeout(() => {
          alert("Your session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("expires_at");
          navigate("/");
        }, timeLeft);
        return () => clearTimeout(timeout);
      }
    }
  }, [navigate]);

  const chartData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "# of Messages",
        data: [
          sentimentCounts.positive,
          sentimentCounts.negative,
          sentimentCounts.neutral,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ffc107"],
        borderWidth: 1,
      },
    ],
  };

  const totalSentiment =
    sentimentCounts.positive +
    sentimentCounts.negative +
    sentimentCounts.neutral;

  if (loading) return <div className="p-5 text-gray-600 text-center">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Digital Responsibility Dashboard</h2>

      {profile && (
        <div className="flex items-center space-x-6 mt-4 mb-10">
          <img src={profile.picture?.data?.url} alt="Profile" className="rounded-full w-20 h-20" />
          <div>
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            <p className="text-gray-600">Birthday: {profile.birthday || "N/A"}</p>
            <p className="text-gray-600">Gender: {profile.gender || "N/A"}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <InsightCard
          title="Positive Sentiment"
          value={insightMetrics.sentiment}
          rating={getSentimentRating(insightMetrics.sentiment)}
        />
        <InsightCard
          title="Healthy Usage"
          value={insightMetrics.healthy}
          rating={getHealthyRating(insightMetrics.healthy)}
        />
        <InsightCard
          title="Privacy Awareness"
          value={insightMetrics.privacy}
          rating={getPrivacyRating(insightMetrics.privacy)}
        />
        <InsightCard
          title="Respectful Interactions"
          value={insightMetrics.respect}
          rating={getRespectRating(insightMetrics.respect)}
        />
      </div>

      {totalSentiment > 0 ? (
        <div className="max-w-sm mx-auto mb-10">
          <Pie data={chartData} />
        </div>
      ) : (
        <p className="text-center text-gray-500 mb-10">No sentiment data to show.</p>
      )}

      <div className="bg-gray-100 p-6 rounded shadow mb-8">
        <h4 className="text-xl font-semibold mb-3">Personalized Recommendations</h4>
        <ul className="list-disc ml-5 text-gray-700">
          {recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
        </ul>
      </div>

      <div className="mt-10">
        <h4 className="text-xl font-semibold mb-2">Post-by-Post Sentiment</h4>
        <div className="bg-white rounded shadow p-4 overflow-auto max-h-[300px]">
          {insights.map((item, index) => (
            <div key={index} className="border-b py-2">
              <p className="text-sm">{item.original}</p>
              <p className="text-xs text-gray-500">
                Sentiment: <span className="font-semibold">{item.label}</span> |{' '}
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
