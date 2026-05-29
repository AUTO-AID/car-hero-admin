"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users, Wrench, Crown, History, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const RECENT_NOTIFS = [
  { id: 1, title: "تم الموافقة على طلبك", body: "تمت الموافقة على طلب الصيانة #ORD-10023 وسيتم التواصل معك قريباً.", type: "order", target: "مستخدم محدد", time: new Date(Date.now() - 5 * 60 * 1000) },
  { id: 2, title: "🚀 عرض نهاية الأسبوع", body: "احصل على خصم 20% على خدمات الغسيل الشامل باستخدام الكود WEEKEND20", type: "promo", target: "كل العملاء", time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 3, title: "تحديث شروط الخدمة", body: "تم تحديث سياسة الخصوصية وشروط الاستخدام. يرجى المراجعة.", type: "system", target: "كل المزودين", time: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: 4, title: "مرحباً بك في Premium 👑", body: "تم ترقية حسابك إلى الباقة الذهبية بنجاح. استمتع بمزاياك الحصرية!", type: "subscription", target: "مشتركو Premium", time: new Date(Date.now() - 48 * 60 * 60 * 1000) },
];

export default function NotificationsPage() {
  const [target, setTarget] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!title.trim() || !body.trim()) { 
      toast.error("يرجى إدخال عنوان ومحتوى الإشعار"); 
      return; 
    }
    
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`✅ تم الإرسال بنجاح إلى: ${
        target === "all" ? "جميع المستخدمين" : 
        target === "premium" ? "مشتركي Premium" : 
        target === "providers" ? "مزودي الخدمة" : "العملاء العاديين"
      }`);
      setTitle(""); 
      setBody("");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center sm:text-right">
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">إدارة الإشعارات (FCM)</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">إرسال إشعارات دفع (Push Notifications) للمستخدمين والمزودين عبر Firebase.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Broadcast Form */}
        <Card className="xl:col-span-5 p-6 sm:p-8 bg-card border-border/40 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/30">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-sm shadow-primary/10">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">إرسال إشعار جديد</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">يصل الإشعار فوراً إلى هواتف المستهدفين</p>
            </div>
          </div>
          
          <div className="space-y-5 relative">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">الفئة المستهدفة</Label>
              <Select value={target} onValueChange={(v) => setTarget(v || "all")}>
                <SelectTrigger className="bg-secondary/40 border-border/50 text-sm h-11 rounded-xl focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50 rounded-xl">
                  <SelectItem value="all" className="cursor-pointer py-2.5 text-xs"><div className="flex items-center gap-2"><GlobeIcon className="w-3.5 h-3.5 text-blue-400" />الجميع (عملاء ومزودين)</div></SelectItem>
                  <SelectItem value="users" className="cursor-pointer py-2.5 text-xs"><div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-emerald-400" />العملاء فقط</div></SelectItem>
                  <SelectItem value="premium" className="cursor-pointer py-2.5 text-xs"><div className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" />مشتركو Premium فقط</div></SelectItem>
                  <SelectItem value="providers" className="cursor-pointer py-2.5 text-xs"><div className="flex items-center gap-2"><Wrench className="w-3.5 h-3.5 text-violet-400" />مزودو الخدمة فقط</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">عنوان الإشعار</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="مثال: 🚀 خصم خاص بمناسبة العيد"
                className="h-11 rounded-xl bg-secondary/40 border-border/50 text-sm placeholder:text-muted-foreground/40 focus-visible:ring-primary/20" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">نص الإشعار (محتوى الرسالة)</Label>
              <Textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder="اكتب رسالتك هنا..."
                className="bg-secondary/40 border-border/50 text-sm resize-none rounded-xl min-h-[120px] placeholder:text-muted-foreground/40 focus-visible:ring-primary/20" 
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Sparkles className="w-3 h-3" /> يدعم الإيموجي</span>
                <span className={`text-[10px] font-mono ${body.length > 150 ? "text-amber-400" : "text-muted-foreground/50"}`}>{body.length}/200</span>
              </div>
            </div>
            
            <Button 
              onClick={handleSend} 
              disabled={sending}
              className="w-full h-12 gap-2 text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all rounded-xl mt-4"
            >
              {sending ? (
                <>جاري الإرسال...</>
              ) : (
                <><Send className="w-4 h-4" /> إرسال الإشعار الآن</>
              )}
            </Button>
          </div>
        </Card>

        {/* History */}
        <Card className="xl:col-span-7 bg-card border-border/40 overflow-hidden flex flex-col h-[600px] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="p-5 border-b border-border/30 bg-secondary/10 flex items-center gap-3 shrink-0">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-white text-sm">سجل الإشعارات المرسلة</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="divide-y divide-border/10">
              {RECENT_NOTIFS.map((n, i) => (
                <div key={n.id} className="p-4 hover:bg-secondary/20 transition-colors rounded-xl animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-foreground truncate">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                          {formatDistanceToNow(n.time, { locale: ar, addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">{n.body}</p>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-secondary/40 text-muted-foreground border-border/40 text-[9px] px-2 py-0">المستهدف: {n.target}</Badge>
                        <Badge variant="outline" className={`text-[9px] px-2 py-0 border-transparent ${
                          n.type === 'promo' ? 'bg-rose-500/10 text-rose-400' :
                          n.type === 'subscription' ? 'bg-amber-500/10 text-amber-400' :
                          n.type === 'system' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {n.type === 'promo' ? 'ترويجي' : n.type === 'subscription' ? 'اشتراكات' : n.type === 'system' ? 'نظام' : 'طلبات'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
