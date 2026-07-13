import { useEffect, useState } from "react";
import api from "../../services/api";

export default function DashboardDebug() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching dashboard data...");
        const response = await api.get("/v1/owner/dashboard?period=monthly");
        console.log("✅ Response received:", response.data);
        setData(response.data);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", backgroundColor: "#f5f5f5" }}>
      <h1>Dashboard Debug</h1>
      
      <h2>Stats:</h2>
      <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px" }}>
        {JSON.stringify(data?.stats, null, 2)}
      </pre>

      <h2>Daily Income Chart:</h2>
      <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", maxHeight: "300px", overflow: "auto" }}>
        {JSON.stringify(data?.charts?.daily_income, null, 2)}
      </pre>

      <h2>User Growth Chart:</h2>
      <pre style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "4px", maxHeight: "300px", overflow: "auto" }}>
        {JSON.stringify(data?.charts?.user_growth, null, 2)}
      </pre>
    </div>
  );
}
