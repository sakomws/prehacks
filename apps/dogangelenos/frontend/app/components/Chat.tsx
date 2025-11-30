"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  sender_name: string;
  sender_type: "customer" | "trainer";
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatProps {
  bookingId: number;
  userEmail: string;
  userName: string;
  userType: "customer" | "trainer";
}

export default function Chat({ bookingId, userEmail, userName, userType }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    fetch(`http://localhost:8000/api/chat/${bookingId}/history`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        // Check for unread messages
        const unread = data.filter(
          (msg: Message) => !msg.read && msg.sender_type !== userType
        ).length;
        setUnreadCount(unread);
      })
      .catch((err) => console.error("Error loading chat history:", err));
  }, [bookingId, userType]);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${bookingId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("✅ Connected to chat");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
      
      // Update unread count if chat is closed and message is from other user
      if (!isOpen && message.sender_email !== userEmail) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("❌ Disconnected from chat");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [bookingId, userEmail, isOpen]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current) return;

    const messageData = {
      sender_email: userEmail,
      sender_name: userName,
      sender_type: userType,
      message: newMessage.trim(),
    };

    wsRef.current.send(JSON.stringify(messageData));
    setNewMessage("");
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mark messages as read when opening chat
  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
    
    fetch(`http://localhost:8000/api/chat/${bookingId}/mark-read?user_email=${userEmail}`, {
      method: "POST",
    });
  };

  return (
    <>
      {/* Chat Button with Pulse Animation */}
      <motion.button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpenChat())}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full p-5 shadow-2xl hover:shadow-pink-500/50 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: unreadCount > 0 ? Infinity : 0, duration: 2 }}
      >
        <div className="relative">
          <span className="text-3xl">💬</span>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </div>
      </motion.button>
      
      {/* Floating Tooltip */}
      <AnimatePresence>
        {!isOpen && (showTooltip || unreadCount > 0) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-24 right-6 z-40 bg-white text-gray-900 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border-2 border-pink-200"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">👋</span>
              <div>
                <p className="font-bold">Need help?</p>
                <p className="text-xs text-gray-600">Chat with our trainers!</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="mt-2 pt-2 border-t border-pink-200">
                <span className="text-pink-500 font-bold text-xs">
                  {unreadCount} new message{unreadCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🐕</span>
                </div>
                <div>
                  <h3 className="font-bold">Dog Angelenos</h3>
                  <p className="text-xs opacity-90 flex items-center">
                    {isConnected ? (
                      <>
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                        Online
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                        Offline
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-4xl mb-2">👋</p>
                  <p className="font-semibold">Welcome to Dog Angelenos!</p>
                  <p className="text-sm mt-1">Start a conversation with our trainers</p>
                </div>
              )}
              {messages.map((msg) => {
                const isOwnMessage = msg.sender_type === userType;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-pink-500 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {msg.sender_name}
                      </p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  disabled={!isConnected}
                />
                <button
                  onClick={sendMessage}
                  disabled={!isConnected || !newMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Send
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Connecting to chat server...
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
