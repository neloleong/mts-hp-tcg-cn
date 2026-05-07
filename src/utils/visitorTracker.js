import { hasSupabaseConfig, supabase } from "../lib/supabaseClient";

const TABLE_NAME = "hp_tcg_visitor_logs";
const VISITOR_KEY = "hp_tcg_cn_visitor_id";

function getVisitorId() {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const next = crypto?.randomUUID
    ? crypto.randomUUID()
    : `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(VISITOR_KEY, next);
  return next;
}

export async function recordVisit(pageTitle = "") {
  if (!hasSupabaseConfig || !supabase) return { ok: false, reason: "missing-config" };

  const pagePath = `${window.location.pathname}${window.location.hash || "#home"}`;

  const { error } = await supabase.from(TABLE_NAME).insert({
    visitor_id: getVisitorId(),
    page_path: pagePath,
    page_title: pageTitle || document.title,
    referrer: document.referrer || "",
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight
  });

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function getVisitorStats() {
  if (!hasSupabaseConfig || !supabase) {
    return { totalViews: null, todayViews: null, status: "missing-config" };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: totalViews, error: totalError } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true });

  if (totalError) return { totalViews: null, todayViews: null, status: "error" };

  const { count: todayViews, error: todayError } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());

  if (todayError) return { totalViews: null, todayViews: null, status: "error" };

  return { totalViews: totalViews || 0, todayViews: todayViews || 0, status: "ready" };
}
