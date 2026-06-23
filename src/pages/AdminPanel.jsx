import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Package, AlertTriangle, BarChart3, Search, Trash2, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [searchItem, setSearchItem] = useState("");

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      if (u.role !== "admin") { navigate(createPageUrl("Home")); return; }
      const [allUsers, allItems, allReports, allBookings] = await Promise.all([
        base44.entities.User.list("-created_date", 50),
        base44.entities.Item.list("-created_date", 50),
        base44.entities.Report.filter({ status: "open" }, "-created_date", 20),
        base44.entities.Booking.list("-created_date", 50),
      ]);
      setUsers(allUsers); setItems(allItems); setReports(allReports); setBookings(allBookings);
      setLoading(false);
    };
    load();
  }, []);

  const deleteItem = async (id) => {
    await base44.entities.Item.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const resolveReport = async (id) => {
    await base44.entities.Report.update(id, { status: "resolved" });
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const totalRevenue = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const filteredUsers = users.filter(u =>
    !searchUser || u.full_name?.toLowerCase().includes(searchUser.toLowerCase()) || u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );
  const filteredItems = items.filter(i =>
    !searchItem || i.title?.toLowerCase().includes(searchItem.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-5 space-y-4">
      <Skeleton className="h-10 w-48" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Administration</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <Users className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-xs text-gray-400">Utilisateurs</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <Package className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold">{items.length}</p>
          <p className="text-xs text-gray-400">Annonces</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <BarChart3 className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold">€{totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-400">Chiffre d'affaires</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold">{reports.length}</p>
          <p className="text-xs text-gray-400">Signalements ouverts</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="px-4">
        <TabsList className="w-full bg-gray-100 rounded-xl h-10">
          <TabsTrigger value="users" className="flex-1 text-xs rounded-lg">Utilisateurs</TabsTrigger>
          <TabsTrigger value="items" className="flex-1 text-xs rounded-lg">Annonces</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 text-xs rounded-lg">Signalements</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-3 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Rechercher un utilisateur..." value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)} className="pl-9 rounded-xl" />
          </div>
          {filteredUsers.map(u => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{u.full_name || "Sans nom"}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <Badge className={u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}>
                {u.role || "user"}
              </Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="items" className="space-y-3 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Rechercher une annonce..." value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)} className="pl-9 rounded-xl" />
          </div>
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.photos?.[0] && <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.owner_name} · €{item.price_per_day}/j</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-3 py-3">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-amber-200 mx-auto" />
              <p className="text-gray-400 text-sm mt-2">Aucun signalement ouvert</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-red-100 text-red-700 text-[10px] rounded-full mb-1">{report.type}</Badge>
                    <p className="text-sm">{report.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Par {report.reporter_name}</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => resolveReport(report.id)}>
                    Résoudre
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}