import { redirect } from 'next/navigation';

export default function ProfileRootPage() {
  // وقتی کاربر به آدرس پروفایل می‌آید، مستقیماً به صفحه Overview شوت می‌شود
  redirect('/dashboard/profile/overview');
}