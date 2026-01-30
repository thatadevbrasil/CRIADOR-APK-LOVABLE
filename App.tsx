
import React, { useState, useRef, useEffect } from 'react';
import { generatePrototype, generateAppIcon, generateLovableLink, generateIconConcepts, IconConcept } from './services/geminiService';
import { Prototype, GenerationStatus, ProjectAttachment, UserCredits } from './types';
import MobilePreview from './components/MobilePreview';
import { 
  Sparkles, 
  Download, 
  Smartphone, 
  Cpu, 
  Zap,
  Code,
  Globe,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  X,
  FileCode,
  PlayCircle,
  Plus,
  ChevronRight,
  RefreshCw,
  Box,
  HardDriveDownload,
  TerminalSquare,
  FileArchive,
  Palette,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  SmartphoneNfc,
  Maximize2,
  Apple,
  Monitor,
  Layout,
  Layers,
  Search,
  User,
  Image as ImageIcon,
  FileImage
} from 'lucide-react';

const App: React.FC = () => {
  // --- Core State ---
  const [prompt, setPrompt] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [prototype, setPrototype] = useState<Prototype | null>(null);
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [iconConcepts, setIconConcepts] = useState<IconConcept[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'assets' | 'deploy' | 'apk'>('preview');
  const [runtimeLogs, setRuntimeLogs] = useState<string[]>([]);
  const [showPricing, setShowPricing] = useState(false);

  // --- Credits & Plan State ---
  const [credits, setCredits] = useState<UserCredits>(() => {
    const saved = localStorage.getItem('stitch_credits');
    if (saved) return JSON.parse(saved);
    return { available: 10, lastReset: new Date().toDateString(), plan: 'free' };
  });

  // --- Build Simulation States ---
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildType, setBuildType] = useState<'android' | 'ios' | 'windows' | null>(null);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStep, setBuildStep] = useState('');

  // --- Attachments State ---
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [lovableLink, setLovableLink] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    const today = new Date().toDateString();
    if (credits.lastReset !== today) {
      const resetCount = credits.plan === 'free' ? 10 : credits.plan === 'basic' ? 50 : 999;
      setCredits(prev => ({ ...prev, available: resetCount, lastReset: today }));
    }
  }, [credits.lastReset, credits.plan]);

  useEffect(() => {
    localStorage.setItem('stitch_credits', JSON.stringify(credits));
  }, [credits]);

  const addLog = (msg: string) => {
    setRuntimeLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const deductCredit = (amount: number = 1): boolean => {
    if (credits.available < amount && credits.plan === 'free') {
      setShowPricing(true);
      return false;
    }
    setCredits(prev => ({ ...prev, available: Math.max(0, prev.available - amount) }));
    return true;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && attachments.length === 0 && !projectLink.trim()) return;
    if (!deductCredit(2)) return;

    try {
      setStatus(GenerationStatus.ANALYZING_CONTEXT);
      const hasImages = attachments.some(a => a.type === 'image');
      const inputType = projectLink ? 'URL' : hasImages ? 'Mockups' : 'Texto';
      addLog(`Processando Input: ${inputType} para Native Binaries...`);
      await new Promise(r => setTimeout(r, 1500));
      
      setStatus(GenerationStatus.THINKING);
      const generatedProto = await generatePrototype(prompt, attachments, false, projectLink, "");
      setPrototype(generatedProto);
      
      setStatus(GenerationStatus.GENERATING_ASSETS);
      const concepts = await generateIconConcepts(generatedProto.name, generatedProto.description);
      setIconConcepts(concepts);
      
      const firstIcon = await generateAppIcon(concepts[0].prompt);
      setAppIcon(firstIcon);
      
      setStatus(GenerationStatus.SUCCESS);
      const link = await generateLovableLink(generatedProto);
      setLovableLink(link);
      addLog(`Compilação preliminar finalizada.`);
    } catch (error) {
      console.error("Generation failed:", error);
      setStatus(GenerationStatus.ERROR);
      addLog("Erro Crítico: Falha na análise de input.");
    }
  };

  const handleConceptSelect = async (concept: IconConcept) => {
    if (status === GenerationStatus.GENERATING_ASSETS) return;
    if (!deductCredit(1)) return;

    setStatus(GenerationStatus.GENERATING_ASSETS);
    addLog(`Redefinindo identidade visual para: ${concept.style}...`);
    try {
      const newIcon = await generateAppIcon(concept.prompt);
      setAppIcon(newIcon);
      setStatus(GenerationStatus.SUCCESS);
      addLog("Assets visuais sincronizados globalmente.");
    } catch (e) {
      setStatus(GenerationStatus.ERROR);
      addLog("Falha ao gerar novos assets.");
    }
  };

  const runBuild = async (type: 'android' | 'ios' | 'windows') => {
    if (!prototype) return;
    if (!deductCredit(3)) return;

    setBuildType(type);
    setIsBuilding(true);
    setBuildProgress(0);
    
    const steps = [
      { msg: `Iniciando transpilação para ${type.toUpperCase()}...`, time: 700 },
      { msg: 'Convertendo estruturas Web para Native UI...', time: 1100 },
      { msg: 'Encapsulando Lovable Runtime Engine...', time: 900 },
      { msg: `Compilando binário .${type === 'android' ? 'apk' : type === 'ios' ? 'ipa' : 'exe'}...`, time: 1600 },
      { msg: 'Otimizando performance de runtime...', time: 1000 },
      { msg: 'Processo de build finalizado.', time: 500 },
    ];

    for (let i = 0; i < steps.length; i++) {
      setBuildStep(steps[i].msg);
      addLog(steps[i].msg);
      const duration = steps[i].time;
      const startTime = Date.now();
      const progressPerStep = 100 / steps.length;
      const startP = i * progressPerStep;
      const endP = (i + 1) * progressPerStep;
      
      while (Date.now() - startTime < duration) {
        const elapsed = Date.now() - startTime;
        setBuildProgress(startP + (elapsed / duration) * (endP - startP));
        await new Promise(r => requestAnimationFrame(r));
      }
    }
    
    setBuildProgress(100);
    setTimeout(() => {
      setIsBuilding(false);
      setActiveTab('apk');
    }, 600);
  };

  const downloadPrototype = () => {
    if (!prototype) return;
    const blob = new Blob([JSON.stringify(prototype, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prototype.name.replace(/\s+/g, '-').toLowerCase()}-blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("Blueprint JSON exportado com sucesso.");
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>, type: 'zip' | 'folder' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      const newAtt: ProjectAttachment = {
        id: Math.random().toString(),
        name: file.name,
        type: type,
        size: (file.size / 1024).toFixed(1) + 'KB'
      };
      setAttachments(prev => [...prev, newAtt]);
      addLog(`${type.toUpperCase()} anexado: ${file.name}`);
    }
  };

  const PricingModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-5xl w-full bg-slate-900 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
           <div>
             <h2 className="text-4xl font-black tracking-tight">Upgrade para <span className="text-indigo-400">Multi-Build</span></h2>
             <p className="text-slate-500 mt-2">Gere apps reais para Android, iOS e Windows a partir de qualquer proposta web.</p>
           </div>
           <button onClick={() => setShowPricing(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex flex-col space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Free</span>
                <h3 className="text-3xl font-black">Grátis</h3>
              </div>
              <ul className="space-y-4 flex-1 text-xs font-medium text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 Créditos Diários</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Preview App Web</li>
                <li className="flex items-center gap-2 text-slate-600"><X className="w-4 h-4" /> Export APK/iOS/Win</li>
              </ul>
              <button className="w-full py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest opacity-50 cursor-default">Plano Atual</button>
           </div>

           <div className="p-8 rounded-[2.5rem] border border-indigo-500/20 bg-indigo-500/5 flex flex-col space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Basic</span>
                <h3 className="text-3xl font-black">R$ 20<span className="text-sm font-medium text-slate-500">/mês</span></h3>
              </div>
              <ul className="space-y-4 flex-1 text-xs font-medium text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 50 Créditos Diários</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Build Android (APK)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> ZIP Context Engine</li>
              </ul>
              <button className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Ativar Agora</button>
           </div>

           <div className="p-8 rounded-[2.5rem] border border-pink-500/40 bg-pink-500/10 flex flex-col space-y-6 scale-105 shadow-2xl shadow-pink-500/10">
              <div className="absolute top-4 right-4 bg-pink-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Mais Vendido</div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Developer</span>
                <h3 className="text-3xl font-black">R$ 100<span className="text-sm font-medium text-slate-500">/mês</span></h3>
              </div>
              <ul className="space-y-4 flex-1 text-xs font-medium text-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-pink-400" /> Créditos Ilimitados</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-pink-400" /> Multi-App Build</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-pink-400" /> Lovable Project Sync</li>
              </ul>
              <button className="w-full py-4 rounded-2xl bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 transition-all">Upgrade Pro</button>
           </div>

           <div className="p-8 rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5 flex flex-col space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Enterprise</span>
                <h3 className="text-3xl font-black">R$ 200<span className="text-sm font-medium text-slate-500">/mês</span></h3>
              </div>
              <ul className="space-y-4 flex-1 text-xs font-medium text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Tudo do Pro</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Custom Domain Deploy</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Suporte 24/7</li>
              </ul>
              <button className="w-full py-4 rounded-2xl border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all">Contato Vendas</button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-inter selection:bg-indigo-500/30">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-pink-600 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {showPricing && <PricingModal />}

      <aside className="w-80 border-r border-white/5 bg-slate-950/40 backdrop-blur-xl flex flex-col p-6 space-y-6 z-10 overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none tracking-tight">STITCH & LOVABLE</h1>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Web-to-APK Studio</p>
          </div>
        </div>

        <div onClick={() => setShowPricing(true)} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group">
           <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Build Credits</p>
                 <p className="text-xs font-black text-white">{credits.available} <span className="text-slate-600 text-[10px]">tokens</span></p>
              </div>
           </div>
           <Plus className="w-4 h-4 text-slate-600 group-hover:text-white" />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Fonte: Website (URL)</label>
             <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="text" 
                  value={projectLink} 
                  onChange={e => setProjectLink(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono"
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Contexto / Detalhes</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva funcionalidades específicas ou cole requisitos técnicos..."
              className="w-full h-24 bg-slate-900/50 border border-white/5 rounded-xl p-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none placeholder:text-slate-700 font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
             <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all text-[8px] font-bold group">
               <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={(e) => handleAttachment(e, 'image')} />
               <ImageIcon className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" /> IMAGEM
             </button>
             <button onClick={() => zipInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-[8px] font-bold group">
               <input type="file" accept=".zip" className="hidden" ref={zipInputRef} onChange={(e) => handleAttachment(e, 'zip')} />
               <FileArchive className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> ZIP
             </button>
             <button onClick={() => folderInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-[8px] font-bold group">
               <input type="file" className="hidden" ref={folderInputRef} />
               <FolderOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" /> PASTA
             </button>
          </div>
          
          {attachments.length > 0 && (
            <div className="space-y-1">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                   <div className="flex items-center gap-2 overflow-hidden">
                      {att.type === 'image' ? <FileImage className="w-3 h-3 text-pink-400" /> : <FileCode className="w-3 h-3 text-indigo-400" />}
                      <span className="text-[10px] text-slate-300 truncate max-w-[120px]">{att.name}</span>
                   </div>
                   <span className="text-[9px] text-slate-600 font-mono">{att.size}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={status !== GenerationStatus.IDLE && status !== GenerationStatus.SUCCESS && status !== GenerationStatus.ERROR}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-600/20 active:translate-y-[0] disabled:opacity-30 transition-all shadow-lg border-t border-white/10"
          >
            {status === GenerationStatus.THINKING ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            TRANSFORMAR EM APK
          </button>
        </div>

        {prototype && (
          <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
             <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-3">
                <img src={appIcon || "https://picsum.photos/64"} className="w-10 h-10 rounded-lg object-cover" alt="Icon" />
                <div className="flex-1 overflow-hidden">
                   <p className="font-bold text-xs truncate text-indigo-100">{prototype.name}</p>
                   <p className="text-[9px] uppercase font-bold text-indigo-400">Projeto Ativo</p>
                </div>
             </div>
             
             <button 
               onClick={() => setActiveTab('preview')}
               className="w-full py-4 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
             >
                <PlayCircle className="w-5 h-5" /> EXECUTAR ENGINE
             </button>

             <button 
               onClick={() => runBuild('android')}
               className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
             >
                <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" /> GENERATE APK
             </button>

             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setActiveTab('assets')} className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                 <Palette className="w-3.5 h-3.5" /> Icon Swap
               </button>
               <button onClick={() => setActiveTab('apk')} className="py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-500/30 transition-all">
                 <Box className="w-3.5 h-3.5" /> Multi-Build
               </button>
             </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col relative z-0 bg-slate-950/20">
        <div className="h-16 border-b border-white/5 flex items-center px-10 gap-8 bg-slate-950/20 backdrop-blur-sm">
           {[
             { id: 'preview', label: 'Runtime Engine', icon: SmartphoneNfc },
             { id: 'assets', label: 'Identidade Visual', icon: Palette },
             { id: 'apk', label: 'Fábrica de Apps', icon: Box },
             { id: 'code', label: 'Logic Blueprint', icon: Code },
             { id: 'deploy', label: 'Lovable Cloud', icon: Globe }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative py-5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <tab.icon className="w-3.5 h-3.5" />
               {tab.label}
               {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />}
             </button>
           ))}
        </div>

        <div className="flex-1 p-0 overflow-hidden relative">
          {!prototype && status === GenerationStatus.IDLE && (
            <div className="h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 overflow-y-auto lg:overflow-hidden p-6 lg:p-12">
               {/* Left Content */}
               <div className="flex-1 max-w-xl space-y-6 text-center lg:text-left animate-in slide-in-from-bottom-10 duration-700">
                  <div className="space-y-3">
                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3" /> AI Native Factory v4.0
                     </div>
                     <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
                        Web to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">APK</span> <br className="hidden lg:block"/> Factory.
                     </h1>
                     <p className="text-slate-400 text-sm lg:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                        Upload your website link, prototype images, or code archives. We compile them into production-ready Android and iOS binaries instantly.
                     </p>
                  </div>

                  {/* Quick Start for Mobile/Tablet convenience */}
                  <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-2xl space-y-4 max-w-md mx-auto lg:mx-0">
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quick Transform</label>
                        <div className="relative">
                           <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                           <input 
                              type="text" 
                              value={projectLink}
                              onChange={e => setProjectLink(e.target.value)}
                              placeholder="Paste website URL to convert..." 
                              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-white"
                           />
                        </div>
                     </div>
                     <button 
                        onClick={handleGenerate}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                     >
                        <Zap className="w-4 h-4 fill-current" /> Start Engine
                     </button>
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Image to App</span>
                     <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"><CheckCircle2 className="w-3 h-3 text-blue-500" /> Web to App</span>
                     <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"><CheckCircle2 className="w-3 h-3 text-indigo-500" /> Code to App</span>
                  </div>
               </div>

               {/* Right Visuals - Phone & Tablet Composition */}
               <div className="flex-1 relative w-full max-w-lg lg:h-auto h-[350px] flex items-center justify-center animate-in zoom-in-95 duration-1000 delay-200">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-pink-600/20 blur-[100px] rounded-full pointer-events-none" />
                  
                  {/* Floating Tablet (Behind) */}
                  <div className="absolute right-0 lg:-right-8 top-1/2 -translate-y-1/2 w-[65%] aspect-[4/3] bg-slate-900 border-[6px] border-slate-800 rounded-[2rem] shadow-2xl rotate-6 opacity-60 scale-90 flex flex-col overflow-hidden pointer-events-none">
                     <div className="h-6 bg-slate-800 w-full flex items-center px-4 gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                     </div>
                     <div className="flex-1 bg-slate-950 p-4 grid grid-cols-2 gap-4 opacity-50">
                        <div className="rounded-xl bg-white/5 h-32" />
                        <div className="rounded-xl bg-white/5 h-32" />
                        <div className="rounded-xl bg-white/5 h-full col-span-2" />
                     </div>
                  </div>

                  {/* Floating Phone (Front) */}
                  <div className="relative z-10 w-[240px] h-[500px] bg-black rounded-[3rem] border-[8px] border-slate-800 shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
                     {/* Dynamic Island */}
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <div className="w-6 h-1 rounded-full bg-slate-800" />
                     </div>
                     
                     {/* Screen UI Skeleton */}
                     <div className="flex-1 bg-slate-950 pt-10 pb-6 px-4 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                           <div className="w-6 h-6 rounded-full bg-white/10" />
                           <div className="w-20 h-3 rounded-full bg-white/10" />
                           <div className="w-6 h-6 rounded-full bg-white/10" />
                        </div>
                        
                        <div className="h-32 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 p-4 flex flex-col justify-end">
                           <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center mb-auto shadow-lg shadow-indigo-500/30">
                              <Smartphone className="w-5 h-5 text-white" />
                           </div>
                           <div className="w-24 h-3 rounded-full bg-white/10 mb-2" />
                           <div className="w-16 h-1.5 rounded-full bg-white/5" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                           <div className="h-20 rounded-2xl bg-white/5" />
                           <div className="h-20 rounded-2xl bg-white/5" />
                        </div>

                        <div className="space-y-2">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="h-12 rounded-2xl bg-white/5 border border-white/[0.02] flex items-center px-3 gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-white/5" />
                                 <div className="flex-1 space-y-1.5">
                                    <div className="w-full h-1.5 rounded-full bg-white/10" />
                                    <div className="w-1/2 h-1.5 rounded-full bg-white/5" />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Tab Bar */}
                     <div className="h-14 border-t border-white/5 flex items-center justify-around px-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center"><Box className="w-4 h-4 text-indigo-400" /></div>
                        <div className="w-8 h-8 flex items-center justify-center"><Search className="w-4 h-4 text-slate-600" /></div>
                        <div className="w-8 h-8 flex items-center justify-center"><User className="w-4 h-4 text-slate-600" /></div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {isBuilding && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center backdrop-blur-xl bg-slate-950/80">
               <div className="max-w-md w-full p-12 rounded-[4rem] bg-slate-900 border border-white/10 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
                     {buildType === 'android' ? <Smartphone className="w-10 h-10 text-emerald-500" /> : buildType === 'ios' ? <Apple className="w-10 h-10 text-blue-500" /> : <Monitor className="w-10 h-10 text-indigo-500" />}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black tracking-tight">{buildStep}</h3>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300" style={{ width: `${buildProgress}%` }} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{Math.round(buildProgress)}% OTIMIZADO</p>
                  </div>
               </div>
            </div>
          )}

          {prototype && (
            <div className="h-full animate-in fade-in zoom-in-95 duration-700">
              {activeTab === 'preview' && (
                <div className="flex h-full items-center justify-center gap-12 relative">
                  <div className="flex-1 max-w-md space-y-6">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">STITCH ENGINE v4.5</div>
                           <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">ACTIVE RUNTIME</div>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter leading-none text-white">{prototype.name}</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">{prototype.description}</p>
                     </div>

                     <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-3">
                           <div className="flex items-center gap-2">
                              <TerminalSquare className="w-4 h-4 text-indigo-400" />
                              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Console de Transformação</span>
                           </div>
                           <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin pr-2">
                              {runtimeLogs.map((log, i) => (
                                <p key={i} className="text-[10px] font-mono text-indigo-300/80 truncate leading-relaxed animate-in slide-in-from-left-2">{log}</p>
                              ))}
                           </div>
                        </div>
                        <button onClick={() => addLog("Reiniciando engine de renderização nativa...")} className="px-8 py-5 rounded-3xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:bg-indigo-500 transition-all shadow-xl active:scale-95">
                           <PlayCircle className="w-6 h-6" /> REBOOT BLUEPRINT
                        </button>
                     </div>
                  </div>
                  <div className="relative scale-90">
                    <div className="absolute -inset-16 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-[5rem] blur-[120px]"></div>
                    <MobilePreview prototype={prototype} />
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                       <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all backdrop-blur-md shadow-xl"><Maximize2 className="w-4 h-4" /></button>
                       <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all backdrop-blur-md shadow-xl"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="h-full overflow-y-auto pr-4 scrollbar-thin space-y-10 pb-20">
                   <div className="flex items-center justify-between">
                      <h2 className="text-4xl font-black tracking-tight">Assets <span className="text-indigo-400">Cross-Platform</span></h2>
                      <button onClick={handleGenerate} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all">
                        <Lightbulb className="w-4 h-4" /> Recriar Brand Assets
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {iconConcepts.map((concept) => (
                        <div key={concept.id} onClick={() => handleConceptSelect(concept)} className="group bg-slate-900/40 border p-6 rounded-[2.5rem] transition-all cursor-pointer relative overflow-hidden hover:border-indigo-500/40">
                           <div className="flex flex-col h-full space-y-4 relative z-10">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Palette className="w-6 h-6" /></div>
                              <h3 className="font-black text-sm uppercase tracking-tight">{concept.style}</h3>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed flex-1">{concept.description}</p>
                              <div className="pt-4 flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Aplicar aos Apps <ChevronRight className="w-3 h-3" /></div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="p-12 rounded-[4rem] bg-slate-900/40 border border-white/5 flex items-center gap-16 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-64 h-64 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white/5 shrink-0 relative z-10">
                         {status === GenerationStatus.GENERATING_ASSETS && <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10"><RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" /></div>}
                         <img src={appIcon || "https://picsum.photos/512"} className="w-full h-full object-cover" alt="App Icon" />
                      </div>
                      <div className="space-y-8 relative z-10">
                         <h3 className="text-4xl font-black tracking-tight leading-tight">Identidade <br/><span className="text-indigo-400">Sincronizada</span></h3>
                         <p className="text-slate-400 max-w-md">Este ícone será injetado nos bundles APK (Android), IPA (iOS) e EXE (Windows) para garantir consistência em todas as Stores.</p>
                         <div className="flex gap-4">
                            <button className="px-8 py-4 bg-indigo-600 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all">
                               <Download className="w-4 h-4" /> Exportar Brand Kit
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'apk' && (
                <div className="h-full flex flex-col items-center justify-center space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black tracking-tighter">Exportação <span className="text-indigo-400">Nativa</span></h2>
                      <p className="text-slate-500">Transforme sua visão web em binários assinados e prontos para teste real.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                      {/* Android */}
                      <div className="p-10 rounded-[3.5rem] bg-slate-900 border border-emerald-500/20 shadow-2xl space-y-8 group hover:border-emerald-500/40 transition-all hover:translate-y-[-4px]">
                         <div className="flex items-center justify-between">
                            <Smartphone className="w-8 h-8 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">APK STABLE</span>
                         </div>
                         <h3 className="text-2xl font-black">Android App</h3>
                         <p className="text-slate-500 text-sm">Empacotamento completo para Android 12+. Inclui assets adaptativos Stitch.</p>
                         <button onClick={() => runBuild('android')} className="w-full py-5 rounded-[2rem] bg-emerald-600 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all">
                            <HardDriveDownload className="w-5 h-5" /> Build APK (3 <Zap className="w-2.5 h-2.5 inline" />)
                         </button>
                      </div>

                      {/* iOS */}
                      <div className="p-10 rounded-[3.5rem] bg-slate-900 border border-blue-500/20 shadow-2xl space-y-8 group hover:border-blue-500/40 transition-all hover:translate-y-[-4px]">
                         <div className="flex items-center justify-between">
                            <Apple className="w-8 h-8 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">IPA PRODUCTION</span>
                         </div>
                         <h3 className="text-2xl font-black">iOS Apple</h3>
                         <p className="text-slate-500 text-sm">Bundle IPA para TestFlight e App Store. Retina 3x e Bitcode ativo.</p>
                         <button onClick={() => runBuild('ios')} className="w-full py-5 rounded-[2rem] bg-blue-600 text-white font-black text-xs uppercase flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
                            <HardDriveDownload className="w-5 h-5" /> Build IPA (3 <Zap className="w-2.5 h-2.5 inline" />)
                         </button>
                      </div>

                      {/* Windows */}
                      <div className="p-10 rounded-[3.5rem] bg-slate-900 border border-indigo-500/20 shadow-2xl space-y-8 group hover:border-indigo-500/40 transition-all hover:translate-y-[-4px]">
                         <div className="flex items-center justify-between">
                            <Monitor className="w-8 h-8 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">EXE DESKTOP</span>
                         </div>
                         <h3 className="text-2xl font-black">Windows Desktop</h3>
                         <p className="text-slate-500 text-sm">Binário .exe nativo para Windows 10/11. Otimizado para arquitetura x64.</p>
                         <button onClick={() => runBuild('windows')} className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xs uppercase flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
                            <HardDriveDownload className="w-5 h-5" /> Build EXE (3 <Zap className="w-2.5 h-2.5 inline" />)
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="h-full bg-slate-950/80 rounded-[3.5rem] border border-white/5 p-10 flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8 px-4 relative z-10">
                    <div className="flex items-center gap-4">
                       <FileCode className="w-6 h-6 text-indigo-400" />
                       <span className="font-black text-xs uppercase tracking-widest text-slate-400">multi-app-blueprint.json</span>
                    </div>
                    <button onClick={downloadPrototype} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 transition-all"><Download className="w-4 h-4" /> Exportar Lógica</button>
                  </div>
                  <pre className="flex-1 overflow-auto jetbrains-mono text-xs text-indigo-300/90 bg-black/40 p-12 rounded-[2.5rem] scrollbar-thin relative z-10">
                    {JSON.stringify(prototype, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === 'deploy' && (
                <div className="max-w-4xl mx-auto h-full overflow-y-auto space-y-12 pb-20 scrollbar-hide">
                   <div className="text-center space-y-4 py-8">
                      <h2 className="text-6xl font-black tracking-tighter">Sync com <span className="text-indigo-400">Cloud</span></h2>
                      <p className="text-slate-500 text-lg">Hospede e gerencie sua proposta via infraestrutura Lovable.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-pink-500/20 space-y-8 relative group overflow-hidden">
                         <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-pink-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative z-10">
                               <ExternalLink className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-black text-3xl tracking-tight relative z-10">Lovable Live</h3>
                         </div>
                         <p className="text-slate-400 text-sm leading-relaxed relative z-10">Ambiente web instantâneo sincronizado com sua proposta multi-plataforma.</p>
                         {lovableLink && (
                           <div className="p-6 rounded-[2rem] bg-pink-500/10 border border-pink-500/20 flex items-center justify-between group/link cursor-pointer hover:bg-pink-500/20 transition-all relative z-10">
                              <span className="text-xs font-mono text-pink-300 truncate mr-6">{lovableLink}</span>
                              <a href={lovableLink} target="_blank" rel="noreferrer" className="shrink-0 p-4 bg-pink-600 rounded-2xl text-white shadow-lg"><ExternalLink className="w-5 h-5" /></a>
                           </div>
                         )}
                      </div>
                      <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-indigo-500/20 space-y-8 relative group">
                         <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
                               <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="font-black text-3xl tracking-tight">Enterprise SSL</h3>
                         </div>
                         <p className="text-slate-400 text-sm leading-relaxed">Conectividade segura ponta-a-ponta e integração com backend Supabase configurada.</p>
                         <button className="w-full py-5 bg-white text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Gerenciar Backend</button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="h-12 border-t border-white/5 bg-slate-950/80 backdrop-blur-md px-10 flex items-center justify-between text-[10px] font-mono text-slate-600">
           <div className="flex items-center gap-10">
              <span className="flex items-center gap-2.5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                 <span className="font-black uppercase tracking-widest text-slate-400">Multi-Build Factory Active</span>
              </span>
              <span className="flex items-center gap-2">
                 <TrendingUp className="w-3 h-3 text-indigo-500" />
                 <span className="font-black text-indigo-400 uppercase">Status: {credits.plan.toUpperCase()}</span>
              </span>
           </div>
           <div className="font-black uppercase tracking-widest text-slate-800">
              Transform Engine &copy; 2024
           </div>
        </footer>
      </main>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
