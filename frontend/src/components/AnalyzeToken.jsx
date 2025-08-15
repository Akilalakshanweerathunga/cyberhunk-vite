import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AnalyzeToken({ token, method = "ml", onInsightsFetched }) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await axios.get(
          `https://graph.facebook.com/me?fields=id,name,birthday,gender,picture.width(150).height(150)&access_token=${token}`
        );
        setProfile(profileRes.data);

        const res = await axios.get(
          `http://localhost:8000/insights/analyze?token=${token}&method=${method}`
        );
        const fetchedInsights = res.data.insights || [];
        setInsights(fetchedInsights);

        const totalPosts = fetchedInsights.filter(i => i.type === "post").length;
        const totalComments = fetchedInsights.filter(i => i.type === "comment").length;

        if (onInsightsFetched) {
          onInsightsFetched({
            profile: profileRes.data,
            insights: fetchedInsights,
            totalPosts,
            totalComments
          });
        }
      } catch (err) {
        console.error("Failed to fetch or analyze token", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, method, onInsightsFetched]);

  if (!token) return <p className="text-red-500">Token is missing.</p>;
  if (loading) return <p className="text-gray-600">Analyzing token...</p>;

  return (
    <div>
      {profile && (
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={profile.picture?.data?.url}
            alt="Profile"
            className="rounded-full w-16 h-16"
          />
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-gray-500">Birthday: {profile.birthday || "N/A"}</p>
            <p className="text-sm text-gray-500">Gender: {profile.gender || "N/A"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
