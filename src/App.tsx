import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Leaf, LayoutDashboard, ScanLine, Sprout, Info, Github, TrendingUp, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageUpload from './components/ImageUpload';
import AnalysisResult from './components/AnalysisResult';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AnalysisResponse } from '@/src/types';
import { cn } from '@/src/lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'dashboard'>('scan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  const analyzeImage = async (base64: string) => {
    if (!base64) return;
    setIsAnalyzing(true);
    setResult(null);
    setCurrentImage(base64);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64.split(',')[1],
                },
              },
              {
                text: "Analyze this crop leaf image. Identify the crop, the disease (if any), severity level (Low, Medium, High), and provide detailed treatment recommendations including organic and chemical options if applicable. Return the result in JSON format.",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              crop_name: { type: Type.STRING },
              disease_name: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              treatment: { type: Type.STRING, description: "Markdown formatted treatment guide" },
            },
            required: ["crop_name", "disease_name", "severity", "treatment"],
          },
        },
      });

      const analysis = JSON.parse(response.text) as AnalysisResponse;
      setResult(analysis);

      // Save to database
      await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...analysis,
          image_url: base64
        }),
      });

    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try a clearer image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-stone-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Sprout size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-stone-900">AgroVision</h1>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Smart Farming AI</p>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-stone-100 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('scan')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  activeTab === 'scan' ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                )}
              >
                <ScanLine size={18} />
                Scan Crop
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  activeTab === 'dashboard' ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                )}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-stone-400 hover:text-stone-600 transition-colors">
                <Info size={20} />
              </button>
              <div className="h-8 w-px bg-stone-200" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-stone-900">Viswa</span>
                  <span className="text-[10px] text-stone-500 font-medium">{userEmail}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border border-emerald-200">
                  V
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>


      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border border-stone-200 rounded-full p-1.5 shadow-2xl flex gap-2">
        <button
          onClick={() => setActiveTab('scan')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all",
            activeTab === 'scan' ? "bg-emerald-600 text-white" : "text-stone-500"
          )}
        >
          <ScanLine size={18} />
          Scan
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all",
            activeTab === 'dashboard' ? "bg-emerald-600 text-white" : "text-stone-500"
          )}
        >
          <LayoutDashboard size={18} />
          Stats
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'scan' ? (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">Identify Crop Diseases Instantly</h2>
                <p className="text-lg text-stone-600">Upload a photo of your plant's leaf and our AI will diagnose the problem and suggest treatments.</p>
              </div>

              <ImageUpload onImageSelect={analyzeImage} isAnalyzing={isAnalyzing} />

              {result && <AnalysisResult result={result} />}
              
              {!result && !isAnalyzing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                  {[
                    { icon: <Sprout />, title: "Early Detection", desc: "Catch diseases before they spread to your entire crop." },
                    { icon: <Leaf />, title: "Organic Solutions", desc: "Get eco-friendly treatment recommendations first." },
                    { icon: <TrendingUp />, title: "Yield Protection", desc: "Improve your harvest productivity with expert insights." }
                  ].map((feature, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-stone-900 mb-2">Crop Health Dashboard</h2>
                <p className="text-stone-600">Monitor trends and track the health of your farm over time.</p>
              </div>
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold mb-4">
            <Sprout size={20} />
            AgroVision
          </div>
          <p className="text-stone-500 text-sm">Empowering farmers with AI-driven insights for sustainable agriculture.</p>
          <div className="flex justify-center gap-6 mt-8">
            <a href="#" className="text-stone-400 hover:text-stone-600 transition-colors"><Github size={20} /></a>
          </div>
          <p className="text-stone-400 text-xs mt-8">© 2026 AgroVision AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
