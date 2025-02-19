import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL; // Add this in your .env file
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // Add this in your .env file

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
