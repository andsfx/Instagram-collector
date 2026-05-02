const { createClient } = require('@supabase/supabase-js');

function createReadClient(url, anonKey) {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

module.exports = { createReadClient };
