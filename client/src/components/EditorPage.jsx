import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import socket from "../socket";
import Chat from "./Chat";

// Helper to parse bold and backticks inside a single string
function renderFormattedText(text) {
    if (!text) return "";
    
    // First, split by bold markdown "**"
    const boldParts = text.split("**");
    return boldParts.map((boldPart, boldIndex) => {
        const isBold = boldIndex % 2 === 1;
        
        // Second, parse backticks "`" inside this part
        const backtickParts = boldPart.split("`");
        const renderedPart = backtickParts.map((backtickPart, backtickIndex) => {
            const isCode = backtickIndex % 2 === 1;
            if (isCode) {
                return (
                    <code key={backtickIndex} className="bg-[#1C2128] px-1.5 py-0.5 rounded-[6px] text-[#8B5CF6] font-mono text-xs border border-[#30363D]">
                        {backtickPart}
                    </code>
                );
            }
            return backtickPart;
        });

        if (isBold) {
            return (
                <strong key={boldIndex} className="font-bold text-[#E6EDF3]">
                    {renderedPart}
                </strong>
            );
        }
        return renderedPart;
    });
}

// Custom renderer for basic markdown response formatting
function AIResponseDisplay({ text }) {
    if (!text) return null;
    const lines = text.split("\n");
    return (
        <div className="space-y-2 text-[#E6EDF3] text-xs leading-relaxed select-text pb-6">
            {lines.map((line, i) => {
                if (line.startsWith("###")) {
                    return <h3 key={i} className="text-xs font-semibold text-[#E6EDF3] mt-4 mb-1.5 border-b border-[#30363D] pb-1">{renderFormattedText(line.replace("###", "").trim())}</h3>;
                }
                if (line.startsWith("##")) {
                    return <h2 key={i} className="text-sm font-semibold text-[#E6EDF3] mt-4 mb-1.5 border-b border-[#30363D] pb-1">{renderFormattedText(line.replace("##", "").trim())}</h2>;
                }
                if (line.startsWith("#")) {
                    return <h1 key={i} className="text-base font-bold text-[#E6EDF3] mt-4 mb-2">{renderFormattedText(line.replace("#", "").trim())}</h1>;
                }
                if (line.startsWith("-") || line.startsWith("*")) {
                    return (
                        <div key={i} className="flex gap-2 pl-2 mt-1">
                            <span className="text-[#8B5CF6]">•</span>
                            <span>{renderFormattedText(line.substring(1).trim())}</span>
                        </div>
                    );
                }
                if (/^\d+\./.test(line)) {
                    const match = line.match(/^(\d+\.)(.*)/);
                    return (
                        <div key={i} className="flex gap-2 pl-2 mt-1">
                            <span className="text-[#8B5CF6] font-semibold">{match[1]}</span>
                            <span>{renderFormattedText(match[2].trim())}</span>
                        </div>
                    );
                }
                if (line.trim().startsWith("```")) {
                    return null;
                }
                return <p key={i} className="mt-1">{renderFormattedText(line)}</p>;
            })}
        </div>
    );
}

function EditorPage() {
    const { roomId } = useParams();
    const [code, setCode] = useState("// Start Coding Here");
    const username = sessionStorage.getItem("username") || "Anonymous";
    
    // Tab Control state
    const [activeTab, setActiveTab] = useState("chat");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    const [language, setLanguage] = useState("cpp");
    const [sidebarWidth, setSidebarWidth] = useState(340);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = (mouseDownEvent) => {
        setIsResizing(true);
        mouseDownEvent.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (mouseMoveEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - mouseMoveEvent.clientX;
            // Limit width between 250px and 600px
            if (newWidth >= 250 && newWidth <= 600) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        if (isResizing) {
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);
    
    // AI state
    const [aiResponse, setAiResponse] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [autocompleteEnabled, setAutocompleteEnabled] = useState(() => {
        const stored = sessionStorage.getItem("ai_autocomplete_enabled");
        return stored === null ? true : stored === "true";
    });

    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    useEffect(() => {
        socket.emit("join-room", roomId);

        socket.on("receive-code", (newCode) => {
            setCode(newCode);
        });

        socket.on("receive-language", (newLang) => {
            setLanguage(newLang);
        });

        return () => {
            socket.off("receive-code");
            socket.off("receive-language");
        };
    }, [roomId]);

    const handleCodeChange = (value) => {
        setCode(value);

        socket.emit("code-change", {
            roomId,
            code: value,
        });
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        socket.emit("language-change", {
            roomId,
            language: newLang
        });
    };

    // Autocomplete Toggle Handler
    const handleToggleAutocomplete = (enabled) => {
        setAutocompleteEnabled(enabled);
        sessionStorage.setItem("ai_autocomplete_enabled", enabled ? "true" : "false");
    };

    // Monaco Editor mount callback
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        const languages = ["cpp", "python", "javascript", "html", "css", "c", "java"];
        let debounceTimer;

        const provider = {
            provideInlineCompletions: async (model, position, context, token) => {
                const isEnabled = sessionStorage.getItem("ai_autocomplete_enabled") !== "false";
                if (!isEnabled) return;

                const textBeforeCursor = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });
                
                if (!textBeforeCursor.trim()) return;

                const textAfterCursor = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: model.getLineCount(),
                    endColumn: model.getLineMaxColumn(model.getLineCount())
                });

                // Debounce 800ms
                await new Promise((resolve) => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(resolve, 800);
                });

                if (token.isCancellationRequested) return;

                try {
                    const response = await axios.post("http://localhost:8080/api/ai/autocomplete", {
                        textBeforeCursor,
                        textAfterCursor,
                        language: model.getLanguageId()
                    });

                    const suggestion = response.data.suggestion;
                    if (!suggestion) return;

                    return {
                        items: [
                            {
                                insertText: suggestion,
                                range: new monaco.Range(
                                    position.lineNumber,
                                    position.column,
                                    position.lineNumber,
                                    position.column
                                )
                            }
                        ]
                    };
                } catch (error) {
                    console.error("Autocomplete API error:", error);
                    return;
                }
            },
            freeInlineCompletions: () => {}
        };

        const disposables = languages.map((lang) => 
            monaco.languages.registerInlineCompletionsProvider(lang, provider)
        );

        editor.onDidDispose(() => {
            disposables.forEach((d) => d.dispose());
        });
    };

    // AI Action: Explain Code
    const handleExplainCode = async () => {
        if (aiLoading) return;
        setAiLoading(true);
        setAiError("");
        setAiResponse("");
        
        try {
            const response = await axios.post("http://localhost:8080/api/ai/explain", {
                code,
                language: language
            });
            setAiResponse(response.data.explanation);
        } catch (error) {
            setAiError(error.response?.data?.message || "Something went wrong while explaining code.");
        } finally {
            setAiLoading(false);
        }
    };

    // AI Action: Review Code
    const handleReviewCode = async () => {
        if (aiLoading) return;
        setAiLoading(true);
        setAiError("");
        setAiResponse("");
        
        try {
            const response = await axios.post("http://localhost:8080/api/ai/review", {
                code,
                language: language
            });
            setAiResponse(response.data.review);
        } catch (error) {
            setAiError(error.response?.data?.message || "Something went wrong while reviewing code.");
        } finally {
            setAiLoading(false);
        }
    };

    // Download Code local action
    const handleDownloadCode = () => {
        const extensionMap = {
            cpp: "cpp",
            python: "py",
            javascript: "js",
            html: "html",
            css: "css",
            java: "java",
            c: "c"
        };
        const ext = extensionMap[language] || "txt";
        const element = document.createElement("a");
        const file = new Blob([code], { type: "text/plain;charset=utf-8" });
        element.href = URL.createObjectURL(file);
        element.download = `room-${roomId}.${ext}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="flex h-screen bg-[#0D1117] relative overflow-hidden">

            {/* Left Side: Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Editor Header */}
                <div className={`bg-[#161B22] flex justify-between items-center px-6 transition-all duration-300 ease-in-out origin-top flex-shrink-0 ${
                    isHeaderOpen 
                        ? "opacity-100 translate-y-0 h-[56px] border-b border-[#30363D]" 
                        : "opacity-0 -translate-y-full h-0 p-0 border-none overflow-hidden pointer-events-none"
                }`}>
                    <h2 className="text-[#E6EDF3] text-sm font-semibold flex items-center gap-2">
                        <span className="text-[#8B949E] text-xs font-semibold uppercase tracking-wider">Room ID:</span>
                        <span className="text-[#3B82F6] font-semibold">{roomId}</span>
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="ml-2 bg-[#1C2128] border border-[#30363D] text-[#E6EDF3] text-xs font-semibold px-2 py-0.5 rounded-[10px] outline-none cursor-pointer focus:border-[#3B82F6] shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                        >
                            <option value="cpp">C++ (.cpp)</option>
                            <option value="python">Python (.py)</option>
                            <option value="javascript">JavaScript (.js)</option>
                            <option value="html">HTML (.html)</option>
                            <option value="css">CSS (.css)</option>
                            <option value="java">Java (.java)</option>
                            <option value="c">C (.c)</option>
                        </select>
                        <button
                            onClick={handleDownloadCode}
                            className="ml-1 bg-[#1C2128] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] p-1 rounded-[10px] transition-all duration-200 cursor-pointer flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                            title="Download Code to Local System"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8B949E] font-semibold uppercase tracking-wider">User:</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                            {username}
                        </div>
                    </div>
                </div>

                {/* Editor Container (Fills remaining height) */}
                <div className="flex-1 min-h-0 relative">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        options={{
                            inlineSuggest: {
                                enabled: true
                            },
                            quickSuggestions: {
                                other: true,
                                comments: false,
                                strings: false
                            },
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            fontSize: 14,
                            lineHeight: 22,
                            minimap: { enabled: false }
                        }}
                    />
                </div>

            </div>

            {/* Floating Header Toggle Button */}
            <button
                onClick={() => setIsHeaderOpen(!isHeaderOpen)}
                className={`absolute left-1/2 -translate-x-1/2 z-50 
                    bg-[#161B22] hover:bg-[#1C2128] 
                    border border-[#30363D] 
                    text-[#8B949E] hover:text-[#E6EDF3] 
                    rounded-b-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.25)] 
                    transition-all duration-300 ease-in-out cursor-pointer 
                    flex items-center justify-center w-10 h-7 group`}
                style={{
                    top: isHeaderOpen ? "56px" : "0px",
                }}
                title={isHeaderOpen ? "Collapse Header" : "Expand Header"}
            >
                <div className="transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                    {isHeaderOpen ? (
                        // Chevron Up (points up to collapse header inside)
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                    ) : (
                        // Chevron Down (points down to pop header out)
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </button>

            {/* Floating Sidebar Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute top-1/2 -translate-y-1/2 z-50 
                    bg-[#161B22] hover:bg-[#1C2128] 
                    border border-[#30363D] 
                    text-[#8B949E] hover:text-[#E6EDF3] 
                    rounded-l-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.25)] 
                    cursor-pointer flex items-center justify-center h-20 w-7 group ${
                        isResizing ? "" : "transition-all duration-300 ease-in-out"
                    }`}
                style={{
                    right: isSidebarOpen ? `${sidebarWidth}px` : "0px",
                }}
                title={isSidebarOpen ? "Collapse Panel" : "Expand Panel"}
            >
                <div className="transition-transform duration-300 group-hover:scale-110">
                    {isSidebarOpen ? (
                        // Chevron Right (points right to collapse sidebar inside)
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    ) : (
                        // Chevron Left (points left to pop sidebar out)
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    )}
                </div>
            </button>

            {/* Right Side: Tabbed Side Panel (Collapsible with smooth transition) */}
            <div 
                className={`h-screen flex flex-col bg-[#161B22] border-l border-[#30363D] relative flex-shrink-0 ${
                    isResizing ? "" : "transition-all duration-300 ease-in-out"
                } ${
                    isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                style={{
                    width: isSidebarOpen ? `${sidebarWidth}px` : "0px",
                }}
            >
                {/* Resize Handle / Drag Bar */}
                {isSidebarOpen && (
                    <div
                        onMouseDown={startResizing}
                        className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#3B82F6]/50 active:bg-[#3B82F6]/50 z-50 transition-all duration-150 ${
                            isResizing ? "bg-[#3B82F6] w-1.5" : "bg-transparent hover:w-1.5"
                        }`}
                        title="Drag to resize sidebar"
                    />
                )}
                {/* Fixed width content wrapper to prevent element wrapping during animation */}
                <div className="h-full flex flex-col" style={{ width: `${sidebarWidth}px` }}>
                    
                    {/* Tabs Selector Header */}
                    <div className="flex border-b border-[#30363D] bg-[#161B22]">
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`flex-1 py-4 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                activeTab === "chat"
                                    ? "text-[#3B82F6] border-b-2 border-[#3B82F6] bg-[#1C2128]/40"
                                    : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128]/20"
                            }`}
                        >
                            Team Chat
                        </button>
                        <button
                            onClick={() => setActiveTab("ai")}
                            className={`flex-1 py-4 text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === "ai"
                                    ? "text-[#8B5CF6] border-b-2 border-[#8B5CF6] bg-[#1C2128]/40"
                                    : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128]/20"
                            }`}
                        >
                            <svg className={`w-3.5 h-3.5 fill-current ${activeTab === "ai" ? "text-[#8B5CF6]" : "text-[#8B949E]"}`} viewBox="0 0 20 20">
                                <path d="M11.3 1.046A1 1 0 0112 2v6.5h3.5a1 1 0 01.768 1.64l-8 9.5a1 1 0 01-1.536-1.28l1.493-6.36H4.5a1 1 0 01-.768-1.64l8-9.5a1 1 0 011.068-.274z" />
                            </svg>
                            <span>AI</span>
                        </button>
                    </div>

                    {/* Tab Contents */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {activeTab === "chat" ? (
                            <Chat roomId={roomId} isEmbedded={true} />
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0 bg-[#161B22]">
                                {/* AI Co-Pilot Action Buttons */}
                                <div className="p-4 border-b border-[#30363D] bg-[#1C2128]/25 flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExplainCode}
                                            disabled={aiLoading}
                                            className="flex-1 py-2 px-3 rounded-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            💡 Explain Code
                                        </button>
                                        <button
                                            onClick={handleReviewCode}
                                            disabled={aiLoading}
                                            className="flex-1 py-2 px-3 rounded-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            🔍 Review Code
                                        </button>
                                    </div>
                                    
                                    {/* Autocomplete Toggle */}
                                    <div className="flex items-center justify-between p-2.5 bg-[#1C2128] border border-[#30363D] rounded-[12px]">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-[#E6EDF3]">AI Autocomplete</span>
                                            <span className="text-[9px] text-[#8B949E]">Ghost text suggestions as you type</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleAutocomplete(!autocompleteEnabled)}
                                            className={`w-10 h-5.5 rounded-full transition-all duration-200 relative p-0.5 flex items-center cursor-pointer ${
                                                autocompleteEnabled ? "bg-[#8B5CF6]" : "bg-[#30363D]"
                                            }`}
                                        >
                                            <span className={`w-4.5 h-4.5 rounded-full bg-white shadow transform transition-all duration-200 ${
                                                autocompleteEnabled ? "translate-x-4.5" : "translate-x-0"
                                            }`} />
                                        </button>
                                    </div>
                                </div>

                                {/* AI Output Area */}
                                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#30363D]">
                                    {aiLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full text-[#8B949E] gap-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#8B5CF6]"></div>
                                            <p className="text-xs font-medium">AI is thinking...</p>
                                        </div>
                                    ) : aiError ? (
                                        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[12px] text-[#EF4444] text-xs leading-relaxed">
                                            <p className="font-bold">Request Failed</p>
                                            <p className="mt-1">{aiError}</p>
                                        </div>
                                    ) : aiResponse ? (
                                        <AIResponseDisplay text={aiResponse} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-[#8B949E] gap-2">
                                            <svg className="w-8 h-8 opacity-40 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <p className="text-xs font-medium text-[#8B949E]">Click "Explain" or "Review" to get AI insight.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
export default EditorPage;