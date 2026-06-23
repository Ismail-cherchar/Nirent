import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageCircle, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);

      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ sender_email: u.email }, "-created_date", 100),
        base44.entities.Message.filter({ receiver_email: u.email }, "-created_date", 100),
      ]);

      const allMessages = [...sent, ...received].sort(
        (a, b) => new Date(b.created_date) - new Date(a.created_date)
      );

      const convMap = {};
      allMessages.forEach((msg) => {
        if (!convMap[msg.conversation_id]) {
          const otherEmail = msg.sender_email === u.email ? msg.receiver_email : msg.sender_email;
          const otherName = msg.sender_email === u.email ? msg.receiver_name : msg.sender_name;
          convMap[msg.conversation_id] = {
            id: msg.conversation_id,
            otherEmail,
            otherName: otherName || otherEmail,
            lastMessage: msg.text,
            lastDate: msg.created_date,
            unread: msg.receiver_email === u.email && !msg.read,
            itemTitle: msg.item_title,
          };
        }
      });

      setConversations(Object.values(convMap));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      </div>

      {loading ? (
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3 mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm">Aucun message pour l'instant</p>
          <p className="text-gray-300 text-xs mt-1">Parcourez les annonces pour contacter des loueurs</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              to={createPageUrl(`Chat?conversation=${conv.id}&with=${conv.otherEmail}&withName=${conv.otherName}`)}
              className="flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: '#f9b816' }}>
                {conv.otherName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold truncate ${conv.unread ? "text-gray-900" : "text-gray-700"}`}>
                    {conv.otherName}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    {format(new Date(conv.lastDate), "MMM d")}
                  </span>
                </div>
                {conv.itemTitle && (
                  <p className="text-[10px] font-medium truncate" style={{ color: '#f9b816' }}>{conv.itemTitle}</p>
                )}
                <p className={`text-xs truncate mt-0.5 ${conv.unread ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread && (
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#f9b816' }} />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}