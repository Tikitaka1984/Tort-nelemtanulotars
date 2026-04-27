import { useState, useRef, useEffect } from "react";
import { Send, Trash2, LibraryBig, ShieldAlert, X, Menu, CheckCircle2, XCircle, BrainCircuit } from "lucide-react";
import { ModeId, MODES, TOPICS, AppMode, GENERAL_SYSTEM_INSTRUCTION, Difficulty } from "./constants";
import { sendMessageToGemini } from "./lib/gemini";
import { ChatMessage } from "./components/ChatMessage";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizData {
  type: 'quiz';
  questions: QuizQuestion[];
}

interface Message {
  role: 'user' | 'model';
  content: string;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  quizData?: QuizData;
}

export default function App() {
  const [activeModeId, setActiveModeId] = useState<ModeId>('fogalom');
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>('közepes');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingModeId, setPendingModeId] = useState<ModeId | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Quiz State
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeMode = MODES[activeModeId];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleModeChange = (id: ModeId) => {
    if (id === activeModeId) {
      setIsMenuOpen(false);
      return;
    }
    
    if (messages.length > 0) {
      setPendingModeId(id);
    } else {
      setActiveModeId(id);
      setSourceText('');
      setActiveQuizId(null);
    }
    setIsMenuOpen(false);
  };

  const confirmModeChange = (shouldDelete: boolean) => {
    if (pendingModeId) {
      const targetId = pendingModeId;
      setActiveModeId(targetId);
      setSourceText('');
      setActiveQuizId(null);
      
      if (shouldDelete) {
        setMessages([]);
        setUserAnswers({});
        setSubmittedQuizzes(new Set());
      }
      setPendingModeId(null);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(prompt.length, prompt.length);
      }
    }, 0);
  };

  const handleTopicClick = (topicQuestion: string) => {
    setInput(topicQuestion);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(topicQuestion.length, topicQuestion.length);
      }
    }, 0);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let finalUserText = text;
    if (activeModeId === 'forras' && sourceText.trim()) {
      finalUserText = `Elemzendő forrásszöveg:\n"${sourceText}"\n\nKérdésem a forrással kapcsolatban: ${text}`;
    }

    const newMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => {
        return {
          role: m.role,
          parts: [{ text: m.content }]
        };
      }) as { role: 'user' | 'model', parts: [{ text: string }] }[];

      const systemInstruction = `${GENERAL_SYSTEM_INSTRUCTION}
      
Jelenlegi mód: ${activeMode.title}
${activeMode.systemInstruction}
${activeModeId === 'kviz' ? `Választott nehézségi szint: ${quizDifficulty}` : ''}`;

      const responseText = await sendMessageToGemini(history, finalUserText, systemInstruction);
      
      let finalResponse = responseText;
      let quizData: QuizData | undefined;

      // Check for JSON quiz in the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && activeModeId === 'kviz') {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.type === 'quiz' && Array.isArray(parsed.questions)) {
            quizData = parsed;
            // Strip the JSON block from the readable text if it's there
            finalResponse = responseText.replace(/```json\n([\s\S]*?)\n```/, '').trim();
            if (!finalResponse) finalResponse = "Itt a kért kvíz:";
          }
        } catch (e) {
          console.error("Failed to parse quiz JSON", e);
        }
      }

      if (activeModeId === 'vazlat') {
        finalResponse += "\n\n> ⚠️ **Emlékeztető:** Ez csak egy kiinduló vázlat! A folyószöveget neked kell önállóan megírni. Az önálló munkát a tanár értékeli, nem az AI által adott szöveget.";
      }

      const modelMessage: Message = { 
        role: 'model', 
        content: finalResponse,
        quizData
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Hiba történt a válasz generálása során. Kérlek próbáld újra később.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (messageIndex: number, questionIndex: number, answerIndex: number) => {
    const quizKey = `${messageIndex}-${questionIndex}`;
    if (submittedQuizzes.has(`${messageIndex}`)) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [quizKey]: answerIndex
    }));
  };

  const submitQuiz = (messageIndex: number) => {
    setSubmittedQuizzes(prev => {
      const next = new Set(prev);
      next.add(`${messageIndex}`);
      return next;
    });
  };

  const clearConversation = () => {
    if (window.confirm("Biztosan törlöd az eddigi beszélgetést?")) {
      setMessages([]);
      setUserAnswers({});
      setSubmittedQuizzes(new Set());
    }
  };

  const QuizResults = ({ questions, messageIndex }: { questions: QuizQuestion[], messageIndex: number }) => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[`${messageIndex}-${idx}`] === q.correctIndex) {
        score++;
      }
    });

    return (
      <div className="mt-4 p-4 bg-burgundy-800 text-white rounded-lg shadow-lg border-2 border-gold-500 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-lg">Eredmény</h4>
          <span className="text-2xl font-display font-bold text-gold-500">{score}/{questions.length} helyes</span>
        </div>
        <p className="text-sm opacity-90">
          {score === questions.length ? "Gratulálok! Hibátlan megoldás. 🏆" : 
           score > questions.length / 2 ? "Szép munka! Majdnem tökéletes. 👍" : 
           "Ne csüggedj, a gyakorlás teszi a mestert! 📖"}
        </p>
      </div>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="text-[10px] uppercase font-bold text-burgundy-800 mb-2 tracking-tighter">Tanulási Módok</div>
      {Object.values(MODES).map((mode) => {
        const isActive = mode.id === activeModeId;
        return (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id as ModeId)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded text-sm transition-all text-left group",
              isActive 
                ? "bg-burgundy-800 text-white shadow-sm font-medium" 
                : "text-history-subtle hover:bg-parchment-300 bg-transparent border-transparent"
            )}
          >
            <div className={cn("shrink-0 w-2 h-2 rounded-full transition-all", isActive ? "bg-gold-500 scale-110" : "bg-transparent border border-burgundy-800 group-hover:border-gold-600")} />
            {mode.title}
          </button>
        );
      })}
      
      <div className="mt-auto pt-4">
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="w-full py-2 border border-burgundy-800 text-burgundy-800 rounded text-xs font-bold uppercase hover:bg-white transition-colors flex justify-center items-center gap-2"
            title="Beszélgetés törlése"
          >
            <Trash2 size={16} />
            Törlés
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden text-history-text font-sans">
      {/* Header */}
      <header className="shrink-0 h-20 bg-history-blue text-white flex items-center justify-between px-4 md:px-8 border-b-4 border-gold-600 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <LibraryBig size={28} className="text-gold-500" />
          <div>
            <h1 className="text-lg md:text-2xl font-display font-bold text-gold-500">Történelem Tanulótárs</h1>
            <h2 className="text-[10px] uppercase tracking-widest opacity-80 hidden sm:block">Érettségi-felkészítő asszisztens</h2>
          </div>
        </div>
        
        <div className="text-right max-w-xs hidden sm:block">
          <p className="text-[10px] leading-tight italic opacity-90">
            Ez egy tanári tesztverzió. Ne adj meg személyes adatot. <br/>
            Az AI válaszait mindig ellenőrizni kell tanári vagy hiteles forrás alapján.
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar: Mode Selector */}
        <nav className="hidden md:flex w-56 shrink-0 bg-parchment-100 border-r border-parchment-200 flex-col p-4 space-y-2 overflow-y-auto">
          <SidebarContent />
        </nav>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-history-blue/40 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.nav 
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[240px] bg-parchment-100 shadow-2xl z-50 flex flex-col p-4 pt-20 space-y-2 border-r border-parchment-200 md:hidden"
              >
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute top-6 right-4 p-2 text-burgundy-800 hover:bg-burgundy-900/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
                <SidebarContent />
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex flex-col flex-1 min-w-0 bg-white relative shadow-inner z-10">
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded bg-gold-500 text-burgundy-800 shadow-sm mx-auto">
                    <activeMode.icon size={32} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-burgundy-800">
                    {activeMode.title}
                  </h3>
                  <p className="text-history-subtle max-w-md mx-auto leading-relaxed">
                    {activeMode.description}
                  </p>
                  
                  {activeModeId === 'kviz' && (
                    <div className="flex flex-col items-center gap-2 mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-history-blue">Válassz nehézségi szintet</span>
                      <div className="flex gap-2 p-1 bg-parchment-200 rounded-lg">
                        {(['könnyű', 'közepes', 'nehéz'] as Difficulty[]).map((level) => (
                          <button
                            key={level}
                            onClick={() => setQuizDifficulty(level)}
                            className={cn(
                              "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                              quizDifficulty === level 
                                ? "bg-burgundy-800 text-white shadow-sm" 
                                : "text-history-subtle hover:bg-parchment-300"
                            )}
                          >
                            {level.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-full space-y-4 text-left">
                  <div className="max-w-lg mx-auto">
                    <p className="text-xs font-bold text-history-blue uppercase tracking-widest text-center mb-4">
                      Témakörök
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                      {TOPICS.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicClick(topic.question)}
                          className="px-3 py-1.5 rounded-full bg-history-blue text-gold-500 text-xs font-medium border border-gold-600/30 hover:bg-burgundy-800 hover:text-white hover:border-gold-500 transition-all shadow-sm"
                        >
                          {topic.label}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs font-bold text-history-blue uppercase tracking-widest text-center mb-4">
                      Példakérdések
                    </p>
                    <div className="grid gap-3">
                      {activeMode.prompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePromptClick(prompt)}
                          className="text-left px-4 py-3 rounded-lg bg-parchment-25 border border-parchment-200 hover:bg-gold-500/10 hover:border-gold-600 transition-all group"
                        >
                          <p className="text-sm text-history-text group-hover:text-history-blue font-serif">"{prompt}"</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {activeModeId === 'forras' && (
                  <div className="w-full max-w-lg mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <label className="text-xs font-bold text-history-blue uppercase tracking-widest block text-center">
                      Történelmi forrásszöveg
                    </label>
                    <textarea 
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      placeholder="Másold ide a történelmi forrásszöveget..."
                      className="w-full h-40 p-4 bg-parchment-25 border border-parchment-200 rounded-lg text-sm font-serif focus:outline-none focus:border-gold-600 resize-none shadow-inner"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {activeModeId === 'forras' && (
                  <div className="mb-8 p-4 bg-parchment-100/50 border border-dashed border-parchment-200 rounded-lg relative group">
                    <div className="absolute -top-3 left-4 bg-parchment-100 px-2 text-[10px] font-bold text-burgundy-800 uppercase tracking-widest border border-parchment-200">
                      Aktuális forrás
                    </div>
                    {sourceText ? (
                      <p className="text-xs font-serif text-history-subtle italic line-clamp-3">"{sourceText}"</p>
                    ) : (
                      <p className="text-xs font-serif text-history-subtle italic opacity-50">Nincs forrás megadva.</p>
                    )}
                    <button 
                      onClick={() => setMessages([])} // Force back to intro if they want to change source easily, or I could add an Edit button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] underline text-history-blue font-bold uppercase"
                    >
                      Forrás módosítása
                    </button>
                  </div>
                )}

                {messages.map((m, idx) => (
                  <div key={idx} className={cn("relative", m.role === 'model' && "pb-8")}>
                    <ChatMessage message={m.content} isUser={m.role === 'user'} />
                    
                    {m.role === 'model' && m.quizData && (
                      <div className="mt-4 ml-12 bg-white rounded-xl border border-parchment-200 shadow-lg overflow-hidden">
                        <div className="bg-parchment-100 p-4 border-b border-parchment-200">
                          <h3 className="font-display font-bold text-burgundy-800 flex items-center gap-2">
                             <BrainCircuit size={20} className="text-gold-600" />
                             Tudásellenőrző Kvíz
                          </h3>
                        </div>
                        <div className="p-6 space-y-8">
                          {m.quizData.questions.map((q, qIdx) => {
                            const quizKey = `${idx}-${qIdx}`;
                            const isSubmitted = submittedQuizzes.has(`${idx}`);
                            const userAnswer = userAnswers[quizKey];
                            
                            return (
                              <div key={qIdx} className="space-y-4">
                                <p className="font-serif text-lg text-history-text">{qIdx + 1}. {q.question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {q.options.map((option, optIdx) => {
                                    const isCorrect = optIdx === q.correctIndex;
                                    const isUserSelection = userAnswer === optIdx;
                                    const isAnswered = userAnswer !== undefined;
                                    
                                    let btnStyles = "text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between group ";
                                    
                                    if (isAnswered) {
                                      if (isCorrect) {
                                        btnStyles += "bg-green-50 border-green-500 text-green-700 font-bold";
                                      } else if (isUserSelection) {
                                        btnStyles += "bg-red-50 border-red-500 text-red-700 font-bold";
                                      } else {
                                        btnStyles += "bg-parchment-50 border-parchment-200 text-history-subtle opacity-60";
                                      }
                                    } else {
                                      btnStyles += "bg-parchment-25 border-parchment-200 hover:border-gold-600 text-history-text hover:bg-gold-500/5";
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        onClick={() => handleQuizAnswer(idx, qIdx, optIdx)}
                                        disabled={isAnswered}
                                        className={btnStyles}
                                      >
                                        <span className="text-sm">
                                          <span className="mr-3 font-bold opacity-50">{['A', 'B', 'C', 'D'][optIdx]}</span>
                                          {option}
                                        </span>
                                        {isAnswered && isCorrect && <CheckCircle2 size={16} className="text-green-600" />}
                                        {isAnswered && isUserSelection && !isCorrect && <XCircle size={16} className="text-red-600" />}
                                      </button>
                                    );
                                  })}
                                </div>
                                {userAnswer !== undefined && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                      "p-3 rounded-lg text-sm font-serif italic",
                                      userAnswer === q.correctIndex ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                                    )}
                                  >
                                    <p className="flex items-start gap-2">
                                      <span className="font-bold shrink-0">Visszajelzés:</span>
                                      {q.explanation}
                                    </p>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}

                          {m.quizData.questions.every((_, qIdx) => userAnswers[`${idx}-${qIdx}`] !== undefined) && (
                            <QuizResults questions={m.quizData.questions} messageIndex={idx} />
                          )}
                        </div>
                      </div>
                    )}

                    {m.role === 'model' && (m.isCorrect || m.isIncorrect) && (
                      <div className={cn(
                        "absolute -right-2 top-0 transform translate-x-full mt-2 flex items-center justify-center w-8 h-8 rounded-full shadow-md z-10",
                        m.isCorrect ? "bg-green-100 text-green-600 border border-green-200" : "bg-red-100 text-red-600 border border-red-200"
                      )}>
                        {m.isCorrect ? (
                          <span className="text-xl font-bold">✓</span>
                        ) : (
                          <span className="text-xl font-bold">✗</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded bg-gold-500 flex-shrink-0 flex items-center justify-center font-display text-burgundy-800 font-bold">
                      TT
                    </div>
                    <div className="max-w-[85%] bg-parchment-25 border border-parchment-200 p-4 rounded-r-xl rounded-bl-xl shadow-sm w-full block">
                      <div className="flex items-center gap-1.5 h-5">
                        <div className="w-2 h-2 rounded-full bg-burgundy-800/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-burgundy-800/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-burgundy-800/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t border-parchment-200 bg-parchment-25 p-4 flex flex-col gap-2">
            {activeModeId === 'kviz' && messages.length > 0 && (
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-history-blue uppercase tracking-widest">Nehézség:</span>
                <div className="flex gap-1">
                  {(['könnyű', 'közepes', 'nehéz'] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setQuizDifficulty(level)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all",
                        quizDifficulty === level 
                          ? "bg-burgundy-800 text-white shadow-sm" 
                          : "bg-parchment-200 text-history-subtle hover:bg-parchment-300"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder={activeModeId === 'forras' ? "Mi a kérdésed a forrással kapcsolatban?" : "Írd ide a kérdésedet..."}
                className="flex-1 h-10 px-4 bg-white border border-parchment-200 rounded text-sm focus:outline-none focus:border-burgundy-800 shadow-inner"
              />
              
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="h-10 px-6 bg-burgundy-800 text-white rounded font-bold text-sm hover:focus:bg-burgundy-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                KÜLDÉS
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mode Change Modal */}
      <AnimatePresence>
        {pendingModeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingModeId(null)}
              className="absolute inset-0 bg-history-blue/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-parchment-200 overflow-hidden"
            >
              <div className="bg-parchment-100 p-4 border-b border-parchment-200 flex justify-between items-center">
                <h3 className="font-display font-bold text-burgundy-800 uppercase tracking-wide">Módváltás</h3>
                <button 
                  onClick={() => setPendingModeId(null)}
                  className="text-history-subtle hover:text-burgundy-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-history-text font-serif text-lg leading-relaxed mb-8">
                  Új tanulási módot választottál. Törlöd az eddigi beszélgetést?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => confirmModeChange(true)}
                    className="w-full py-3 bg-burgundy-800 text-white rounded-lg font-bold hover:bg-burgundy-900 transition-colors shadow-sm"
                  >
                    Igen, törlöm
                  </button>
                  <button
                    onClick={() => confirmModeChange(false)}
                    className="w-full py-3 bg-white border border-parchment-200 text-history-blue rounded-lg font-bold hover:bg-parchment-50 transition-colors"
                  >
                    Mégsem
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

