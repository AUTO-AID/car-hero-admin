"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/application/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { admin, isLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && admin) {
      router.replace("/");
    }
  }, [admin, isLoading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      toast.success("تم تسجيل الدخول بنجاح");
      router.replace("/");
    } catch (error: unknown) {
      const message = getLoginErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-bg-login flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 grid-pattern opacity-[0.035]" />

      <section className="relative w-full max-w-[430px] animate-fade-in-up">
        <div className="mb-7 text-center">
          <img
            src="/logo_carHero.png"
            alt="Car Hero"
            className="mx-auto mb-4 h-auto w-[220px] object-contain drop-shadow-[0_10px_28px_rgba(143,92,177,0.35)]"
          />
          <p className="mt-2 text-sm text-muted-foreground">تسجيل دخول لوحة الإدارة</p>
        </div>

        <div className="glass-strong rounded-xl p-7 shadow-2xl shadow-black/20">
          <div className="mb-6 flex items-center gap-2 border-b border-border/30 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">دخول المسؤولين فقط</p>
              <p className="text-xs text-muted-foreground">يتم التحقق من حسابات جدول admins في الـ backend</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/55" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@carhero.com"
                  autoComplete="email"
                  dir="ltr"
                  className="h-11 rounded-lg border-border/50 bg-secondary/60 pr-10 text-sm placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/55" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-11 rounded-lg border-border/50 bg-secondary/60 px-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground/55 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg text-sm font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/50">
          CarHero Admin Dashboard
        </p>
      </section>
    </main>
  );
}

function getLoginErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message[0] ?? "بيانات الدخول غير صحيحة";
    if (message) return message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "بيانات الدخول غير صحيحة";
}
