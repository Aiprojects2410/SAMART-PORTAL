/**
 * Samarth eGov Supabase Cloud Integration
 * Connects the student portal & admin console directly to Supabase cloud database.
 */

const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || 'https://hxsdjyhkmoltzrdamruw.supabase.co',
  anonKey: window.SUPABASE_ANON_KEY || 'sb_publishable_uvkMzbLZPBrG6Qk1i25bfg_9YOQEAWY'
};

// Initialize Supabase client
let supabaseClient = null;

try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✅ Supabase Client Initialized successfully with project:', SUPABASE_CONFIG.url);
  } else {
    console.warn('⚠️ Supabase JS library not loaded yet. Retrying on load.');
  }
} catch (err) {
  console.error('❌ Supabase initialization error:', err);
}

window.getSupabaseClient = function() {
  if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  return supabaseClient;
};
