
import React, { useState, useRef, useEffect } from 'react';
import { generatePrototype, generateAppIcon, generateLovableLink, mockFetchRepositories } from './services/geminiService';
import { Prototype, GenerationStatus, GitHubRepo, ProjectAttachment } from './types';
import MobilePreview from './components/MobilePreview';
import { 
  Sparkles, 
  Terminal, 
  Layers, 
  Download, 
  Smartphone, 
  Plus, 
  Cpu, 
  Zap,
  Layout,
  ChevronRight,
  Code,
  Github,
  Link as LinkIcon,
  Globe,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Video,
  FolderOpen,
  X,
  FileCode,
  Play,
  Database,
  ShieldCheck,
  Eye,
  EyeOff,
  Files,
  FileDown,
  Maximize2,
  Box,
  RefreshCw,
  Package,
  Link2
} from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [prototype, setPrototype] = useState<Prototype | null>(null);
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'assets' | 'deploy'>('preview');
  
  // APK Build Simulation States
  const [isBuildingAPK, setIsBuildingAPK] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStep, setBuildStep] = useState('');

  // State for Supabase
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // GitHub & Lovable states
  const [lovableLink, setLovableLink] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [isGithubConnected, setIsGithubConnected] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() && attachments.length === 0 && !projectLink.trim()) return;
    
    try {
      setStatus(GenerationStatus.ANALYZING_CONTEXT);
      if (attachments.length > 0 || projectLink) await new Promise(r => setTimeout(r, 2000));
      
      setStatus(GenerationStatus.THINKING);
      const generatedProto = await generatePrototype(prompt, attachments, isSupabaseConnected, projectLink);
      setPrototype(generatedProto);
      
      setStatus(GenerationStatus.GENERATING_ASSETS);
      const icon = await generateAppIcon(generatedProto.name);
      setAppIcon(icon);
      
      setStatus(GenerationStatus.SUCCESS);
      const link = await generateLovableLink(generatedProto);
      setLovableLink(link);
    } catch (error) {
      console.error("Generation failed:", error);
      setStatus(GenerationStatus.ERROR);
    }
  };

  const regenerateIcon = async () => {
    if (!prototype) return;
    setStatus(GenerationStatus.GENERATING_ASSETS);
    const icon = await generateAppIcon(prototype.name);
    setAppIcon(icon);
    setStatus(GenerationStatus.SUCCESS);
  };

  const buildAPK = async () => {
    if (!prototype) return;
    setIsBuildingAPK(true);
    setBuildProgress(0);
    
    const steps = [
      { msg: 'Iniciando Compilação APK...', time: 1000 },
      { msg: 'Processando Manifestos Stitch...', time: 1500 },
      { msg: 'Otimizando Recursos Lovable...', time: 1200 },
      { msg: 'Integrando Ícone Adaptativo...', time: 1800 },
      { msg: 'Assinando Pacote de Depuração...', time: 1000 },
      { msg: 'APK Gerado com Sucesso!', time: 500 },
    ];

    for (let i = 0; i < steps.length; i++) {
      setBuildStep(steps[i].msg);
      const progressPerStep = 100 / steps.length;
      
      // Animate progress smoothly
      const startProgress = i * progressPerStep;
      const endProgress = (i + 1) * progressPerStep;
      
      const duration = steps[i].time;
      const startTime = Date.now();
      
      while (Date.now() - startTime < duration) {
        const elapsed = Date.now() - startTime;
        const current = startProgress + (elapsed / duration) * (endProgress - startProgress);
        setBuildProgress(current);
        await new Promise(r => requestAnimationFrame(r));
      }
    }
    
    setBuildProgress(100);
    setTimeout(() => {
      setIsBuildingAPK(false);
      alert("Virtual APK Build Complete! The project manifest is now optimized for mobile deployment.");
    }, 1000);
  };

  const addAttachment = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'folder') => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: ProjectAttachment[] = Array.from(files).map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: type === 'video' ? 'video' : 'folder',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPrototype = () => {
    if (!prototype) return;
    downloadFile(JSON.stringify(prototype, null, 2), `${prototype.name.toLowerCase().replace(/\s+/g, '-')}-stitch-project.json`, 'application/json');
  };

  const downloadIcon = () => {
    if (!appIcon) return;
    const a = document.createElement("a");
    a.href = appIcon;
    a.download = `${prototype?.name || 'app'}-icon.png`;
    a.click();
  };

  const downloadSQL = () => {
    if (!prototype?.databaseSchema) return;
    let sql = `-- Database Schema for ${prototype.name}\n\n`;
    prototype.databaseSchema.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      sql += table.columns.map(col => `  ${col.name} ${col.type}${col.isNullable ? '' : ' NOT NULL'}`).join(',\n');
      sql += `\n);\n\n`;
    });
    downloadFile(sql, `${prototype.name.toLowerCase().replace(/\s+/g, '-')}-schema.sql`, 'text/plain');
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-inter">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-pink-600 rounded-full blur-[150px]" />
      </div>

      {/* Hidden Inputs */}
      <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={(e) => addAttachment(e, 'video')} />
      <input type="file" className="hidden" ref={folderInputRef} onChange={(e) => addAttachment(e, 'folder')} {...({ webkitdirectory: "" } as any)} />

      {/* Left Sidebar: Context Engine */}
      <aside className="w-80 border-r border-white/5 bg-slate-950/40 backdrop-blur-xl flex flex-col p-6 space-y-6 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none tracking-tight">STITCH & LOVABLE</h1>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Google Design Engine</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Project Evolution Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. Add a dark mode dashboard with Material 3 cards..."
              className="w-full h-32 bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Project Link (Optional)</label>
            <div className="relative">
              <input 
                type="text" 
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                placeholder="lovable.dev/app/..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 pl-10 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
              />
              <Link2 className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Context Attachments</label>
                <span className="text-[10px] text-slate-400">{attachments.length} items</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => folderInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-[10px] font-bold">
                  <FolderOpen className="w-5 h-5 text-blue-400" /> Stitch Folder
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all text-[10px] font-bold">
                  <Video className="w-5 h-5 text-pink-400" /> UI Recording
                </button>
             </div>

             {attachments.length > 0 && (
               <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                 {attachments.map(att => (
                   <div key={att.id} className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 group animate-in fade-in slide-in-from-left-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {att.type === 'video' ? <Play className="w-3 h-3 text-pink-400" /> : <Files className="w-3 h-3 text-blue-400" />}
                        <span className="text-[10px] truncate font-mono text-slate-300">{att.name}</span>
                      </div>
                      <button onClick={() => removeAttachment(att.id)} className="p-1 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={status !== GenerationStatus.IDLE && status !== GenerationStatus.SUCCESS && status !== GenerationStatus.ERROR}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-600/20 active:translate-y-[0] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            {status === GenerationStatus.THINKING ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {attachments.length > 0 || projectLink ? 'Sync & Regenerate' : 'Generate Project'}
          </button>
        </div>

        {prototype && (
          <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
             <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg border border-white/10">
                   <img src={appIcon || "https://picsum.photos/64"} className="w-full h-full object-cover" alt="App Icon" />
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="font-bold text-xs truncate text-indigo-100">{prototype.name}</p>
                   <p className="text-[9px] uppercase font-bold text-indigo-400">Published Node</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-2">
               <button 
                 onClick={() => setActiveTab('preview')}
                 className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
               >
                 <Smartphone className="w-4 h-4" /> Preview
               </button>
               <button 
                 onClick={buildAPK}
                 className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
               >
                 <Box className="w-4 h-4" /> Build APK
               </button>
             </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0">
        {/* Modern Tabs */}
        <div className="h-16 border-b border-white/5 flex items-center px-10 gap-10 bg-slate-950/20 backdrop-blur-sm">
           {[
             { id: 'preview', label: 'Canvas', icon: Smartphone },
             { id: 'code', label: 'Schema', icon: Code },
             { id: 'assets', label: 'Resources', icon: Layers },
             { id: 'deploy', label: 'Cloud Deploy', icon: Globe }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all relative py-5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
               {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_0_15px_rgba(99,102,241,0.6)]" />}
             </button>
           ))}
        </div>

        {/* Dynamic Canvas */}
        <div className="flex-1 p-10 overflow-hidden relative">
          {status === GenerationStatus.IDLE && !prototype && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="relative">
                   <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                   <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 border border-white/10 flex items-center justify-center relative">
                      <Layout className="w-10 h-10 text-indigo-400" />
                   </div>
                </div>
                <div className="max-w-md space-y-3">
                   <h2 className="text-4xl font-black tracking-tighter leading-tight">Architect Your <span className="text-indigo-400">Stitch</span> Idea</h2>
                   <p className="text-slate-500 text-sm leading-relaxed">Combine Google's Material design tokens with Lovable's instant cloud deployment. Attach project folders or UI videos to continue where you left off.</p>
                </div>
                <div className="flex gap-4">
                   <div className="px-4 py-2 rounded-full bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Material 3 Verified
                   </div>
                   <div className="px-4 py-2 rounded-full bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-400 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-pink-500" /> Lovable Optimized
                   </div>
                </div>
             </div>
          )}

          {/* APK Build Overlay */}
          {isBuildingAPK && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center backdrop-blur-xl bg-slate-950/60">
               <div className="max-w-md w-full p-12 rounded-[3.5rem] bg-slate-900 border border-white/10 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-500">
                  <div className="relative flex justify-center">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                      <Package className="w-12 h-12 text-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black tracking-tight">{buildStep}</h3>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                        style={{ width: `${buildProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{Math.round(buildProgress)}% BUNDLING APK</p>
                  </div>
               </div>
            </div>
          )}

          {/* Loading Overlays */}
          {(status === GenerationStatus.THINKING || status === GenerationStatus.ANALYZING_CONTEXT || status === GenerationStatus.GENERATING_ASSETS) && (
             <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-slate-900/80 border border-white/10 p-10 rounded-[3rem] text-center space-y-6 max-w-sm shadow-2xl">
                   <div className="flex justify-center">
                      <div className="w-20 h-20 relative">
                         <div className="absolute inset-0 bg-indigo-500 animate-ping rounded-full opacity-20" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu className="w-12 h-12 text-indigo-500 animate-pulse" />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tight">
                         {status === GenerationStatus.ANALYZING_CONTEXT && "Parsing Stitch Files..."}
                         {status === GenerationStatus.THINKING && "Deep Thinking..."}
                         {status === GenerationStatus.GENERATING_ASSETS && "Optimizing UI Nodes..."}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Multi-Agent Protocol Active</p>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 animate-[loading_2s_ease-in-out_infinite]" />
                   </div>
                </div>
             </div>
          )}

          {prototype && (
            <div className="h-full animate-in fade-in zoom-in-95 duration-1000">
              {activeTab === 'preview' && (
                <div className="flex h-full items-center justify-center gap-20 relative">
                  <div className="flex-1 max-w-lg space-y-10">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">STITCH CORE v4.2</div>
                           {(attachments.length > 0 || projectLink) && <div className="px-3 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-[10px] font-black text-pink-400 uppercase tracking-widest">Context Injected</div>}
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter leading-none text-white">{prototype.name}</h2>
                        <p className="text-slate-400 text-xl leading-relaxed font-medium">{prototype.description}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        {prototype.screens.map(screen => (
                          <div key={screen.id} className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all cursor-pointer group">
                             <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] group-hover:scale-125 transition-transform" />
                                <span className="text-sm font-bold tracking-tight text-slate-200">{screen.name}</span>
                             </div>
                             <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                          </div>
                        ))}
                     </div>

                     <div className="pt-8 flex gap-5">
                        <button onClick={downloadPrototype} className="px-8 py-5 rounded-3xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
                           <Download className="w-5 h-5" /> Export Manifest
                        </button>
                        <button onClick={buildAPK} className="px-8 py-5 rounded-3xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                           <Box className="w-5 h-5" /> Build APK Package
                        </button>
                     </div>
                  </div>
                  
                  {/* Phone Frame */}
                  <div className="relative group scale-110">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-[4.5rem] blur-3xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <MobilePreview prototype={prototype} />
                    {/* Floating Preview Tools */}
                    <div className="absolute top-1/2 -right-16 -translate-y-1/2 flex flex-col gap-4">
                       <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all group/tool">
                          <Maximize2 className="w-5 h-5 group-hover/tool:scale-110" />
                       </button>
                       <button 
                        onClick={regenerateIcon}
                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all group/tool"
                       >
                          <RefreshCw className="w-5 h-5 group-hover/tool:rotate-180 transition-transform duration-500" />
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="h-full bg-slate-950/80 rounded-[3rem] border border-white/5 p-8 overflow-hidden flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-4">
                       <FileCode className="w-5 h-5 text-indigo-400" />
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">prototype-bundle.stitch</span>
                    </div>
                    <button 
                      onClick={downloadPrototype}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                      <Download className="w-3 h-3" /> Save JSON
                    </button>
                  </div>
                  <pre className="flex-1 overflow-auto jetbrains-mono text-xs text-indigo-300 bg-black/40 p-10 rounded-[2rem] scrollbar-thin scrollbar-thumb-white/10 selection:bg-indigo-500/30">
                    {JSON.stringify(prototype, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full overflow-y-auto pr-4 scrollbar-hide">
                   <div className="p-10 rounded-[3rem] bg-slate-900/50 border border-white/5 space-y-8 flex flex-col items-center text-center">
                      <h4 className="font-black text-[11px] text-slate-500 uppercase tracking-widest">Iconography Node</h4>
                      <div className="relative group/icon">
                        <div className="w-48 h-48 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5">
                           <img src={appIcon || "https://picsum.photos/512"} className="w-full h-full object-cover" alt="App Icon" />
                        </div>
                        <button 
                          onClick={regenerateIcon}
                          className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 transition-all opacity-0 group-hover/icon:opacity-100"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4 w-full">
                         <button 
                           onClick={downloadIcon}
                           className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                         >
                           <FileDown className="w-4 h-4" /> Download Adaptive PNG
                         </button>
                         <button 
                           onClick={buildAPK}
                           className="w-full py-4 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                         >
                           <Package className="w-4 h-4" /> Bake into APK
                         </button>
                      </div>
                   </div>
                   
                   <div className="md:col-span-2 space-y-8">
                      <div className="p-10 rounded-[3rem] bg-slate-900/50 border border-white/5 space-y-8">
                        <h4 className="font-black text-[11px] text-slate-500 uppercase tracking-widest">Material 3 Color Profiles</h4>
                        <div className="grid grid-cols-3 gap-6">
                           {[
                             { name: 'Primary Core', color: prototype.theme.primary },
                             { name: 'Secondary Flow', color: prototype.theme.secondary },
                             { name: 'Tertiary Spark', color: prototype.theme.accent }
                           ].map(c => (
                             <div key={c.name} className="space-y-4">
                                <div className="h-24 rounded-[1.5rem] shadow-inner border border-white/5 group relative overflow-hidden" style={{ backgroundColor: c.color }}>
                                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold">Copy Hex</div>
                                </div>
                                <div className="text-center">
                                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{c.name}</p>
                                   <p className="text-xs font-mono font-bold text-slate-300 mt-1 uppercase">{c.color}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      {prototype.databaseSchema && (
                        <div className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 space-y-8">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-[11px] text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                               <Database className="w-4 h-4" /> Supabase Continuity Map
                            </h4>
                            <button 
                              onClick={downloadSQL}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-400 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" /> Download SQL
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {prototype.databaseSchema.map(table => (
                               <div key={table.name} className="p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all">
                                  <p className="text-sm font-black text-white mb-4 flex items-center gap-2">
                                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                     {table.name}
                                  </p>
                                  <div className="space-y-2">
                                     {table.columns.map(col => (
                                       <div key={col.name} className="flex justify-between text-[10px] font-mono">
                                          <span className="text-slate-400">{col.name}</span>
                                          <span className="text-emerald-500/80 font-bold uppercase">{col.type}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {activeTab === 'deploy' && (
                <div className="max-w-4xl mx-auto h-full overflow-y-auto space-y-10 pb-20 scrollbar-hide">
                   <div className="text-center space-y-4 py-6">
                      <h2 className="text-5xl font-black tracking-tighter">Ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Cloud Orbit</span></h2>
                      <p className="text-slate-500 font-medium">Your Stitch design is synced and published to the Lovable infrastructure.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Lovable Direct Link */}
                      <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border border-pink-500/20 space-y-8 relative overflow-hidden group hover:border-pink-500/40 transition-all">
                         <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all rotate-12">
                            <Zap className="w-48 h-48 text-pink-500" />
                         </div>
                         <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-pink-500/20">
                               <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                               <h3 className="font-black text-2xl tracking-tight">Lovable Live</h3>
                               <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Instant Deployment</p>
                            </div>
                         </div>
                         
                         <div className="space-y-6 relative z-10">
                            <p className="text-slate-400 text-sm leading-relaxed">This URL hosts your fully functional prototype including the auto-generated backend and UI components.</p>
                            {lovableLink ? (
                              <div className="space-y-5">
                                 <div className="p-5 rounded-[1.5rem] bg-pink-500/5 border border-pink-500/10 flex items-center justify-between group/link cursor-pointer hover:bg-pink-500/10 transition-all">
                                    <span className="text-xs font-mono text-pink-300 truncate mr-6">{lovableLink}</span>
                                    <a href={lovableLink} target="_blank" rel="noreferrer" className="shrink-0 p-3 bg-pink-600 rounded-xl text-white hover:bg-pink-500 transition-all shadow-lg shadow-pink-600/20">
                                       <ExternalLink className="w-4 h-4" />
                                    </a>
                                 </div>
                                 <div className="flex items-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-tighter">
                                   <CheckCircle2 className="w-5 h-5" /> All Microservices Synced
                                 </div>
                              </div>
                            ) : (
                              <div className="h-32 flex items-center justify-center text-slate-700 font-black italic">Awaiting Primary Build...</div>
                            )}
                         </div>
                      </div>

                      {/* GitHub VCS */}
                      <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border border-white/5 space-y-8 relative overflow-hidden group hover:border-indigo-500/20 transition-all">
                         <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
                               <Github className="w-8 h-8 text-black" />
                            </div>
                            <div>
                               <h3 className="font-black text-2xl tracking-tight">GitHub Sync</h3>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Source Continuity</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <p className="text-slate-400 text-sm leading-relaxed">Archive this version's manifest and assets to your selected repository for permanent storage.</p>
                            <button className="w-full py-5 bg-white text-slate-950 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
                               Push to main
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* Continuity Logs */}
                   <div className="bg-slate-900/30 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md">
                      <div className="p-8 border-b border-white/5 flex items-center justify-between">
                         <h3 className="font-black text-xl tracking-tight">Sync History</h3>
                         <div className="flex gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                           <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                         </div>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm">
                            <thead className="text-[10px] text-slate-500 uppercase tracking-widest bg-white/5">
                               <tr>
                                  <th className="p-6 font-black">Service Node</th>
                                  <th className="p-6 font-black">Status</th>
                                  <th className="p-6 font-black">Protocol ID</th>
                                  <th className="p-6 font-black">Continuity State</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                               {lovableLink && (
                                 <tr className="hover:bg-white/[0.03] transition-colors">
                                    <td className="p-6 flex items-center gap-4">
                                       <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
                                       <span className="font-bold">Lovable Cloud</span>
                                    </td>
                                    <td className="p-6 text-emerald-400 font-black uppercase tracking-tighter italic">Operational</td>
                                    <td className="p-6 font-mono text-xs text-slate-500">{lovableLink.split('/').pop()}</td>
                                    <td className="p-6 text-slate-400 font-bold">{attachments.length > 0 || projectLink ? 'Full-Context' : 'Prompt-Only'}</td>
                                 </tr>
                               )}
                               <tr className="opacity-40">
                                  <td className="p-6 flex items-center gap-4">
                                     <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                     <span className="font-bold">Stitch Archive</span>
                                  </td>
                                  <td className="p-6 text-slate-500 font-black uppercase tracking-tighter italic">Standby</td>
                                  <td className="p-6 font-mono text-xs">local_snapshot_822</td>
                                  <td className="p-6 text-slate-400 font-bold">Base Manifest</td>
                               </tr>
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <footer className="h-12 border-t border-white/5 bg-slate-950/80 backdrop-blur-md px-10 flex items-center justify-between text-[10px] font-mono text-slate-600">
           <div className="flex items-center gap-8">
              <span className="flex items-center gap-2.5">
                 <div className={`w-2 h-2 rounded-full ${status === GenerationStatus.ERROR ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`} /> 
                 <span className="font-black uppercase tracking-widest text-slate-400">Gemini 3 Pro Sync: Ready</span>
              </span>
              <span className="text-indigo-400 font-black">STITCH_PROTOCOL_V4</span>
              <span className="text-pink-400 font-black">LOVABLE_RUNTIME_STABLE</span>
           </div>
           <div className="font-black uppercase tracking-[0.2em] text-slate-700">
              Continuity Architect &copy; 2024
           </div>
        </footer>
      </main>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
