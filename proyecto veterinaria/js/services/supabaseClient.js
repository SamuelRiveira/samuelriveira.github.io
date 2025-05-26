import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://kmypwriazdbxpwdxfhaf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtteXB3cmlhemRieHB3ZHhmaGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDMzNjMsImV4cCI6MjA2MzIxOTM2M30.oIjUGqzH6_REP0Ci8AvXDeJaLvYq17yLxWPu7xwxpXA";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);