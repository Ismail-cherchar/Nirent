import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User, Bell } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const NAV_ITEMS = [
  { icon: Home, label: "Accueil", page: "Home" },
  { icon: Search, label: "Recherche", page: "Search" },
  { icon: PlusCircle, label: "Ajouter", page: "AddItem" },
  { icon: MessageCircle, label: "Messages", page: "Messages" },
  { icon: User, label: "Profil", page: "Profile" },
];

const HIDDEN_NAV_PAGES = ["Chat", "AdminPanel", "MapView", "Exchange", "Notifications", "OwnerProfile", "Favorites"];

export default function Layout({ children, currentPageName }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        setCurrentUser(user);
        const messages = await base44.entities.Message.filter({ receiver_email: user.email, read: false });
        setUnreadCount(messages.length);
        const notifs = await base44.entities.Notification.filter({ user_email: user.email, read: false });
        setUnreadNotifs(notifs.length);
      }
    };
    loadUser();
  }, [currentPageName]);

  const showNav = !HIDDEN_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
            {NAV_ITEMS.map(({ icon: Icon, label, page }) => {
              const isActive = currentPageName === page;
              const isAdd = page === "AddItem";
              
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex flex-col items-center justify-center relative transition-all duration-200 ${
                    isAdd ? '' : 'flex-1 py-1'
                  }`}
                >
                  {isAdd ? (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg -mt-4 transition-transform active:scale-95" style={{ background: '#f9b816', boxShadow: '0 4px 16px #f9b81640' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            isActive ? 'text-brand' : 'text-gray-400'
                          }`}
                        />
                        {page === "Messages" && unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] mt-0.5 font-medium ${
                        isActive ? 'text-brand' : 'text-gray-400'
                      }`}>
                        {label}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}