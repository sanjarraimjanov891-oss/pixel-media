/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Heart, 
  GraduationCap, 
  Megaphone, 
  BarChart3, 
  Calendar as CalendarIcon,
  Play,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  MapPin,
  Video,
  Info,
  FileText,
  Camera,
  Sparkles,
  Send,
  X,
  MessageSquare,
  Zap,
  Activity,
  Palette,
  Trash2,
  RefreshCw,
  Phone,
  Banknote,
  Sun,
  Moon,
  ArrowUpRight,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

type Page = 'dashboard' | 'wedding' | 'project_details' | 'add_order' | 'orders_list' | 'school_list' | 'add_school_order' | 'ads_list' | 'add_ads_order' | 'design_list' | 'add_design_order' | 'trash' | 'reports' | 'calendar';

interface Order {
  id: number;
  customerName: string;
  date: string;
  details: string;
  phone: string;
  address?: string;
  deposit: string;
  status: string;
  type: string;
  operator: string;
  deletedAt?: number;
}

interface SchoolOrder {
  id: number;
  schoolName: string;
  className: string;
  vignetteType: string;
  price: string;
  monitorPhone: string;
  date: string;
  status: string;
  deletedAt?: number;
}

interface DesignOrder {
  id: number;
  customerName: string;
  designType: string;
  size: string;
  complexity: string;
  price: string;
  notes: string;
  date: string;
  status: string;
  deletedAt?: number;
}

interface AdsOrder {
  id: number;
  customerName: string;
  businessType: string;
  price: string;
  date: string;
  phone: string;
  status: string;
  deletedAt?: number;
}

const modules = [
  { id: 'wedding', icon: Heart, label: 'Той', subLabel: 'Үйлөнүү үлпөтү' },
  { id: 'school', icon: GraduationCap, label: 'Мектеп', subLabel: 'Мектептик сессиялар' },
  { id: 'ads', icon: Megaphone, label: 'Жарнама', subLabel: 'Коммерциялык буйрутмалар' },
  { id: 'reports', icon: BarChart3, label: 'Отчёт', subLabel: 'Студиялык аналитика' },
  { id: 'calendar', icon: CalendarIcon, label: 'Календарь', subLabel: 'Бронь графиги' },
  { id: 'design', icon: Palette, label: 'Дизайн', subLabel: 'Графикалык иштер' },
];

// Initial mock data removed for production

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AIChatModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Саламатсызбы! Мен Pixe1.media студиясынын AI жардамчысымын. Сизге кантип жардам бере алам?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: 'user', text: userMessage }].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "Сиз Pixe1.media аттуу видео студиянын башкаруу системасындагы AI жардамчысыз. Сиздин максатыңыз - колдонуучуга системаны колдонууга жардам берүү жана алардын суроолоруна кыргыз тилинде жооп берүү. Сиз сылык, кесипкөй жана жардам берүүгө даяр болушуңуз керек."
        }
      });

      const modelText = response.text || "Кечиресиз, ката кетти. Кайра аракет кылып көрүңүз.";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Кечиресиз, байланышта ката кетти. Интернетти текшерип көрүңүз." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-[500px] h-[600px] bg-[#0a0f1d] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-[#08c4e5]">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">AI Жардамчы</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Онлайн</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-[#08c4e5] text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10 bg-slate-900/30">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Сурооңузду жазыңыз..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:ring-2 focus:ring-[#08c4e5] outline-none transition-all"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-[#08c4e5] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OPERATOR_PHOTOS: Record<string, string> = {
  'Санжар': 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&h=200&auto=format&fit=crop',
  'Нурболот': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop'
};

const OrderHistogram = () => {
  const [data, setData] = useState([
    { label: 'Той', value: 12 },
    { label: 'Мектеп', value: 8 },
    { label: 'Жарнама', value: 15 },
    { label: 'Отчёт', value: 5 },
    { label: 'Календарь', value: 10 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        value: Math.max(2, Math.min(20, item.value + (Math.random() > 0.5 ? 1 : -1)))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const max = 20; // Fixed max for stability during animation

  return (
    <div className="flex items-end gap-3 h-20 w-full px-4 py-3 bg-slate-900/50 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md overflow-hidden">
      <div className="flex-1 flex items-end justify-between gap-2 h-full">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 group relative h-full justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-4 rounded-t-md bg-[#08c4e5] shadow-[0_0_10px_rgba(8,196,229,0.2)] group-hover:bg-[#07b3d1] transition-colors relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-md"></div>
            </motion.div>
            <span className="text-[7px] font-bold text-slate-300 uppercase tracking-tighter">{item.label[0]}</span>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-20 shadow-xl font-bold">
              {item.label}: {item.value}
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats to fill the right side */}
      <div className="flex flex-col justify-center border-l border-white/10 pl-3 h-full">
        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">Жалпы</p>
        <p className="text-sm font-black text-[#08c4e5] leading-none">
          {data.reduce((acc, curr) => acc + curr.value, 0)}
        </p>
        <p className="text-[5px] font-medium text-slate-500 uppercase tracking-tighter">заказ</p>
      </div>
    </div>
  );
};

const VideoPlayer = () => {
  const videos = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const handleVideoError = () => {
    console.error("Video failed to load");
    handleVideoEnd();
  };

  return (
    <div className="rotating-border-content w-full h-full relative overflow-hidden bg-slate-900">
      <video
        key={currentVideoIndex}
        className="w-full h-full object-cover opacity-80"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        src={videos[currentVideoIndex]}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
    </div>
  );
};

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative group">
      {/* Animated Glow Background - Cyberpunk style */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#08c4e5] via-blue-500 to-[#08c4e5] rounded-full blur-[2px] opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      
      {/* Main Container */}
      <div className="relative flex items-center gap-3 px-4 py-2 bg-slate-950/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_0_20px_rgba(8,196,229,0.15)] overflow-hidden">
        
        {/* Animated Icon with Ring */}
        <div className="relative flex items-center justify-center w-7 h-7">
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full border border-cyan-500/20 animate-[ping_3s_linear_infinite]"></div>
          <div className="absolute inset-1 bg-cyan-500/5 rounded-full border border-cyan-500/10 animate-[pulse_2s_ease-in-out_infinite]"></div>
          <Zap size={16} className="text-[#08c4e5] relative z-10 drop-shadow-[0_0_8px_rgba(8,196,229,0.8)]" />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-lg md:text-xl font-black text-white tracking-tight tabular-nums font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
              {currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] md:text-xs font-bold text-[#08c4e5] animate-pulse font-mono opacity-80">
              {currentTime.toLocaleTimeString('ru-RU', { second: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 -mt-0.5">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="w-1 h-1 rounded-full bg-emerald-500/40"></span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] font-mono">
              System Live
            </span>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-xl"></div>
      </div>
    </div>
  );
};

const parseAmount = (amountStr: string) => {
  if (!amountStr) return 0;
  const cleaned = amountStr.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

const KYRGYZ_MONTHS = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
];

const RUSSIAN_MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = dateStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  
  let match = dateStr.match(/(\d+)-([а-яА-Я]+),\s*(\d{4})/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase();
    const year = parseInt(match[3], 10);
    const monthIndex = KYRGYZ_MONTHS.indexOf(monthStr);
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day);
    }
  }
  
  match = dateStr.match(/(\d+)\s+([а-яА-Я]+)\s+(\d{4})/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase();
    const year = parseInt(match[3], 10);
    const monthIndex = RUSSIAN_MONTHS.indexOf(monthStr);
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day);
    }
  }
  
  return null;
}

function getClosestOrder(orders: Order[], schoolOrders: SchoolOrder[], adsOrders: AdsOrder[], designOrders: DesignOrder[]) {
  const all = [
    ...(orders || []).filter(o => o.status !== 'Даяр').map(o => ({ ...o, type: 'wedding', operator: o.operator || 'Санжар' })),
    ...(schoolOrders || []).filter(o => o.status !== 'Даяр').map(o => ({ ...o, type: 'school', operator: 'Санжар' })),
    ...(adsOrders || []).filter(o => o.status !== 'Даяр').map(o => ({ ...o, type: 'ads', operator: 'Санжар' })),
    ...(designOrders || []).filter(o => o.status !== 'Даяр').map(o => ({ ...o, type: 'design', operator: 'Санжар' }))
  ];
  
  const now = new Date();
  now.setHours(0,0,0,0);
  
  let closest = null;
  let minDiff = Infinity;
  
  for (const o of all) {
    const d = parseDateString(o.date);
    if (!d) continue;
    
    const diff = d.getTime() - now.getTime();
    if (diff >= 0 && diff < minDiff) {
      minDiff = diff;
      closest = o;
    }
  }
  
  if (!closest && all.length > 0) {
    all.sort((a, b) => {
      const da = parseDateString(a.date);
      const db = parseDateString(b.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.getTime() - da.getTime();
    });
    closest = all[0];
  }
  
  return closest;
}

const Dashboard = ({ onNavigate, orders, schoolOrders, adsOrders, designOrders, onSelectOrder, isLightMode, setIsLightMode }: { onNavigate: (page: Page) => void, orders: Order[], schoolOrders: SchoolOrder[], adsOrders: AdsOrder[], designOrders: DesignOrder[], onSelectOrder: (id: number) => void, isLightMode: boolean, setIsLightMode: (val: boolean) => void, key?: string }) => {
  const latestOrder = getClosestOrder(orders, schoolOrders, adsOrders, designOrders);
  const totalWeddingSum = orders.reduce((sum, order) => sum + parseAmount(order.deposit), 0);
  const totalSchoolSum = schoolOrders.reduce((sum, order) => sum + parseAmount(order.price), 0);
  const totalAdsSum = adsOrders.reduce((sum, order) => sum + parseAmount(order.price), 0);
  const totalDesignSum = designOrders.reduce((sum, order) => sum + parseAmount(order.price), 0);
  const totalSum = totalWeddingSum + totalSchoolSum + totalAdsSum + totalDesignSum;

  return (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8"
  >
    {/* Header */}
    <header className="flex items-center justify-between border-b border-white/10 py-4 md:py-6 mb-6 md:mb-8">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="bg-[#08c4e5] p-1.5 md:p-2 rounded-lg shadow-sm">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
          </svg>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">Pixe1.media</h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-1.5 md:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Sparkles size={18} className="md:w-5 md:h-5" />
          <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">AI Chat</span>
        </button>
        <button className="p-1.5 md:p-2 rounded-lg bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer">
          <Bell size={18} className="md:w-5 md:h-5" />
        </button>
        <button className="p-1.5 md:p-2 rounded-lg bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer">
          <Settings size={18} className="md:w-5 md:h-5" />
        </button>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 overflow-hidden border border-white/20">
          <img 
            className="w-full h-full object-cover" 
            src="https://picsum.photos/seed/user123/100/100" 
            alt="User profile"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>

    {/* Hero Section: Current Order */}
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#08c4e5] animate-pulse"></span>
            Учурдагы буйрутма
          </h3>
        </div>
        <div className="scale-90 md:scale-100 origin-right">
          <LiveClock />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rotating-border-container shadow-2xl hover:shadow-blue-900/40 transition-all duration-500"
      >
        <div className="rotating-border-content bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-3 md:p-8">
          <div className="flex flex-col gap-3 md:gap-6">
            {/* Top Row: Shrunk Video + Title/Histogram */}
            <div className="flex flex-row gap-3 md:gap-6 items-stretch">
              <div className="w-20 md:w-48 rounded-xl md:rounded-2xl overflow-hidden relative group rotating-border-red flex-shrink-0">
                <VideoPlayer />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2 md:mb-4">
                  <div className="flex flex-col gap-1 md:gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-slate-900 rounded-lg shadow-sm border border-white/10">
                        <CalendarIcon size={10} className="text-[#08c4e5] md:w-[14px] md:h-[14px]" />
                      </div>
                      <p className="text-[7px] md:text-[10px] font-bold text-[#08c4e5] uppercase tracking-[0.2em]">Өндүрүш баскычы</p>
                    </div>
                    <h4 className="text-base md:text-4xl font-black text-white leading-tight tracking-tight truncate">
                      {latestOrder ? latestOrder.customerName.toUpperCase() : 'АКЫРКЫ ЗАКАЗ'}
                    </h4>
                    <p className="text-[7px] md:text-slate-300 font-medium flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                      {latestOrder ? `${latestOrder.date} • ${latestOrder.type}` : '12-март • Премиум'}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 md:px-5 py-1 md:py-2 rounded-full text-[6px] md:text-[10px] font-black bg-slate-900 text-[#08c4e5] border border-white/10 shadow-sm uppercase tracking-widest">
                    {latestOrder ? latestOrder.status : 'Монтаж'}
                  </span>
                </div>
                
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-between w-full mb-1 md:mb-1.5">
                    <p className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Заказдардын бөлүштүрүлүшү</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightMode(!isLightMode);
                      }}
                      className="p-1.5 md:p-2.5 rounded-full bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-sm"
                      title={isLightMode ? "Караңгы режим" : "Жарык режим"}
                    >
                      {isLightMode ? <Moon size={14} className="md:w-5 md:h-5" /> : <Sun size={14} className="md:w-5 md:h-5" />}
                    </button>
                  </div>
                  <div className="w-full scale-[0.5] md:scale-100 origin-left">
                    <OrderHistogram />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Operator/Next Order/Buttons Card */}
            <div className="rotating-border-container-white shadow-2xl hover:shadow-white/10 transition-all duration-500">
              <div className="rotating-border-content-white p-3 md:p-8 bg-slate-900/40 backdrop-blur-md">
                <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-3 md:gap-8">
                <div className="space-y-1.5 md:space-y-4">
                  <div className="flex flex-col">
                    <span className="text-[6px] md:text-[10px] font-black text-[#08c4e5] uppercase tracking-[0.2em] mb-1 md:mb-4">Учурдагы буйрутма</span>
                    <div className="flex items-center gap-1.5 md:gap-3">
                      <div className="w-5 h-5 md:w-10 md:h-10 rounded-full bg-slate-800 overflow-hidden ring-1 md:ring-4 ring-slate-700 shadow-md">
                        <img 
                          className="w-full h-full object-cover" 
                          src={latestOrder && OPERATOR_PHOTOS[latestOrder.operator] ? OPERATOR_PHOTOS[latestOrder.operator] : OPERATOR_PHOTOS['Санжар']} 
                          alt={`Operator ${latestOrder ? latestOrder.operator : 'Sanjar'}`}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[5px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">ОПЕРАТОР</p>
                        <span className="text-[8px] md:text-sm font-black text-white">{latestOrder ? latestOrder.operator.toUpperCase() : 'САНЖАР'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center border-l border-white/10 pl-3 md:pl-8 lg:border-y-0 lg:border-x lg:py-0 lg:px-8">
                  <p className="text-[6px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-3">КИЙИНКИ ЗАКАЗ</p>
                  <div className="flex items-center gap-1.5 md:gap-3 text-[8px] md:text-sm font-bold text-slate-200">
                    <div className="p-1 bg-slate-800 rounded-lg">
                      <CalendarIcon size={8} className="text-slate-400 md:w-4 md:h-4" />
                    </div>
                    <span className="tracking-tight">{latestOrder ? (parseDateString(latestOrder.date) ? `${parseDateString(latestOrder.date)!.getDate()}-${KYRGYZ_MONTHS[parseDateString(latestOrder.date)!.getMonth()]}` : latestOrder.date) : 'Жок'}</span>
                  </div>
                </div>

                <div className="col-span-2 lg:flex-1 flex flex-row items-center justify-center lg:justify-end gap-2 md:gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('orders_list')}
                    className="flex-1 lg:flex-none px-2 py-2 md:px-6 md:py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-lg md:rounded-2xl transition-all border border-white/10 text-[6px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <FileText size={10} className="text-[#08c4e5] md:w-4 md:h-4" />
                    Заказдар
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (latestOrder) {
                        onSelectOrder(latestOrder.id);
                      } else {
                        onSelectOrder(-1);
                      }
                    }}
                    className="flex-1 lg:flex-none px-2 py-2 md:px-8 md:py-4 bg-[#08c4e5] hover:bg-[#07b3d1] text-white font-black rounded-lg md:rounded-2xl transition-all shadow-xl shadow-cyan-500/30 text-[6px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Play size={10} fill="currentColor" className="md:w-4 md:h-4" />
                    Инфо заказа
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </motion.div>
    </section>

    {/* Navigation: Grid Modules */}
    <section className="pb-16">
      <h3 className="text-sm md:text-lg font-semibold text-white mb-4 md:mb-6">Башкаруу модулдары</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (module.id === 'wedding') onNavigate('wedding');
              if (module.id === 'school') onNavigate('school_list');
              if (module.id === 'ads') onNavigate('ads_list');
              if (module.id === 'design') onNavigate('design_list');
              if (module.id === 'reports') onNavigate('reports');
              if (module.id === 'calendar') onNavigate('calendar');
            }}
            className="relative flex flex-col items-center justify-center p-3 md:p-8 rounded-xl md:rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-[#08c4e5] transition-all group shadow-sm hover:shadow-md cursor-pointer"
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('trash');
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={12} />
            </button>
            <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-cyan-500/10 transition-colors">
              <module.icon className="w-4 h-4 md:w-8 md:h-8 text-slate-400 group-hover:text-[#08c4e5] transition-colors" />
            </div>
            <span className="text-[10px] md:text-sm font-bold text-slate-200">{module.label}</span>
            <span className={`text-[7px] md:text-[10px] font-medium mt-0.5 ${module.id === 'reports' ? 'text-emerald-500' : 'text-slate-500'}`}>
              {module.id === 'reports' ? `${totalSum.toLocaleString()} сом` : module.subLabel}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  </motion.div>
  );
};

const SchoolListPage = ({ onNavigate, schoolOrders, onDeleteOrder }: { onNavigate: (page: Page) => void, schoolOrders: SchoolOrder[], onDeleteOrder: (id: number) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
  >
    <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 md:py-8 mb-6 md:mb-8 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Мектептер</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('add_school_order')}
          className="w-full sm:w-auto px-6 py-3 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Заказ кошуу
        </motion.button>
      </div>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {schoolOrders.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
          <GraduationCap size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">Азырынча мектеп заказдары жок</p>
        </div>
      ) : (
        schoolOrders.map(order => (
          <motion.div 
            key={order.id}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm space-y-4 relative group"
          >
            <button 
              onClick={() => onDeleteOrder(order.id)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">{order.schoolName}</h4>
                <p className="text-sm text-[#08c4e5] font-bold">{order.className}-класс</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {order.status}
              </span>
            </div>
            
            <div className="space-y-3 p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Винетка:</span>
                <span className="text-slate-200 font-bold">{order.vignetteType}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Баасы:</span>
                <span className="text-emerald-500 font-bold">{order.price}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Староста:</span>
                <span className="text-slate-200 font-bold">{order.monitorPhone}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Дата:</span>
                <span className="text-slate-200 font-bold">{order.date}</span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

const AddSchoolOrderPage = ({ onNavigate, onAddOrder }: { onNavigate: (page: Page) => void, onAddOrder: (order: Omit<SchoolOrder, 'id'>) => void, key?: string }) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    className: '',
    vignetteType: '',
    price: '',
    monitorPhone: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      status: 'Күтүүдө'
    });
    onNavigate('school_list');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[600px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('school_list')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <h2 className="text-xl md:text-2xl font-bold text-white">Мектеп заказын кошуу</h2>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl space-y-5 md:space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Мектептин аты</label>
          <input 
            required
            type="text" 
            placeholder="Мисалы: №1 орто мектеп"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.schoolName}
            onChange={e => setFormData({...formData, schoolName: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Канчанчы класс</label>
            <input 
              required
              type="text" 
              placeholder="Мисалы: 11-Б"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.className}
              onChange={e => setFormData({...formData, className: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Дата</label>
            <input 
              required
              type="date" 
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Кандай винетка</label>
          <input 
            required
            type="text" 
            placeholder="Мисалы: Премиум 3D"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.vignetteType}
            onChange={e => setFormData({...formData, vignetteType: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ценасы</label>
            <input 
              required
              type="text" 
              placeholder="Мисалы: 2500 сом"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Старостанын тел номери</label>
            <input 
              required
              type="tel" 
              placeholder="+996 700 000 000"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.monitorPhone}
              onChange={e => setFormData({...formData, monitorPhone: e.target.value})}
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 md:py-5 bg-[#08c4e5] text-white font-black rounded-2xl shadow-lg shadow-cyan-200/50 uppercase tracking-widest text-[10px] md:text-xs transition-all"
        >
          Заказды сактоо
        </motion.button>
      </form>
    </motion.div>
  );
};

const TrashPage = ({ 
  onNavigate, 
  deletedOrders, 
  deletedSchoolOrders,
  onRestoreOrder,
  onRestoreSchoolOrder
}: { 
  onNavigate: (page: Page) => void, 
  deletedOrders: Order[],
  deletedSchoolOrders: SchoolOrder[],
  onRestoreOrder: (id: number) => void,
  onRestoreSchoolOrder: (id: number) => void,
  key?: string
}) => {
  const allDeleted = [
    ...deletedOrders.map(o => ({ ...o, itemType: 'order' as const })),
    ...deletedSchoolOrders.map(o => ({ ...o, itemType: 'school' as const }))
  ].sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));

  const getRemainingTime = (deletedAt?: number) => {
    if (!deletedAt) return '';
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const remaining = threeDaysInMs - (Date.now() - deletedAt);
    if (remaining <= 0) return 'Мөөнөтү бүттү';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} күн калды`;
    return `${hours} саат калды`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-[800px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('dashboard')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Корзина</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Өчүрүлгөн заказдар 3 күн сакталат</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
          <Trash2 size={24} />
        </div>
      </header>

      <div className="space-y-4">
        {allDeleted.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
            <Trash2 size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-slate-500 font-medium">Корзина бош</p>
          </div>
        ) : (
          allDeleted.map((item) => (
            <motion.div 
              key={`${item.itemType}-${item.id}`}
              layout
              className="bg-slate-900/40 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.itemType === 'school' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {item.itemType === 'school' ? <GraduationCap size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm md:text-base">
                    {'schoolName' in item ? item.schoolName : item.customerName}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {item.itemType === 'school' ? 'Мектеп' : 'Жалпы'}
                    </span>
                    <span className="text-[10px] text-red-400/80 font-bold flex items-center gap-1">
                      <Clock size={10} />
                      {getRemainingTime(item.deletedAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => item.itemType === 'school' ? onRestoreSchoolOrder(item.id) : onRestoreOrder(item.id)}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl border border-emerald-500/20 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Калыбына келтирүү
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const WeddingPage = ({ onNavigate, orders, onSelectOrder, onUpdateOrderStatus }: { onNavigate: (page: Page) => void, orders: Order[], onSelectOrder: (id: number) => void, onUpdateOrderStatus: (id: number, status: string) => void, key?: string }) => {
  const activeOrders = orders.filter(o => o.status !== 'Даяр');
  const readyOrders = orders.filter(o => o.status === 'Даяр');

  return (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
  >
    {/* Header */}
    <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 md:py-8 mb-6 md:mb-8 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Той</h2>
          <p className="text-sm md:text-slate-400 font-medium">Үйлөнүү үлпөтүн башкаруу</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('add_order')}
          className="w-full sm:w-auto px-6 py-3 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={20} />
          Заказ кошуу
        </motion.button>
      </div>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Active Orders Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Clock className="text-[#08c4e5]" size={24} />
            Заказдар
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activeOrders.length} активдүү</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {activeOrders.map((order) => (
            <motion.div 
              key={order.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelectOrder(order.id)}
              className="bg-slate-900/40 backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-white/10 shadow-sm flex flex-col gap-2 md:gap-3 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center text-[#08c4e5] shrink-0">
                  {OPERATOR_PHOTOS[order.operator] ? (
                    <img 
                      src={OPERATOR_PHOTOS[order.operator]} 
                      alt={order.operator}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={16} className="md:w-5 md:h-5" />
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-full text-[6px] md:text-[8px] font-bold uppercase tracking-wider text-center ${
                    order.status === 'Монтаж' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    order.status === 'Тартуу' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {order.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateOrderStatus(order.id, 'Даяр');
                    }}
                    className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-[6px] md:text-[8px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 size={10} />
                    Даяр
                  </button>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-[11px] md:text-sm leading-tight mb-0.5 md:mb-1 line-clamp-2">{order.customerName}</h4>
                <p className="text-[8px] md:text-[10px] text-slate-400 font-medium truncate">{order.date}</p>
                <p className="text-[8px] md:text-[10px] text-[#08c4e5] font-bold truncate mt-0.5">{order.type}</p>
              </div>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={14} className="text-[#08c4e5]" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ready Orders Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={24} />
            Даяр заказдар
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{readyOrders.length} аяктады</span>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {readyOrders.map((order) => (
            <motion.div 
              key={order.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelectOrder(order.id)}
              className="bg-slate-900/40 backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-white/10 shadow-sm flex flex-col gap-2 md:gap-3 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500/10 overflow-hidden border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  {OPERATOR_PHOTOS[order.operator] ? (
                    <img 
                      src={OPERATOR_PHOTOS[order.operator]} 
                      alt={order.operator}
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <CheckCircle2 size={16} className="md:w-5 md:h-5" />
                  )}
                </div>
                <span className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-full text-[6px] md:text-[8px] font-bold uppercase tracking-wider text-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {order.status}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-[11px] md:text-sm leading-tight mb-0.5 md:mb-1 line-clamp-2">{order.customerName}</h4>
                <p className="text-[8px] md:text-[10px] text-slate-400 font-medium truncate">{order.date}</p>
                <p className="text-[8px] md:text-[10px] text-emerald-500 font-bold truncate mt-0.5">{order.type}</p>
              </div>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={14} className="text-emerald-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  </motion.div>
  );
};

const ProjectDetailsPage = ({ onNavigate, order, previousPage = 'dashboard' }: { onNavigate: (page: Page) => void, order: any | null, previousPage?: Page, key?: string }) => {
  const [notes, setNotes] = useState<{id: number, text: string, time: string}[]>([]);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      text: 'Жаңы эскертүү:',
      time: '12:00'
    };
    setNotes([...notes, newNote]);
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const updateNote = (id: number, field: 'text' | 'time', value: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[550px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
    >
      {/* Header */}
      <header className="flex items-center justify-between py-6 md:py-8 mb-4 md:mb-6">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(previousPage)}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </motion.button>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Заказ маалыматы</h2>
        </div>
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={18} className="md:w-5 md:h-5" />
        </button>
      </header>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Who is getting married */}
          <div className="text-center space-y-1.5 md:space-y-2">
            <p className="text-[7px] md:text-[8px] font-bold text-[#08c4e5] uppercase tracking-[0.2em]">{order && order.schoolName ? 'Мектеп / Класс' : 'Кардар'}</p>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{order ? (order.customerName || `${order.schoolName} - ${order.className}`) : 'Азамат & Айпери'}</h1>
            <div className="w-6 md:w-8 h-1 bg-cyan-500/20 mx-auto rounded-full"></div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/10">
                {order ? (order.type || order.businessType || order.designType || 'Мектеп') : 'Премиум'}
              </span>
              <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {order ? order.status : 'Күтүүдө'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {/* When */}
            <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-900 text-[#08c4e5] shadow-sm mb-1.5 md:mb-2">
                <CalendarIcon size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">ДАТАСЫ</p>
              <p className="text-xs md:text-sm font-bold text-slate-200">{order ? order.date : '12-март, 2026'}</p>
            </div>

            {/* Where */}
            <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-900 text-[#08c4e5] shadow-sm mb-1.5 md:mb-2">
                <MapPin size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">АДРЕС / ЛОКАЦИЯ</p>
              <p className="text-xs md:text-sm font-bold text-slate-200">{order ? (order.address || order.details || order.vignetteType || order.notes || 'Жок') : '"Ала-Тоо" рестораны'}</p>
            </div>

            {/* Phone */}
            <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-900 text-[#08c4e5] shadow-sm mb-1.5 md:mb-2">
                <Phone size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">ТЕЛЕФОН</p>
              <p className="text-xs md:text-sm font-bold text-slate-200">{order ? (order.phone || order.monitorPhone || 'Жок') : '+996 700 000 000'}</p>
            </div>

            {/* Deposit */}
            <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-900 text-[#08c4e5] shadow-sm mb-1.5 md:mb-2">
                <Banknote size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">ЗАДАТОК / БААСЫ</p>
              <p className="text-xs md:text-sm font-bold text-emerald-500">{order ? (order.deposit || order.price || '0') : '0'} сом</p>
            </div>
            
            {/* Operator */}
            <div className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 col-span-2">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-900 text-[#08c4e5] shadow-sm mb-1.5 md:mb-2">
                <User size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">ОПЕРАТОР</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  <img 
                    src={order && OPERATOR_PHOTOS[order.operator] ? OPERATOR_PHOTOS[order.operator] : OPERATOR_PHOTOS['Санжар']} 
                    alt={order ? (order.operator || 'Operator') : 'Operator'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-200">{order ? (order.operator || 'N/A') : 'Санжар'}</p>
              </div>
            </div>
          </div>

          {/* Time Reminders */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Убакыт жана Эскертүүлөр</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addNote}
                className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-cyan-500/10 text-[#08c4e5] text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
              >
                <Plus size={10} />
                Кошуу
              </motion.button>
            </div>
            
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {notes.map((note) => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="p-1.5 rounded-full bg-slate-900 text-[#08c4e5] shadow-sm shrink-0">
                        <Clock size={12} />
                      </div>
                      <input 
                        type="text"
                        value={note.text}
                        onChange={(e) => updateNote(note.id, 'text', e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] md:text-xs font-bold text-slate-300 w-full focus:text-white transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                      <input 
                        type="text"
                        value={note.time}
                        onChange={(e) => updateNote(note.id, 'time', e.target.value)}
                        className="bg-slate-900/50 px-2 py-1 rounded-lg border border-white/5 text-xs font-black text-[#08c4e5] w-16 text-center outline-none focus:border-cyan-500/50 transition-all"
                      />
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Notice */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-slate-600">
            <Info size={12} />
            <p className="text-[9px] font-medium uppercase tracking-wider">Эскертүүлөрдү каалагандай өзгөртө аласыз</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AddOrderPage = ({ onNavigate, onAddOrder }: { onNavigate: (page: Page) => void, onAddOrder: (order: Omit<Order, 'id'>) => void, key?: string }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    date: '',
    details: '',
    phone: '',
    address: '',
    deposit: '',
    operator: 'Санжар',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      status: 'Күтүүдө',
      type: 'Стандарт'
    });
    onNavigate('orders_list');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[600px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-4 md:gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('wedding')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <h2 className="text-xl md:text-2xl font-bold text-white">Жаңы заказ кошуу</h2>
        </div>
        <button 
          type="button"
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl space-y-5 md:space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Заказчынын ФИОсу</label>
          <input 
            required
            type="text" 
            placeholder="Мисалы: Азамат Кадыров"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.customerName}
            onChange={e => setFormData({...formData, customerName: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Дата</label>
            <input 
              required
              type="date" 
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Телефон номер</label>
            <input 
              required
              type="tel" 
              placeholder="+996 700 000 000"
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Адрес</label>
          <input 
            type="text" 
            placeholder="Мисалы: Бишкек ш., Чүй пр. 123"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Эмне заказ (чоо-жайы)</label>
          <textarea 
            required
            placeholder="Заказдын мазмуну..."
            rows={3}
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm resize-none text-white placeholder:text-slate-600"
            value={formData.details}
            onChange={e => setFormData({...formData, details: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Задаток (сом)</label>
          <input 
            required
            type="number" 
            placeholder="5000"
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white placeholder:text-slate-600"
            value={formData.deposit}
            onChange={e => setFormData({...formData, deposit: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Оператор</label>
          <select 
            required
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#08c4e5] focus:border-transparent outline-none transition-all font-medium text-sm text-white"
            value={formData.operator}
            onChange={e => setFormData({...formData, operator: e.target.value})}
          >
            <option value="Санжар" className="bg-slate-900">Санжар</option>
            <option value="Нурболот" className="bg-slate-900">Нурболот</option>
          </select>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 md:py-5 bg-[#08c4e5] text-white font-black rounded-2xl shadow-lg shadow-cyan-200/50 uppercase tracking-widest text-[10px] md:text-xs transition-all"
        >
          Заказды сактоо
        </motion.button>
      </form>
    </motion.div>
  );
};

const DesignListPage = ({ onNavigate, designOrders, onDeleteOrder }: { onNavigate: (page: Page) => void, designOrders: DesignOrder[], onDeleteOrder: (id: number) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
  >
    <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 md:py-8 mb-6 md:mb-8 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Дизайн</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('add_design_order')}
          className="w-full sm:w-auto px-6 py-3 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Жаңы заказ
        </motion.button>
      </div>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {designOrders.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
          <Palette size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">Азырынча дизайн заказдары жок</p>
        </div>
      ) : (
        designOrders.map(order => (
          <motion.div 
            key={order.id}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm space-y-4 relative group"
          >
            <button 
              onClick={() => onDeleteOrder(order.id)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-white text-lg">{order.customerName}</h4>
                <p className="text-sm text-slate-500 font-medium">{order.date}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {order.status}
              </span>
            </div>
            
            <div className="p-4 bg-white/5 rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Palette size={16} className="text-slate-500" />
                <span className="text-slate-300 font-medium">{order.designType}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText size={16} className="text-slate-500" />
                <span className="text-slate-300 font-medium">Размери: <span className="text-white">{order.size}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-slate-500" />
                <span className="text-slate-300 font-medium">Түрү: <span className="text-[#08c4e5]">{order.complexity}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-slate-500" />
                <span className="text-slate-300 font-medium">Баасы: <span className="text-emerald-500 font-bold">{order.price} сом</span></span>
              </div>
              {order.notes && (
                <div className="flex items-start gap-3 text-sm mt-2 pt-2 border-t border-white/5">
                  <span className="text-slate-400 italic">"{order.notes}"</span>
                </div>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

const AddDesignOrderPage = ({ onNavigate, onAddOrder }: { onNavigate: (page: Page) => void, onAddOrder: (order: Omit<DesignOrder, 'id'>) => void, key?: string }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    designType: '',
    size: '',
    complexity: 'Оңой (Стандарт)',
    price: '300',
    notes: '',
  });

  const handleComplexityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const complexity = e.target.value;
    setFormData(prev => ({
      ...prev,
      complexity,
      price: complexity === 'Оңой (Стандарт)' ? '300' : '500'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'Күтүүдө'
    });
    onNavigate('design_list');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[600px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('design_list')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Жаңы дизайн заказы</h2>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-sm space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Заказчиктин аты</label>
            <input 
              required
              type="text" 
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
              placeholder="Аты-жөнү"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Кандай дизайн</label>
            <input 
              required
              type="text" 
              value={formData.designType}
              onChange={e => setFormData({...formData, designType: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
              placeholder="Мисалы: Визитка, Баннер, Логотип"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Размери</label>
            <input 
              required
              type="text" 
              value={formData.size}
              onChange={e => setFormData({...formData, size: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
              placeholder="Мисалы: 1080x1080px, 2x3м"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Дизайндын түрү</label>
              <select 
                value={formData.complexity}
                onChange={handleComplexityChange}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors appearance-none"
              >
                <option value="Оңой (Стандарт)">Оңой (Стандарт)</option>
                <option value="Кыйын">Кыйын</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Баасы (сом)</label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
                placeholder={formData.complexity === 'Оңой (Стандарт)' ? '300' : '500-1000'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Эскертүү</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors min-h-[100px]"
              placeholder="Кошумча маалыматтар..."
            />
          </div>

        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Заказды сактоо
        </motion.button>
      </form>
    </motion.div>
  );
};

const AdsListPage = ({ onNavigate, adsOrders, onDeleteOrder }: { onNavigate: (page: Page) => void, adsOrders: AdsOrder[], onDeleteOrder: (id: number) => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
  >
    <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 md:py-8 mb-6 md:mb-8 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Жарнама</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('add_ads_order')}
          className="w-full sm:w-auto px-6 py-3 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Жаңы заказ
        </motion.button>
      </div>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {adsOrders.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
          <Megaphone size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium">Азырынча жарнама заказдары жок</p>
        </div>
      ) : (
        adsOrders.map(order => (
          <motion.div 
            key={order.id}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm space-y-4 relative group"
          >
            <button 
              onClick={() => onDeleteOrder(order.id)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-white text-lg">{order.businessType}</h4>
                <p className="text-sm text-slate-500 font-medium">{order.customerName}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {order.status}
              </span>
            </div>
            
            <div className="p-4 bg-white/5 rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon size={16} className="text-slate-500" />
                <span className="text-slate-300 font-medium">Датасы: <span className="text-white">{order.date}</span></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-slate-500" />
                <span className="text-slate-300 font-medium">{order.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-slate-500" />
                <span className="text-slate-300 font-medium">Баасы: <span className="text-emerald-500 font-bold">{order.price} сом</span></span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

const AddAdsOrderPage = ({ onNavigate, onAddOrder }: { onNavigate: (page: Page) => void, onAddOrder: (order: Omit<AdsOrder, 'id'>) => void, key?: string }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    businessType: 'Магазин',
    price: '',
    date: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      status: 'Күтүүдө'
    });
    onNavigate('ads_list');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[600px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('ads_list')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Жаңы жарнама заказы</h2>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-sm space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Заказчиктин аты</label>
            <input 
              required
              type="text" 
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
              placeholder="Аты-жөнү"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Түрү</label>
            <select 
              value={formData.businessType}
              onChange={e => setFormData({...formData, businessType: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors appearance-none"
            >
              <option value="Магазин">Магазин</option>
              <option value="Кафе">Кафе</option>
              <option value="Офис">Офис</option>
              <option value="Бизнес">Бизнес</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Датасы</label>
            <input 
              required
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Баасы (сом)</label>
            <input 
              required
              type="number" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
              placeholder="Мисалы: 5000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Номер заказчика</label>
            <input 
              required
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
              placeholder="+996 XXX XXX XXX"
            />
          </div>

        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 bg-[#08c4e5] text-white font-bold rounded-xl shadow-lg shadow-cyan-200/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Заказды сактоо
        </motion.button>
      </form>
    </motion.div>
  );
};

const OrdersListPage = ({ onNavigate, orders, schoolOrders, adsOrders, designOrders, onDeleteOrder, onDeleteSchoolOrder, onDeleteAdsOrder, onDeleteDesignOrder }: { onNavigate: (page: Page) => void, orders: Order[], schoolOrders: SchoolOrder[], adsOrders: AdsOrder[], designOrders: DesignOrder[], onDeleteOrder: (id: number) => void, onDeleteSchoolOrder: (id: number) => void, onDeleteAdsOrder: (id: number) => void, onDeleteDesignOrder: (id: number) => void, key?: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'wedding' | 'school' | 'design' | 'ads'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Күтүүдө' | 'Тартууда' | 'Монтажда' | 'Даяр' | 'Жокко чыккан'>('all');

  // Normalize statuses to match standard CRM statuses
  const normalizeStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('күтүү')) return 'Күтүүдө';
    if (s.includes('тартуу')) return 'Тартууда';
    if (s.includes('монтаж')) return 'Монтажда';
    if (s.includes('даяр')) return 'Даяр';
    if (s.includes('жокко')) return 'Жокко чыккан';
    return status;
  };

  const combinedOrders = [
    ...(orders || []).map(o => ({ 
      ...o, 
      category: 'wedding', 
      typeLabel: 'Той',
      title: o.customerName, 
      totalAmount: parseAmount(o.deposit) * 2, // Mocking total as 2x deposit for demo
      advance: parseAmount(o.deposit),
      serviceType: o.type,
      normalizedStatus: normalizeStatus(o.status),
      location: o.address || o.details,
      onDelete: () => onDeleteOrder(o.id) 
    })),
    ...(schoolOrders || []).map(o => ({ 
      ...o, 
      category: 'school', 
      typeLabel: 'Мектеп',
      title: o.schoolName, 
      totalAmount: parseAmount(o.price),
      advance: 0,
      serviceType: `${o.className}-класс, ${o.vignetteType}`,
      phone: o.monitorPhone, 
      operator: 'N/A', 
      normalizedStatus: normalizeStatus(o.status),
      location: o.schoolName,
      onDelete: () => onDeleteSchoolOrder(o.id) 
    })),
    ...(adsOrders || []).map(o => ({ 
      ...o, 
      category: 'ads', 
      typeLabel: 'Жарнама',
      title: o.customerName, 
      totalAmount: parseAmount(o.price),
      advance: 0,
      serviceType: o.businessType,
      operator: 'N/A', 
      normalizedStatus: normalizeStatus(o.status),
      location: '',
      onDelete: () => onDeleteAdsOrder(o.id) 
    })),
    ...(designOrders || []).map(o => ({ 
      ...o, 
      category: 'design', 
      typeLabel: 'Дизайн',
      title: o.customerName, 
      totalAmount: parseAmount(o.price),
      advance: 0,
      serviceType: `${o.designType} (${o.size})`,
      phone: o.notes, 
      operator: 'N/A', 
      normalizedStatus: normalizeStatus(o.status),
      location: '',
      onDelete: () => onDeleteDesignOrder(o.id) 
    }))
  ].sort((a, b) => {
    const da = parseDateString(a.date);
    const db = parseDateString(b.date);
    if (!da && !db) return b.id - a.id;
    if (!da) return 1;
    if (!db) return -1;
    return db.getTime() - da.getTime(); // Newest first
  });

  const filteredOrders = combinedOrders.filter(order => {
    const matchesSearch = 
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phone && order.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.serviceType && order.serviceType.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || order.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || order.normalizedStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalOrders = filteredOrders.length;
  const activeOrders = filteredOrders.filter(o => o.normalizedStatus !== 'Даяр' && o.normalizedStatus !== 'Жокко чыккан').length;
  const readyOrders = filteredOrders.filter(o => o.normalizedStatus === 'Даяр').length;
  const totalSum = filteredOrders.reduce((sum, o) => sum + parseAmount(o.totalAmount.toString()), 0);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Күтүүдө': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Тартууда': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Монтажда': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Даяр': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Жокко чыккан': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'wedding': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'school': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'design': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'ads': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'wedding': return <Heart size={14} />;
      case 'school': return <GraduationCap size={14} />;
      case 'design': return <Palette size={14} />;
      case 'ads': return <Megaphone size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="max-w-[1200px] mx-auto px-4 py-8 md:py-12"
  >
    <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('dashboard')}
          className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm hover:text-[#08c4e5] hover:border-[#08c4e5] transition-colors"
        >
          <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Бардык заказдар</h2>
          <p className="text-sm text-slate-400">Студиянын жалпы CRM базасы</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => (window as any).openAIChat?.()}
          className="p-2 md:p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#08c4e5] hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={20} className="md:w-6 md:h-6" />
        </button>
      </div>
    </header>

    {/* Summary Block */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
        <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Жалпы заказ</span>
        <span className="text-xl md:text-2xl font-black text-white">{totalOrders}</span>
      </div>
      <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
        <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Активдүү</span>
        <span className="text-xl md:text-2xl font-black text-[#08c4e5]">{activeOrders}</span>
      </div>
      <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
        <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Даяр</span>
        <span className="text-xl md:text-2xl font-black text-emerald-500">{readyOrders}</span>
      </div>
      <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-1">
        <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Жалпы сумма</span>
        <span className="text-xl md:text-2xl font-black text-amber-500">{totalSum.toLocaleString()} <span className="text-sm">сом</span></span>
      </div>
    </div>

    {/* Filters & Search */}
    <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 mb-6 flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Кардардын аты, телефон же кызмат боюнча издөө..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#08c4e5] transition-colors"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1"><Filter size={12}/> Категория:</span>
          {[
            { id: 'all', label: 'Баары' },
            { id: 'wedding', label: 'Той' },
            { id: 'school', label: 'Мектеп' },
            { id: 'design', label: 'Дизайн' },
            { id: 'ads', label: 'Жарнама' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                categoryFilter === cat.id 
                  ? 'bg-[#08c4e5]/20 text-[#08c4e5] border-[#08c4e5]/30' 
                  : 'bg-transparent text-slate-400 border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1"><Filter size={12}/> Статус:</span>
          {[
            { id: 'all', label: 'Баары' },
            { id: 'Күтүүдө', label: 'Күтүүдө' },
            { id: 'Тартууда', label: 'Тартууда' },
            { id: 'Монтажда', label: 'Монтажда' },
            { id: 'Даяр', label: 'Даяр' },
            { id: 'Жокко чыккан', label: 'Жокко чыккан' }
          ].map(stat => (
            <button
              key={stat.id}
              onClick={() => setStatusFilter(stat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                statusFilter === stat.id 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'bg-transparent text-slate-400 border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Orders List - 2 Column Layout for CRM */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {filteredOrders.length === 0 ? (
        <div className="col-span-1 md:col-span-2 py-12 md:py-20 text-center bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-white/10">
          <FileText size={32} className="mx-auto text-slate-500 mb-2 md:mb-4 md:w-12 md:h-12" />
          <p className="text-sm md:text-base text-slate-400 font-medium">Талаптарга жооп берген заказ табылган жок</p>
        </div>
      ) : (
        filteredOrders.map(order => (
          <motion.div 
            key={`${order.category}-${order.id}`}
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 shadow-sm relative group flex flex-col gap-4 transition-all hover:bg-slate-800/60"
          >
            <button 
              onClick={order.onDelete}
              className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 z-10"
              title="Өчүрүү"
            >
              <Trash2 size={16} />
            </button>

            {/* Top: Customer & Contact */}
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryColor(order.category)}`}>
                {getCategoryIcon(order.category)}
              </div>
              <div className="min-w-0 pr-8">
                <h4 className="font-bold text-white text-sm md:text-base truncate">{order.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Phone size={12} />
                  <span className="truncate">{order.phone || 'Көрсөтүлгөн эмес'}</span>
                </div>
              </div>
            </div>

            {/* Middle: Service Details */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(order.category)}`}>
                  {order.typeLabel}
                </span>
                <span className="text-sm font-bold text-slate-200 truncate">{order.serviceType}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={12} />
                  <span>{order.date}</span>
                </div>
                {order.location && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={12} />
                    <span className="truncate max-w-[120px]">{order.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Financials & Status */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-t border-white/5 pt-3">
              <div className="flex items-center gap-3 w-full justify-between sm:justify-start">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User size={12} />
                  <span>{order.operator}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.normalizedStatus)}`}>
                  {order.normalizedStatus}
                </span>
              </div>
              
              <div className="flex items-center gap-4 w-full justify-between sm:justify-end">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Аванс</span>
                  <span className="text-sm font-bold text-slate-300">{order.advance.toLocaleString()} с</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Жалпы сумма</span>
                  <span className="text-lg font-black text-emerald-500">{order.totalAmount.toLocaleString()} с</span>
                </div>
              </div>
            </div>
            
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
  );
};

const CalendarPage = ({ onNavigate, orders, schoolOrders }: { onNavigate: (page: Page) => void, orders: Order[], schoolOrders: SchoolOrder[], key?: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026 as default
  
  const orderDates = React.useMemo(() => {
    const dates = new Map<string, { wedding: boolean, school: boolean }>();
    const addDate = (dateStr: string, type: 'wedding' | 'school') => {
      const d = parseDateString(dateStr);
      if (d) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const existing = dates.get(key) || { wedding: false, school: false };
        existing[type] = true;
        dates.set(key, existing);
      }
    };
    orders.forEach(o => addDate(o.date, 'wedding'));
    schoolOrders.forEach(o => addDate(o.date, 'school'));
    return dates;
  }, [orders, schoolOrders]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-[800px] mx-auto px-4 py-8"
    >
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('dashboard')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 hover:text-[#08c4e5] hover:border-[#08c4e5] transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Календарь</h2>
        </div>
      </header>

      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш', 'Жш'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-xl bg-white/5 opacity-50"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
            const dayData = orderDates.get(dateKey);
            
            let bgClass = 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10';
            
            if (dayData) {
              if (dayData.wedding && dayData.school) {
                bgClass = 'bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]';
              } else if (dayData.wedding) {
                bgClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
              } else if (dayData.school) {
                bgClass = 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
              }
            }
            
            return (
              <motion.div 
                key={day}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold border transition-all cursor-pointer relative ${bgClass}`}
              >
                <span>{day}</span>
                {dayData && (
                  <div className="absolute bottom-1.5 flex gap-1">
                    {dayData.wedding && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    {dayData.school && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const ReportsPage = ({ onNavigate, orders, schoolOrders, adsOrders, designOrders }: { onNavigate: (page: Page) => void, orders: Order[], schoolOrders: SchoolOrder[], adsOrders: AdsOrder[], designOrders: DesignOrder[], key?: string }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'all' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filterByDate = (dateStr: string) => {
    if (timeRange === 'all') return true;
    const d = parseDateString(dateStr);
    if (!d) return false;
    const now = new Date();
    
    if (timeRange === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo && d <= now;
    }
    if (timeRange === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (timeRange === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    if (timeRange === 'custom') {
      const start = customStart ? new Date(customStart) : new Date(0);
      const end = customEnd ? new Date(customEnd) : new Date();
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return d >= start && d <= end;
    }
    return true;
  };

  const filteredWedding = (orders || []).filter(o => filterByDate(o.date));
  const filteredSchool = (schoolOrders || []).filter(o => filterByDate(o.date));
  const filteredAds = (adsOrders || []).filter(o => filterByDate(o.date));
  const filteredDesign = (designOrders || []).filter(o => filterByDate(o.date));

  const totalWeddingSum = filteredWedding.reduce((sum, order) => sum + parseAmount(order.deposit), 0);
  const totalSchoolSum = filteredSchool.reduce((sum, order) => sum + parseAmount(order.price), 0);
  const totalAdsSum = filteredAds.reduce((sum, order) => sum + parseAmount(order.price), 0);
  const totalDesignSum = filteredDesign.reduce((sum, order) => sum + parseAmount(order.price), 0);

  const totalRevenue = totalWeddingSum + totalSchoolSum + totalAdsSum + totalDesignSum;
  // Mock expenses as 20% of revenue for demonstration
  const totalExpenses = Math.round(totalRevenue * 0.2);
  const netProfit = totalRevenue - totalExpenses;
  
  const totalOrdersCount = filteredWedding.length + filteredSchool.length + filteredAds.length + filteredDesign.length;
  const averageCheck = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const reportItems = [
    { id: 'wedding', label: 'Той', sum: totalWeddingSum, count: filteredWedding.length, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', hex: '#ec4899' },
    { id: 'school', label: 'Мектеп', sum: totalSchoolSum, count: filteredSchool.length, icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hex: '#3b82f6' },
    { id: 'design', label: 'Дизайн', sum: totalDesignSum, count: filteredDesign.length, icon: Palette, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', hex: '#a855f7' },
    { id: 'ads', label: 'Рекламный ролик', sum: totalAdsSum, count: filteredAds.length, icon: Megaphone, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#f59e0b' },
  ];

  const pieData = reportItems.filter(item => item.sum > 0).map(item => ({
    name: item.label,
    value: item.sum,
    color: item.hex
  }));

  // Group by date for bar chart
  const revenueByDate = new Map<string, number>();
  const allFiltered = [
    ...filteredWedding.map(o => ({ date: o.date, amount: parseAmount(o.deposit) })),
    ...filteredSchool.map(o => ({ date: o.date, amount: parseAmount(o.price) })),
    ...filteredAds.map(o => ({ date: o.date, amount: parseAmount(o.price) })),
    ...filteredDesign.map(o => ({ date: o.date, amount: parseAmount(o.price) }))
  ];
  
  allFiltered.forEach(o => {
    const d = parseDateString(o.date);
    if (d) {
      const dateStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      revenueByDate.set(dateStr, (revenueByDate.get(dateStr) || 0) + o.amount);
    }
  });

  const barData = Array.from(revenueByDate.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => {
      const [da, ma] = a.date.split('.').map(Number);
      const [db, mb] = b.date.split('.').map(Number);
      if (ma !== mb) return ma - mb;
      return da - db;
    });

  // Top earning service
  const topService = [...reportItems].sort((a, b) => b.sum - a.sum)[0];

  // Latest orders
  const latestOrders = [
    ...filteredWedding.map(o => ({ ...o, typeLabel: 'Той' })),
    ...filteredSchool.map(o => ({ ...o, typeLabel: 'Мектеп' })),
    ...filteredAds.map(o => ({ ...o, typeLabel: 'Жарнама' })),
    ...filteredDesign.map(o => ({ ...o, typeLabel: 'Дизайн' }))
  ].sort((a, b) => {
    const da = parseDateString(a.date);
    const db = parseDateString(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.getTime() - da.getTime();
  }).slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-[1200px] mx-auto px-4 py-8 md:py-12"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('dashboard')}
            className="p-2 md:p-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-300 shadow-sm hover:text-[#08c4e5] hover:border-[#08c4e5] transition-colors"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Отчет</h2>
            <p className="text-sm text-slate-400">Студиянын каржылык аналитикасы</p>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/10">
          {[
            { id: 'today', label: 'Бүгүн' },
            { id: 'week', label: 'Апта' },
            { id: 'month', label: 'Ай' },
            { id: 'year', label: 'Жыл' },
            { id: 'all', label: 'Бардыгы' },
            { id: 'custom', label: 'Башка' }
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                timeRange === range.id 
                  ? 'bg-[#08c4e5] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      {timeRange === 'custom' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-4 mb-8 bg-slate-900/40 p-4 rounded-2xl border border-white/10"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Башталышы</label>
            <input 
              type="date" 
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#08c4e5]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Аягы</label>
            <input 
              type="date" 
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#08c4e5]"
            />
          </div>
        </motion.div>
      )}

      {/* Summary Block */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
        <div className="bg-slate-900/40 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Жалпы киреше</span>
          <span className="text-xl md:text-2xl font-black text-emerald-500">{totalRevenue.toLocaleString()} <span className="text-sm">сом</span></span>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Жалпы чыгаша</span>
          <span className="text-xl md:text-2xl font-black text-rose-500">{totalExpenses.toLocaleString()} <span className="text-sm">сом</span></span>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Таза пайда</span>
          <span className="text-xl md:text-2xl font-black text-[#08c4e5]">{netProfit.toLocaleString()} <span className="text-sm">сом</span></span>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Заказ саны</span>
          <span className="text-xl md:text-2xl font-black text-white">{totalOrdersCount}</span>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 flex flex-col gap-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Орточо чек</span>
          <span className="text-xl md:text-2xl font-black text-amber-500">{averageCheck.toLocaleString()} <span className="text-sm">сом</span></span>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reportItems.map((item, index) => {
          const percentage = totalRevenue > 0 ? Math.round((item.sum / totalRevenue) * 100) : 0;
          const isZero = item.sum === 0;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`backdrop-blur-md p-5 rounded-3xl border flex flex-col gap-4 relative overflow-hidden ${
                isZero ? 'bg-slate-900/20 border-white/5 opacity-60' : `bg-slate-900/40 ${item.border}`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${isZero ? 'bg-slate-800 text-slate-500' : `${item.bg} ${item.color}`} flex items-center justify-center`}>
                    <item.icon size={20} />
                  </div>
                  <h3 className={`text-base font-bold ${isZero ? 'text-slate-500' : 'text-white'}`}>{item.label}</h3>
                </div>
                {!isZero && (
                  <span className={`text-xs font-bold ${item.color} bg-white/5 px-2 py-1 rounded-lg`}>
                    {percentage}%
                  </span>
                )}
              </div>
              
              {isZero ? (
                <div className="flex-1 flex items-center justify-center py-4">
                  <span className="text-sm font-medium text-slate-500">Азырынча заказ жок</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-white">{item.sum.toLocaleString()} <span className="text-sm text-slate-400 font-medium">сом</span></span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400 font-medium">{item.count} заказ</span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ArrowUpRight size={10} /> +12%
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Киреше динамикасы</h3>
          <div className="h-[250px] w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <RechartsTooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#08c4e5', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="amount" fill="#08c4e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Маалымат жок</div>
            )}
          </div>
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Бөлүштүрүү</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Маалымат жок</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Эң көп киреше алып келген кызмат</h3>
            {topService && topService.sum > 0 ? (
              <div className="mt-4 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${topService.bg} ${topService.color} flex items-center justify-center`}>
                  <topService.icon size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{topService.label}</h4>
                  <p className="text-sm text-slate-400">{topService.sum.toLocaleString()} сом</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-4">Азырынча маалымат жок</p>
            )}
          </div>
          
          <div className="mt-8 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-white/10">
              <Download size={14} /> PDF
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-emerald-500/20">
              <Download size={14} /> Excel
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Акыркы заказдар</h3>
            <button onClick={() => onNavigate('orders_list')} className="text-xs text-[#08c4e5] hover:text-white transition-colors font-bold uppercase tracking-wider">
              Баарын көрүү
            </button>
          </div>
          
          <div className="space-y-3">
            {latestOrders.length > 0 ? latestOrders.map((order, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    {order.typeLabel === 'Той' ? <Heart size={14} /> : 
                     order.typeLabel === 'Мектеп' ? <GraduationCap size={14} /> : 
                     order.typeLabel === 'Дизайн' ? <Palette size={14} /> : <Megaphone size={14} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[150px] md:max-w-[200px]">{(order as any).customerName || (order as any).schoolName || (order as any).businessType}</h4>
                    <p className="text-[10px] text-slate-400">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-500">{parseAmount((order as any).deposit || (order as any).price).toLocaleString()} сом</span>
                  <p className="text-[10px] text-slate-400">{order.typeLabel}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-slate-500 text-sm">Азырынча заказ жок</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [previousPage, setPreviousPage] = useState<Page>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [schoolOrders, setSchoolOrders] = useState<SchoolOrder[]>([]);
  const [adsOrders, setAdsOrders] = useState<AdsOrder[]>([]);
  const [designOrders, setDesignOrders] = useState<DesignOrder[]>([]);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    (window as any).openAIChat = () => setIsAIChatOpen(true);
    
    // Fetch data from API
    const fetchData = async () => {
      try {
        const healthRes = await fetch('/api/health');
        const health = await healthRes.json();
        setDbConnected(health.dbConnected);

        if (health.dbConnected) {
          const [oRes, sRes, aRes, dRes] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/school-orders'),
            fetch('/api/ads-orders'),
            fetch('/api/design-orders')
          ]);
          
          if (oRes.ok) setOrders(await oRes.json());
          if (sRes.ok) setSchoolOrders(await sRes.json());
          if (aRes.ok) setAdsOrders(await aRes.json());
          if (dRes.ok) setDesignOrders(await dRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setDbConnected(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [isLightMode]);

  const handleAddOrder = async (newOrder: Omit<Order, 'id'>) => {
    if (dbConnected) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          const savedOrder = await res.json();
          setOrders(prev => [savedOrder, ...prev]);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback to local state
    const orderWithId = { ...newOrder, id: Date.now() };
    setOrders(prev => [orderWithId, ...prev]);
  };

  const handleAddSchoolOrder = async (newOrder: Omit<SchoolOrder, 'id'>) => {
    if (dbConnected) {
      try {
        const res = await fetch('/api/school-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          const savedOrder = await res.json();
          setSchoolOrders(prev => [savedOrder, ...prev]);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const orderWithId = { ...newOrder, id: Date.now() };
    setSchoolOrders(prev => [orderWithId, ...prev]);
  };

  const handleAddAdsOrder = async (newOrder: Omit<AdsOrder, 'id'>) => {
    if (dbConnected) {
      try {
        const res = await fetch('/api/ads-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          const savedOrder = await res.json();
          setAdsOrders(prev => [savedOrder, ...prev]);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const orderWithId = { ...newOrder, id: Date.now() };
    setAdsOrders(prev => [orderWithId, ...prev]);
  };

  const handleAddDesignOrder = async (newOrder: Omit<DesignOrder, 'id'>) => {
    if (dbConnected) {
      try {
        const res = await fetch('/api/design-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          const savedOrder = await res.json();
          setDesignOrders(prev => [savedOrder, ...prev]);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const orderWithId = { ...newOrder, id: Date.now() };
    setDesignOrders(prev => [orderWithId, ...prev]);
  };

  const handleDeleteOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: Date.now() } : o));
  };

  const handleDeleteSchoolOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/school-orders/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
    }
    setSchoolOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: Date.now() } : o));
  };

  const handleDeleteAdsOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/ads-orders/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
    }
    setAdsOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: Date.now() } : o));
  };

  const handleDeleteDesignOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/design-orders/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
    }
    setDesignOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: Date.now() } : o));
  };

  const handleRestoreOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/orders/${id}/restore`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: undefined } : o));
  };

  const handleRestoreSchoolOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/school-orders/${id}/restore`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    }
    setSchoolOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: undefined } : o));
  };

  const handleRestoreAdsOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/ads-orders/${id}/restore`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    }
    setAdsOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: undefined } : o));
  };

  const handleRestoreDesignOrder = async (id: number) => {
    if (dbConnected) {
      try {
        await fetch(`/api/design-orders/${id}/restore`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    }
    setDesignOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: undefined } : o));
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    if (dbConnected) {
      try {
        await fetch(`/api/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch (e) {
        console.error(e);
      }
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const activeOrders = orders.filter(o => !o.deletedAt);
  const deletedOrders = orders.filter(o => !!o.deletedAt);
  const activeSchoolOrders = schoolOrders.filter(o => !o.deletedAt);
  const deletedSchoolOrders = schoolOrders.filter(o => !!o.deletedAt);
  const activeAdsOrders = adsOrders.filter(o => !o.deletedAt);
  const deletedAdsOrders = adsOrders.filter(o => !!o.deletedAt);
  const activeDesignOrders = designOrders.filter(o => !o.deletedAt);
  const deletedDesignOrders = designOrders.filter(o => !!o.deletedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f1d] to-[#020617] text-white font-sans selection:bg-cyan-500/30">
      {dbConnected === false && (
        <div className="bg-red-500/20 border-b border-red-500/30 text-red-200 px-4 py-3 text-sm text-center">
          <span className="font-bold">Маалымат базасы туташкан жок!</span> PostgreSQL (Railway) базасын кошуу үчүн <code>DATABASE_URL</code> чөйрө өзгөрмөсүн (environment variable) орнотуңуз. Учурда маалыматтар убактылуу гана сакталат.
        </div>
      )}
      <AnimatePresence mode="wait">
        {currentPage === 'dashboard' ? (
          <Dashboard key="dashboard" onNavigate={setCurrentPage} orders={activeOrders} schoolOrders={activeSchoolOrders} adsOrders={activeAdsOrders} designOrders={activeDesignOrders} onSelectOrder={(id) => { setSelectedOrderId(id); setPreviousPage('dashboard'); setCurrentPage('project_details'); }} isLightMode={isLightMode} setIsLightMode={setIsLightMode} />
        ) : currentPage === 'wedding' ? (
          <WeddingPage key="wedding" onNavigate={setCurrentPage} orders={activeOrders} onSelectOrder={(id) => { setSelectedOrderId(id); setPreviousPage('wedding'); setCurrentPage('project_details'); }} onUpdateOrderStatus={handleUpdateOrderStatus} />
        ) : currentPage === 'school_list' ? (
          <SchoolListPage key="school_list" onNavigate={setCurrentPage} schoolOrders={activeSchoolOrders} onDeleteOrder={handleDeleteSchoolOrder} />
        ) : currentPage === 'reports' ? (
          <ReportsPage key="reports" onNavigate={setCurrentPage} orders={activeOrders} schoolOrders={activeSchoolOrders} adsOrders={activeAdsOrders} designOrders={activeDesignOrders} />
        ) : currentPage === 'calendar' ? (
          <CalendarPage key="calendar" onNavigate={setCurrentPage} orders={activeOrders} schoolOrders={activeSchoolOrders} />
        ) : currentPage === 'add_school_order' ? (
          <AddSchoolOrderPage key="add_school_order" onNavigate={setCurrentPage} onAddOrder={handleAddSchoolOrder} />
        ) : currentPage === 'add_order' ? (
          <AddOrderPage key="add_order" onNavigate={setCurrentPage} onAddOrder={handleAddOrder} />
        ) : currentPage === 'design_list' ? (
          <DesignListPage key="design_list" onNavigate={setCurrentPage} designOrders={activeDesignOrders} onDeleteOrder={handleDeleteDesignOrder} />
        ) : currentPage === 'add_design_order' ? (
          <AddDesignOrderPage key="add_design_order" onNavigate={setCurrentPage} onAddOrder={handleAddDesignOrder} />
        ) : currentPage === 'ads_list' ? (
          <AdsListPage key="ads_list" onNavigate={setCurrentPage} adsOrders={activeAdsOrders} onDeleteOrder={handleDeleteAdsOrder} />
        ) : currentPage === 'add_ads_order' ? (
          <AddAdsOrderPage key="add_ads_order" onNavigate={setCurrentPage} onAddOrder={handleAddAdsOrder} />
        ) : currentPage === 'orders_list' ? (
          <OrdersListPage 
            key="orders_list" 
            onNavigate={setCurrentPage} 
            orders={activeOrders} 
            schoolOrders={activeSchoolOrders}
            adsOrders={activeAdsOrders}
            designOrders={activeDesignOrders}
            onDeleteOrder={handleDeleteOrder} 
            onDeleteSchoolOrder={handleDeleteSchoolOrder}
            onDeleteAdsOrder={handleDeleteAdsOrder}
            onDeleteDesignOrder={handleDeleteDesignOrder}
          />
        ) : currentPage === 'trash' ? (
          <TrashPage 
            key="trash" 
            onNavigate={setCurrentPage} 
            deletedOrders={deletedOrders} 
            deletedSchoolOrders={deletedSchoolOrders}
            onRestoreOrder={handleRestoreOrder}
            onRestoreSchoolOrder={handleRestoreSchoolOrder}
          />
        ) : (
          <ProjectDetailsPage key="project_details" onNavigate={setCurrentPage} previousPage={previousPage} order={orders.find(o => o.id === selectedOrderId) || schoolOrders.find(o => o.id === selectedOrderId) || adsOrders.find(o => o.id === selectedOrderId) || designOrders.find(o => o.id === selectedOrderId) || null} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAIChatOpen && (
          <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer - Shared across pages */}
        <footer className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium text-slate-500">
          <p>© 2026 Pixe1.media студияны башкаруу системасы</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
              Система иштеп жатат
            </span>
            <button className="hover:text-[#08c4e5] transition-colors cursor-pointer">Купуялуулук саясаты</button>
            <button className="hover:text-[#08c4e5] transition-colors cursor-pointer">Колдоо</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
