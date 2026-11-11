function publicConfig(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || "",
    key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const valid =
    /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url) &&
    /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
  return valid
    ? { ready: true, url, key }
    : {
        ready: false,
        message:
          "Supabase URL/publishable-key configuration is missing or invalid.",
      };
}
module.exports = { publicConfig };
