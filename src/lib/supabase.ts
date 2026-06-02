import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// این کلاینت هوشمند است و توکن‌ها را به صورت خودکار در کوکی ذخیره می‌کند
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);