'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ShieldCheck, Zap, Globe, GraduationCap,
  Landmark, Star, Target, CheckCircle2,
  History, ArrowUpLeft, Briefcase, Award,
  MessageCircle, MapPin, Building2, TrendingUp, ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import TechBackground from '@/components/TechBackground';

// Custom Social SVG Components
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Floating3DObject = ({ children, x, y, translateZ, rotate }: any) => (
  <motion.div
    style={{ x, y, translateZ, rotateZ: rotate, transformStyle: "preserve-3d" }}
    className="absolute z-20 p-5 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] text-emerald-500"
  >
    {children}
  </motion.div>
);

export default function SahelSalemBio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-12deg", "12deg"]);

  const moveX = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const moveY = useTransform(springY, [-0.5, 0.5], [-40, 40]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const socialLinks = [
    { icon: <FacebookIcon size={22} />, href: "https://www.facebook.com/share/1A6hht1gio/?mibextid=wwXIfr" },
    { icon: <InstagramIcon size={22} />, href: "https://www.instagram.com/s4_hel1?igsh=a3k3YW8zNHRxZXUx&utm_source=qr" },
    { icon: <MessageCircle size={22} />, href: "https://wa.me/+93700582033" },
  ];

  return (
    <div className="min-h-screen bg-[#000] text-white pb-32 font-sans overflow-x-hidden selection:bg-emerald-500/30" dir="rtl" onMouseMove={handleMouseMove}>
      
      {/* Sleek, executive enterprise tech background */}
      <TechBackground variant="emerald" />

      {/* جلوه‌های پس‌زمینه */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-600/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10">

        {/* دکمه بازگشت به هیئت مدیره */}
        <div className="max-w-6xl mx-auto px-6 pt-10">
          <Link 
            href="/about" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-emerald-400 transition-all backdrop-blur-xl group"
          >
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> بازگشت به اعضای هیئت مدیره
          </Link>
        </div>

        {/* --- بخش هیرو --- */}
        <section ref={containerRef} className="relative pt-12 pb-20 flex flex-col items-center">
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
            <div className="relative w-72 h-72 md:w-96 md:h-96 z-10">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full" />
              <div className="relative h-full w-full rounded-[5rem] overflow-hidden border border-emerald-500/20 p-3 bg-[#050505]">
                <Image src="/sahel.jpeg" alt="ساحل سالم" fill className="object-cover rounded-[4.5rem] grayscale hover:grayscale-0 transition-all duration-700" priority />
              </div>
            </div>

            <Floating3DObject x={moveX} y={moveY} translateZ={150} rotate="-15deg">
              <Star size={35} fill="currentColor" />
            </Floating3DObject>
            <motion.div style={{ x: moveY, y: moveX, translateZ: 180 }} className="absolute -left-16 top-10">
              <div className="bg-emerald-500 text-black px-5 py-3 rounded-3xl shadow-2xl font-black text-lg">CEO</div>
            </motion.div>
          </motion.div>

          <div className="text-center mt-16 px-6 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-6">
              ساحل <span className="text-transparent stroke-emerald-500 stroke-2" style={{ WebkitTextStroke: '2px #10b981' }}>سالم</span>
            </h1>
            <p className="text-emerald-500 font-bold tracking-[0.3em] text-lg md:text-2xl uppercase mt-4">مدیرعامل (CEO) و مدیر ارتباطات اروپا</p>

            {/* مشخصات سریع */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 text-gray-400 text-sm">
              <span className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/5">
                <MapPin size={16} className="text-emerald-400" /> دفتر مرکزی بین‌المللی • Global Hub
              </span>
              <span className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/5">
                <Building2 size={16} className="text-emerald-400" /> مدیریت استراتژیک و شبکه بانکی اروپا
              </span>
              <span className="flex items-center gap-2 bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/5">
                <GraduationCap size={16} className="text-emerald-400" /> محصل BBA
              </span>
            </div>

            {/* شبکه‌های اجتماعی */}
            <div className="flex justify-center gap-6 mt-10">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  target="_blank"
                  className="group relative w-16 h-16 flex items-center justify-center rounded-3xl bg-white/[0.03] border border-white/10 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all duration-500 backdrop-blur-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- بیوگرافی و چشم‌انداز مدیریتی --- */}
        <section className="py-20 container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-right">
            <div className="lg:col-span-7">
              <div className="p-10 md:p-14 rounded-[4rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
                <div className="flex items-center gap-4 mb-8">
                  <History className="text-emerald-500" size={32} />
                  <h3 className="text-3xl font-black italic uppercase">رهبری و چشم‌انداز استراتژیک</h3>
                </div>
                <div className="space-y-6 text-gray-300 text-lg md:text-xl leading-[2.2] text-justify font-light">
                  <p>
                    <span className="text-white font-bold">ساحل سالم</span>، متولد <span className="text-emerald-400 font-semibold">۱۹ مارچ ۲۰۰۷</span>، مدیرعامل (CEO) و مدیر ارشد روابط بین‌الملل و اروپای SafiPay است. وی یکی از ارکان بنیادین و معماران اصلی استراتژی برون‌مرزی این اکوسیستم مالی دیجیتال به شمار می‌رود.
                  </p>
                  <p>
                    تمرکز محوری ساحل بر گسترش کانال‌های بانکی مستقیم، ادغام سیستم حساب‌های بانکی اختصاصی اروپایی (IBAN)، اتصال به شبکه پرداخت یکپارچه اروپا (SEPA) و ایجاد بستر قانونی و تحت نظارت برای انتقال‌های مالی فرامرزی است. او با درک جامع از الزامات مالی نوین و اصول پیشرفته مدیریت کسب‌وکار، نقشی کلیدی در شکستن انزوای بانکی و توانمندسازی افراد و شرکت‌ها برای حضور پرقدرت در بازارهای جهانی ایفا می‌کند.
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-6 p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 italic text-emerald-100/90 text-lg">
                  "رسالت ما در SafiPay از بین بردن انزوای مالی و ایجاد زیرساخت‌های بانکی مدرن، شفاف و منطبق با استانداردهای رگولاتوری جهانی است تا هر فرد و کسب‌وکاری بتواند آزادانه در سطح بین‌المللی تعامل مالی داشته باشد."
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* بخش تحصیلات */}
              <div className="p-10 rounded-[3.5rem] bg-gradient-to-bl from-emerald-600/20 via-emerald-950/10 to-transparent border border-emerald-500/20 shadow-2xl">
                <GraduationCap className="text-emerald-500 mb-6" size={44} />
                <h4 className="text-2xl font-black italic uppercase mb-2">بخش تحصیلات</h4>
                <p className="text-white text-2xl font-black mb-2">محصل BBA</p>
                <p className="text-emerald-400 font-mono tracking-widest uppercase text-xs mb-4">مدیریت بازرگانی • Business Administration</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  تمرکز تخصصی بر مدیریت استراتژیک، اصول تجارت بین‌الملل، مدیریت مالی و تحلیل توسعه سیستم‌های فین‌تک مدرن در مقیاس جهانی.
                </p>
              </div>

              {/* ارتباط مستقیم */}
              <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer transition-all hover:bg-white/[0.04]">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-gray-500 mb-1">ارتباط مستقیم و همکاری</p>
                  <p className="text-xl font-bold italic">واتس‌اپ رسمی</p>
                  <p className="text-xs text-gray-500 mt-1" dir="ltr">+93 70 058 2033</p>
                </div>
                <Link href="https://wa.me/+93700582033" target="_blank" className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <ArrowUpLeft size={22} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- تخصص‌های کلیدی و مهارت‌های استراتژیک --- */}
        <section className="py-20 bg-emerald-500/[0.02]">
          <div className="container mx-auto max-w-6xl px-6">
            <h2 className="text-center text-4xl font-black mb-16 italic uppercase">تخصص‌های کلیدی و پشته مدیریتی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 bg-black border border-white/5 rounded-[3rem] hover:border-emerald-500/40 transition-all group text-right">
                <TrendingUp className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">مدیریت اجرایی و استراتژی</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-mono">تدوین برنامه‌ریزی کلان، رهبری سازمانی، توسعه کسب‌وکار و مقیاس‌پذیری زیرساخت‌های فین‌تک.</p>
              </div>
              <div className="p-8 bg-black border border-white/5 rounded-[3rem] hover:border-emerald-500/40 transition-all group text-right">
                <Landmark className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">بانکداری اروپا و SEPA</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-mono">تسهیل دسترسی به کانال‌های SEPA Instant، صدور حساب‌های معتبر IBAN و مدیریت نقدینگی یورو.</p>
              </div>
              <div className="p-8 bg-black border border-white/5 rounded-[3rem] hover:border-emerald-500/40 transition-all group text-right">
                <ShieldCheck className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">انطباق مالی و AML</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-mono">تضمین تطابق با الزامات رگولاتوری اروپا، فرآیندهای مبارزه با پولشویی (AML) و شفافیت تراکنش‌ها.</p>
              </div>
              <div className="p-8 bg-black border border-white/5 rounded-[3rem] hover:border-emerald-500/40 transition-all group text-right">
                <Globe className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">مشارکت‌های بین‌المللی</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-mono">مذاکرات سطح بالا با ارائه‌دهندگان نقدینگی، نهادهای صادرکننده کارت و شرکای تجاری بین‌المللی.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- تجربیات حرفه‌ای و نقش‌های اجرایی --- */}
        <section className="py-20">
          <div className="container mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 text-right">
            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic uppercase"><Briefcase className="text-emerald-500" /> نقش‌های اجرایی و مسئولیت‌ها</h2>
              <div className="space-y-8 border-r-2 border-white/10 pr-8">
                <div className="relative">
                  <div className="absolute -right-[41px] top-2 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />
                  <h4 className="text-xl font-bold text-white">مدیرعامل و مدیر ارشد روابط اروپا (CEO)</h4>
                  <p className="text-emerald-400 text-sm mb-2">اکوسیستم SafiPay (۲۰۲۴ - اکنون)</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    هدایت امور اجرایی، مذاکره و برقراری ارتباط با موسسات مالی اتحادیه اروپا، و نظارت بر فعال‌سازی حساب‌های بانکی بین‌المللی برای کاربران سراسر دنیا.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -right-[41px] top-2 w-4 h-4 bg-white/20 rounded-full" />
                  <h4 className="text-xl font-bold text-white">استراتژیست شبکه پرداخت‌های برون‌مرزی</h4>
                  <p className="text-emerald-400 text-sm mb-2">توسعه کانال‌های مالی بین‌الملل (۲۰۲۳ - اکنون)</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    تحلیل و بهینه‌سازی مسیرهای تسویه ارزی، مدیریت ریسک تراکنش‌های فرامرزی و پیاده‌سازی سازوکارهای انتقال سریع مالی.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic uppercase"><Target className="text-emerald-500" /> ارکان استراتژیک در صافی‌پی</h2>
              <div className="space-y-8 border-r-2 border-white/10 pr-8">
                <div className="relative">
                  <div className="absolute -right-[41px] top-2 w-4 h-4 bg-emerald-500 rounded-full" />
                  <h4 className="text-xl font-bold text-white">یکپارچه‌سازی با استانداردهای بانکی اروپا</h4>
                  <p className="text-emerald-400 text-sm">اتصال مستقیم به کانال‌های SEPA و شبکه نقل‌وانتقالات یورو</p>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                    تضمین سرعت و شفافیت حداکثری در حواله‌های بین‌المللی و حذف واسطه‌های غیرضروری مالی.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -right-[41px] top-2 w-4 h-4 bg-white/20 rounded-full" />
                  <h4 className="text-xl font-bold text-white">پایداری قانونی و شفافیت کامل</h4>
                  <p className="text-emerald-400 text-sm italic">انطباق با مقررات مالیاتی و دستورالعمل‌های بین‌المللی</p>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                    پیاده‌سازی مکانیزم‌های سخت‌گیرانه اعتبارسنجی برای حفظ امنیت سپرده‌ها و دارایی‌های کاربران.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- دستاوردهای کلیدی --- */}
        <section className="py-20 container mx-auto max-w-4xl px-6 text-center">
          <div className="bg-gradient-to-br from-emerald-600/20 via-emerald-950/10 to-transparent p-12 rounded-[4rem] border border-emerald-500/20 relative overflow-hidden text-right">
            <Award className="text-emerald-500 mx-auto mb-6" size={60} />
            <h2 className="text-3xl font-black mb-8 italic uppercase text-center">دستاوردها و اهداف کلیدی</h2>
            <ul className="text-gray-300 space-y-5 text-lg inline-block w-full">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <span>تثبیت دسترسی به حساب‌های اروپایی IBAN اختصاصی با قابلیت واریز و برداشت آنی</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <span>پیوند استراتژیک میان اکوسیستم SafiPay و شبکه پرداخت یکپارچه اروپا (SEPA)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <span>توسعه مذاکرات با نهادهای ارائه‌دهنده کارت‌های بین‌المللی ویزا و مسترکارت</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <span>استقرار سیستم انطباق پولی و ضد پولشویی مطابق با استانداردهای رگولاتوری بین‌الملل</span>
              </li>
            </ul>
          </div>
        </section>

        {/* --- استراتژی جهانی (Global Strategy) --- */}
        <section className="py-24 bg-emerald-500/[0.02]">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: <Globe size={40} />, title: "توسعه در اروپا", desc: "رهبری حضور استراتژیک SafiPay در مراکز بانکی اتحادیه اروپا و تسهیل اتصال برون‌مرزی." },
                { icon: <Landmark size={40} />, title: "امنیت حساب‌های IBAN", desc: "نظارت بر ادغام حساب‌های بانکی SEPA برای کاربران بین‌المللی با بالاترین استانداردهای امنیتی." },
                { icon: <ShieldCheck size={40} />, title: "انطباق قانونی بین‌الملل", desc: "تضمین همسویی ۱۰۰ درصدی با قوانین بین‌المللی مبارزه با پولشویی و حفاظت از دارایی‌ها." }
              ].map((pill, i) => (
                <div key={i} className="p-12 rounded-[3.5rem] bg-[#080808] border border-white/5 group hover:border-emerald-500/40 transition-all duration-700 text-right">
                  <div className="text-emerald-500 mb-8 group-hover:scale-110 transition-transform">{pill.icon}</div>
                  <h4 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">{pill.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{pill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30" />
          <p className="text-gray-600 text-[10px] uppercase font-black tracking-[0.5em] mb-8 italic">
            ساحل سالم • مدیرعامل و مدیر ارشد بین‌الملل SafiPay • ۲۰۲۶
          </p>
          <div className="flex justify-center gap-8">
            {socialLinks.map((social, i) => (
              <Link key={i} href={social.href} target="_blank" className="text-gray-500 hover:text-emerald-500 transition-colors">
                {social.icon}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);