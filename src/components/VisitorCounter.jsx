import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { getVisitorStats } from "../utils/visitorTracker";

function VisitorCounter() {
  const [stats, setStats] = useState({ totalViews: null, todayViews: null, status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      const result = await getVisitorStats();
      if (mounted) setStats(result);
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  if (stats.status === "missing-config") {
    return <div className="visitor-counter"><Eye size={15} /> 瀏覽統計未連接</div>;
  }

  if (stats.status === "error") {
    return <div className="visitor-counter"><Eye size={15} /> 瀏覽統計暫時未能讀取</div>;
  }

  return (
    <div className="visitor-counter">
      <span><Eye size={15} /> 累計瀏覽：{typeof stats.totalViews === "number" ? stats.totalViews.toLocaleString() : "—"}</span>
      <span>今日瀏覽：{typeof stats.todayViews === "number" ? stats.todayViews.toLocaleString() : "—"}</span>
    </div>
  );
}

export default VisitorCounter;
