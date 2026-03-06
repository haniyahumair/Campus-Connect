import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://mvhfqxhgxarfnzbjntef.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12aGZxeGhneGFyZm56YmpudGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDkyNjIsImV4cCI6MjA4NTUyNTI2Mn0._cYsS4bWBTymDWlmxbecu-Xrh7D7bRknCzIU86rGK3M"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);