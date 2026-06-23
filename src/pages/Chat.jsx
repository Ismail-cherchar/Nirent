import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Chat() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get("conversation");
  const withEmail = urlParams.get("with");
  const withName = urlParams.get("withName") || withEmail;
  const itemId = urlParams.get("itemId");
  const itemTitle = urlParams.get("itemTitle");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);

      const msgs = await base44.entities.Message.filter(
        { conversation_id: conversationId },
        "created_date",
        100
      );
      setMessages(msgs);

      // Mark as read
      const unread = msgs.filter((m) => m.receiver_email === u.email && !m.read);
      for (const m of unread) {
        await base44.entities.Message.update(m.id, { read: true });
      }
    };
    load();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to new messages
  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        if (event.type === "create") {
          setMessages((prev) => [...prev, event.data]);
          if (event.data.receiver_email === user?.email) {
            base44.entities.Message.update(event.data.id, { read: true });
          }
        }
      }
    });
    return unsub;
  }, [conversationId, user?.email]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    await base44.entities.Message.create({
      conversation_id: conversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: withEmail,
      receiver_name: withName,
      text: newMessage.trim(),
      item_id: itemId || "",
      item_title: itemTitle || "",
    });
    // Notify receiver
    await base44.entities.Notification.create({
      user_email: withEmail,
      title: `Message de ${user.full_name}`,
      message: newMessage.trim().slice(0, 80),
      type: "message",
      link: `/Chat?conversation=${conversationId}&with=${user.email}&withName=${user.full_name}`,
    });
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#f9b816' }}>
          {withName?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-semibold text-sm">{withName}</p>
          {itemTitle && <p className="text-[10px]" style={{ color: '#f9b816' }}>{itemTitle}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_email === user?.email;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? "text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                }`}
                style={isMine ? { background: '#f9b816' } : {}}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-gray-300"}`}>
                  {format(new Date(msg.created_date), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Écrire un message..."
          className="rounded-full bg-gray-50 border-gray-200"
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          size="icon"
          className="rounded-full w-10 h-10 flex-shrink-0 border-0"
          style={{ background: '#f9b816' }}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}