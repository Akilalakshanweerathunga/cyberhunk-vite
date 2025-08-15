export default function PostInsights({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="mt-10">
      <h4 className="text-xl font-semibold mb-2">Post-by-Post Insights</h4>
      <div className="bg-white rounded shadow p-4 overflow-auto max-h-[400px]">
        {insights.map((item, index) => (
          <div key={index} className="border-b py-2">
            <p className="text-sm">{item.original}</p>
            <p className="text-xs text-gray-500">
              Type: {item.type} | Sentiment: <span className="font-semibold">{item.label}</span> | 
              Privacy: {item.privacy_disclosure ? "⚠️" : "✅"} | Toxic: {item.toxic ? "⚠️" : "✅"} | Misinformation: {item.misinformation_risk ? "⚠️" : "✅"} | 
              Time: {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
