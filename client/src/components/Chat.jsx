import { useState, useEffect, useRef } from "react";
import socket from "../socket";

function Chat({ roomId, isEmbedded = false }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const username = sessionStorage.getItem("username") || "Anonymous";

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log("Chat Component Loaded");

        socket.on("receive-message", (data) => {
            setMessages((prev) => [
                ...prev,
                data,
            ]);
        });

        return () => {
            socket.off("receive-message");
        };
    }, []);

    const sendMessage = () => {
        if (!message.trim()) return;

        const msgData = {
            roomId,
            sender: username,
            message,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [
            ...prev,
            msgData,
        ]);

        socket.emit("send-message", msgData);
        setMessage("");
    };

    // Helper to get initials from a name
    const getInitials = (name) => {
        if (!name) return "AN";
        const parts = name.trim().split(" ");
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    // Helper to assign collaboration blue/cyan shade colors to sender names
    const getUserColor = (name) => {
        const colors = [
            "text-[#3B82F6]",
            "text-sky-450",
            "text-blue-400",
            "text-cyan-400",
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Format ISO string to HH:MM AM/PM
    const formatTime = (isoString) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "";
        }
    };

    return (
        <div className={isEmbedded ? "flex flex-col flex-1 min-h-0 bg-[#161B22]" : "w-[340px] h-screen flex flex-col bg-[#161B22] border-l border-[#30363D] relative"}>
            
            {/* Header */}
            <div className="p-4 border-b border-[#30363D] bg-[#161B22] flex flex-col gap-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
                            Team Chat
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                            <p className="text-[11px] text-[#8B949E] font-medium">Active Session</p>
                        </div>
                    </div>
                    <div className="px-2 py-0.5 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[11px] font-semibold text-[#E6EDF3]">
                        Room: {roomId}
                    </div>
                </div>

                {/* User Info Bar */}
                <div className="flex items-center gap-2.5 p-2 bg-[#1C2128] border border-[#30363D] rounded-[12px]">
                    <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#3B82F6] text-white font-bold text-xs">
                        {getInitials(username)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-[#8B949E] font-medium uppercase tracking-wider">Chatting As</span>
                        <span className="text-xs font-semibold text-[#E6EDF3] leading-tight">{username}</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-[#30363D]">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#8B949E] gap-2">
                        <svg className="w-6 h-6 opacity-40 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-[11px] font-medium text-[#8B949E]">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isSelf = msg.sender === username;
                        return (
                            <div
                                key={index}
                                className={`flex gap-2 max-w-[85%] animate-message ${
                                    isSelf ? "self-end flex-row-reverse" : "self-start"
                                }`}
                            >
                                {/* Message Sender Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-[10px] border flex items-center justify-center text-xs font-bold ${
                                    isSelf 
                                        ? "bg-[#3B82F6] border-[#30363D] text-white" 
                                        : "bg-[#1C2128] border-[#30363D] text-[#E6EDF3]"
                                }`}>
                                    {getInitials(msg.sender)}
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    {/* Sender Name */}
                                    <span className={`text-[11px] font-bold ${
                                        isSelf ? "text-[#3B82F6] text-right" : getUserColor(msg.sender)
                                    }`}>
                                        {msg.sender}
                                    </span>
                                    
                                    {/* Message Bubble */}
                                    <div
                                        className={`p-2.5 rounded-[12px] text-xs break-words leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${
                                            isSelf
                                                ? "bg-[#2563EB] text-white"
                                                : "bg-[#1F2937] text-[#E6EDF3] border border-[#30363D]/40"
                                        }`}
                                    >
                                        <p>{msg.message}</p>
                                    </div>
                                    
                                    {/* Timestamp */}
                                    {msg.timestamp && (
                                        <span className={`block text-[12px] mt-0.5 text-[#8B949E] ${
                                            isSelf ? "text-right" : "text-left"
                                        }`}>
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-[#30363D] bg-[#161B22] flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 rounded-[10px] bg-[#1C2128] border border-[#30363D] text-[#E6EDF3] placeholder-[#8B949E] outline-none transition-all duration-200 focus:border-[#3B82F6] text-xs"
                    />

                    <button
                        onClick={sendMessage}
                        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white p-2.5 rounded-[10px] transition-all duration-200 flex items-center justify-center cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                        title="Send Message"
                    >
                        <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>

        </div>
    );
}

export default Chat;