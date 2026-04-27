import { useState, useRef, useEffect } from "react";
import { Send, Trash2, LibraryBig, ShieldAlert, X, Menu, CheckCircle2, XCircle, BrainCircuit, AlertTriangle } from "lucide-react";
import { ModeId, MODES, TOPICS, AppMode, GENERAL_SYSTEM_INSTRUCTION, Difficulty } from "./constants";
import { sendMessageToGemini } from "./lib/gemini";
import { ChatMessage } from "./components/ChatMessage";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { checkUserInputSafety, buildPedagogicalSystemInstruction } from "./lib/safety";
import { QuizData, QuizQuestion, parseQuizFromResponse } from "./lib/quiz-parser";

import { MobileHeader } from "./components/MobileHeader";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { ResponsiveChatInput } from "./components/ResponsiveChatInput";

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
  const [sourceText, setSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingModeId, setPendingModeId] = useState<ModeId | null>(null);
  
  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMode = MODES[activeModeId];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleModeChange = (id: ModeId) => {
    if (id === activeModeId) return;
    
    if (messages.length > 0) {
      setPendingModeId(id);
    } else {
      setActiveModeId(id);
      setSourceText('');
    }
  };

  const confirmModeChange = (shouldDelete: boolean) => {
    if (pendingModeId) {
      const targetId = pendingModeId;
      setActiveModeId(targetId);
      setSourceText('');
      
      if (shouldDelete) {
        setMessages([]);
        setUserAnswers({});
        setSubmittedQuizzes(new Set());
      }
      setPendingModeId(null);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  const handleTopicClick = (topicQuestion: string) => {
    handleSend(topicQuestion);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let finalUserText = text.trim();

    if (activeModeId === "forras" && sourceText.trim()) {
      finalUserText = `Elemzendő forrásszöveg:\n"${sourceText.trim()}"\n\nKérdésem a forrással kapcsolatban: ${text.trim()}`;
    }

    const guard = checkUserInputSafety(finalUserText);

    if (!guard.allowed) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `⚠️ ${guard.warning}`,
        },
      ]);
      return;
    }

    const newMessage: Message = {
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => {
        return {
          role: m.role,
          parts: [
            {
              text: m.content,
            },
          ],
        };
      }) as {
        role: "user" | "model";
        parts: [{ text: string }];
      }[];

      const modeInstruction =
        activeModeId === "kviz"
          ? `${activeMode.systemInstruction}\n\nVálasztott nehézségi szint: ${quizDifficulty}`
          : activeMode.systemInstruction;

      const systemInstruction = buildPedagogicalSystemInstruction({
        generalInstruction: GENERAL_SYSTEM_INSTRUCTION,
        modeTitle: activeMode.title,
        modeInstruction,
      });

      const responseText = await sendMessageToGemini(
        history,
        finalUserText,
        systemInstruction
      );

      let finalResponse = responseText;
      let quizData: QuizData | undefined;

      if (activeModeId === "kviz") {
        const parsedQuiz = parseQuizFromResponse(responseText);
        finalResponse = parsedQuiz.readableText;
        quizData = parsedQuiz.quizData;
      }

      if (activeModeId === "vazlat") {
        finalResponse +=
          "\n\n> ⚠️ **Emlékeztető:** Ez csak tanulási vázlat. A folyószöveget neked kell önállóan megírni. Az önálló munkát a tanár értékeli, nem az AI által adott szöveget.";
      }

      const modelMessage: Message = {
        role: "model",
        content: finalResponse,
        quizData,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Válaszgenerálási hiba:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ismeretlen hiba történt.";

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "Hiba történt a válasz generálása során.\n\n" +
            `Részlet: ${errorMessage}\n\n` +
            "Ellenőrizd az AI Studio Secrets beállításait és próbáld újra.",
        },
      ]);
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
    <div className="flex flex-col min-h-dvh h-dvh overflow-hidden text-history-text font-sans bg-parchment-50">
      <MobileHeader activeModeId={activeModeId} />

      {/* Desktop Header */}
      <header className="hidden md:flex shrink-0 h-20 bg-history-blue text-white items-center justify-between px-8 border-b-4 border-gold-600 z-30">
        <div className="flex items-center gap-3">
          <LibraryBig size={28} className="text-gold-500" />
          <div>
            <h1 className="text-2xl font-display font-bold text-gold-500">Történelem Tanulótárs</h1>
            <h2 className="text-[10px] uppercase tracking-widest opacity-80">Érettségi-felkészítő asszisztens</h2>
          </div>
        </div>
        
        <div className="text-right max-w-xs">
          <p className="text-[10px] leading-tight italic opacity-90 text-gold-200">
            NAT 2020 • 2024-es követelmények
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar: Mode Selector */}
        <aside className="hidden md:flex w-64 shrink-0 bg-parchment-100 border-r border-parchment-200 flex-col p-4 space-y-2 overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <main className="flex flex-col flex-1 min-w-0 bg-white relative shadow-inner z-10 md:rounded-tl-3xl">
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold-500 text-burgundy-800 shadow-xl mx-auto"
                  >
                    <activeMode.icon size={40} />
                  </motion.div>
                  <h3 className="font-display text-3xl font-bold text-burgundy-800">
                    {activeMode.title}
                  </h3>
                  <p className="text-history-subtle max-w-md mx-auto leading-relaxed font-medium">
                    {activeMode.description}
                  </p>
                  
                  {activeModeId === 'kviz' && (
                    <div className="flex flex-col items-center gap-3 mt-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-history-blue/60">Nehézségi szint</span>
                      <div className="flex gap-2 p-1.5 bg-parchment-200/50 rounded-2xl border border-parchment-300">
                        {(['könnyű', 'közepes', 'nehéz'] as Difficulty[]).map((level) => (
                          <button
                            key={level}
                            onClick={() => setQuizDifficulty(level)}
                            className={cn(
                              "px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider",
                              quizDifficulty === level 
                                ? "bg-burgundy-800 text-white shadow-lg scale-105" 
                                : "text-history-blue/50 hover:bg-parchment-300"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-full space-y-8 text-left">
                  <div className="max-w-lg mx-auto">
                    <p className="text-[10px] font-black text-history-blue/40 uppercase tracking-[0.2em] text-center mb-4">
                      Válassz kiemelt témát
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                      {TOPICS.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicClick(topic.question)}
                          className="px-4 py-2 rounded-xl bg-history-blue text-gold-500 text-xs font-black border border-gold-600/20 hover:bg-burgundy-800 hover:text-white hover:border-gold-500 transition-all shadow-md active:scale-95"
                        >
                          {topic.label}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] font-black text-history-blue/40 uppercase tracking-[0.2em] text-center mb-4">
                      Vagy próbálj egy példát
                    </p>
                    <div className="grid gap-3">
                      {activeMode.prompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePromptClick(prompt)}
                          className="text-left px-5 py-4 rounded-2xl bg-parchment-25 border border-parchment-200 hover:bg-white hover:border-gold-500 transition-all group shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                          <p className="text-sm text-history-text group-hover:text-history-blue font-serif italic leading-relaxed">"{prompt}"</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {activeModeId === 'forras' && (
                  <div className="w-full max-w-lg mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <label className="text-[10px] font-black text-history-blue/40 uppercase tracking-[0.2em] block text-center">
                      Forrásszöveg beillesztése
                    </label>
                    <textarea 
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      placeholder="Ide másold a történelmi forrást..."
                      className="w-full h-48 p-5 bg-white border-2 border-parchment-200 rounded-3xl text-sm font-serif focus:outline-none focus:border-gold-600 resize-none shadow-xl transition-all"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8 pb-12">
                {activeModeId === 'forras' && sourceText && (
                  <div className="mb-10 p-5 bg-parchment-50 border-2 border-dashed border-parchment-300 rounded-3xl relative group">
                    <div className="absolute -top-3 left-6 bg-parchment-100 px-3 py-0.5 rounded-full text-[10px] font-black text-burgundy-800 uppercase tracking-widest border border-parchment-300">
                      Aktuális forrás
                    </div>
                    <p className="text-xs font-serif text-history-subtle italic line-clamp-2 leading-relaxed">"{sourceText}"</p>
                    <button 
                      onClick={() => setMessages([])}
                      className="absolute -bottom-3 right-6 bg-white border border-parchment-200 px-3 py-1 rounded-full text-[9px] font-black uppercase text-history-blue hover:bg-parchment-100 transition-colors shadow-sm"
                    >
                      Forrás módosítása
                    </button>
                  </div>
                )}

                {messages.map((m, idx) => (
                  <div key={idx} className={cn("relative", m.role === 'model' && "pb-4")}>
                    <ChatMessage message={m.content} isUser={m.role === 'user'} />
                    
                    {m.role === 'model' && m.quizData && (
                      <div className="mt-6 md:ml-12 bg-white rounded-3xl border border-parchment-300 shadow-2xl overflow-hidden">
                        <div className="bg-parchment-100 p-5 border-b border-parchment-200">
                          <h3 className="font-display font-bold text-burgundy-800 flex items-center gap-3">
                             <BrainCircuit size={24} className="text-gold-600" />
                             Mérd le a tudásod!
                          </h3>
                        </div>
                        <div className="p-6 md:p-8 space-y-12">
                          {m.quizData.questions.map((q, qIdx) => {
                            const quizKey = `${idx}-${qIdx}`;
                            const userAnswer = userAnswers[quizKey];
                            
                            return (
                              <div key={qIdx} className="space-y-5">
                                <p className="font-serif text-xl text-history-text font-medium leading-normal">{qIdx + 1}. {q.question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {q.options.map((option, optIdx) => {
                                    const isCorrect = optIdx === q.correctIndex;
                                    const isUserSelection = userAnswer === optIdx;
                                    const isAnswered = userAnswer !== undefined;
                                    
                                    let btnStyles = "text-left px-5 py-4 rounded-2xl border-2 transition-all flex items-start justify-between group h-full ";
                                    
                                    if (isAnswered) {
                                      if (isCorrect) {
                                        btnStyles += "bg-green-50 border-green-500 text-green-800 font-bold shadow-sm";
                                      } else if (isUserSelection) {
                                        btnStyles += "bg-red-50 border-red-500 text-red-800 font-bold shadow-sm";
                                      } else {
                                        btnStyles += "bg-parchment-50 border-parchment-200 text-history-subtle opacity-50";
                                      }
                                    } else {
                                      btnStyles += "bg-white border-parchment-200 hover:border-gold-500 text-history-text shadow-sm hover:shadow-md active:scale-[0.97]";
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        onClick={() => handleQuizAnswer(idx, qIdx, optIdx)}
                                        disabled={isAnswered}
                                        className={btnStyles}
                                      >
                                        <div className="flex gap-4">
                                          <span className={cn(
                                            "shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black",
                                            isAnswered && isCorrect ? "bg-green-500 text-white" : "bg-parchment-200 text-history-blue/40"
                                          )}>
                                            {['A', 'B', 'C', 'D'][optIdx]}
                                          </span>
                                          <span className="text-sm leading-tight">{option}</span>
                                        </div>
                                        {isAnswered && isCorrect && <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />}
                                        {isAnswered && isUserSelection && !isCorrect && <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />}
                                      </button>
                                    );
                                  })}
                                </div>
                                {userAnswer !== undefined && (
                                  <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                      "p-4 rounded-2xl text-sm font-serif italic border-l-4",
                                      userAnswer === q.correctIndex ? "bg-green-50 text-green-900 border-green-500" : "bg-red-50 text-red-900 border-red-500"
                                    )}
                                  >
                                    <div className="flex items-start gap-3">
                                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                      <p className="leading-relaxed">
                                        <span className="font-bold uppercase tracking-widest text-[10px] block mb-1">Magyarázat</span>
                                        {q.explanation}
                                      </p>
                                    </div>
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
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-history-red text-white flex-shrink-0 flex items-center justify-center font-black text-xs shadow-lg animate-pulse">
                      TT
                    </div>
                    <div className="max-w-[85%] bg-white border border-parchment-200 p-5 rounded-2xl rounded-tl-none shadow-xl flex items-center">
                      <div className="flex items-center gap-1.5 h-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-history-red/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-history-red/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-history-red/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-20" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t border-parchment-200 bg-parchment-25/80 backdrop-blur-md p-4 md:p-6 pb-safe-area z-20">
            <div className="max-w-3xl mx-auto">
              {activeModeId === 'kviz' && messages.length > 0 && (
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-[10px] font-black text-history-blue/40 uppercase tracking-widest">Gyakorlás szintje</span>
                  <div className="flex gap-1.5 p-1 bg-parchment-200/50 rounded-xl border border-parchment-300">
                    {(['könnyű', 'közepes', 'nehéz'] as Difficulty[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setQuizDifficulty(level)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all tracking-wider",
                          quizDifficulty === level 
                            ? "bg-burgundy-800 text-white shadow-md scale-105" 
                            : "text-history-blue/50 hover:bg-parchment-300"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <ResponsiveChatInput 
                onSend={handleSend}
                isLoading={isLoading}
                placeholder={activeModeId === 'forras' ? "Mi a kérdésed a forrással kapcsolatban?" : "Kérdezz a tananyagról..."}
              />
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav activeModeId={activeModeId} onModeChange={handleModeChange} />

      {/* Mode Change Modal */}
      <AnimatePresence>
        {pendingModeId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingModeId(null)}
              className="absolute inset-0 bg-history-blue/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-parchment-200 overflow-hidden"
            >
              <div className="bg-parchment-50 p-6 border-b border-parchment-200 flex justify-between items-center">
                <h3 className="font-display font-black text-burgundy-800 uppercase tracking-wider">Új korszak kezdete</h3>
                <button 
                  onClick={() => setPendingModeId(null)}
                  className="w-8 h-8 rounded-full bg-parchment-200 flex items-center justify-center text-history-blue/50 hover:text-burgundy-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-8">
                <p className="text-history-text font-serif text-lg leading-relaxed mb-10 text-center">
                  Új tanulási módot választottál. Lezárjuk a jelenlegi beszélgetést?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => confirmModeChange(true)}
                    className="w-full py-4 bg-history-red text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-history-red/30 active:scale-95 transition-all"
                  >
                    Igen, tiszta lap
                  </button>
                  <button
                    onClick={() => confirmModeChange(false)}
                    className="w-full py-4 bg-parchment-100 text-history-blue rounded-2xl font-black uppercase tracking-widest hover:bg-parchment-200 active:scale-95 transition-all"
                  >
                    Maradjon meg
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

