import { redirect } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";
import { loginAdminAction } from "@/lib/admin-actions";
import { getCurrentAdmin } from "@/lib/auth";

type SearchParamsInput = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLoginPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  const query = await Promise.resolve(searchParams ?? {});
  const message = typeof query.error === "string" ? query.error : "";
  const redirectTo = typeof query.next === "string" && query.next.startsWith("/") && !query.next.startsWith("//") ? query.next : "/admin";

  return (
    <PublicShell>
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-xl items-center py-10">
        <Card className="w-full space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <p className="arena-label">Admin</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Entrar no painel</h1>
            <p className="text-sm leading-6 text-slate-600">Acesse para gerenciar torneios, jogadores e resultados.</p>
          </div>

          <form action={loginAdminAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <label className="block space-y-2">
              <span className="arena-label">E-mail</span>
              <input name="email" type="email" autoComplete="email" className="arena-input" placeholder="admin@arenafc.local" />
            </label>

            <label className="block space-y-2">
              <span className="arena-label">Senha</span>
              <input name="password" type="password" autoComplete="current-password" className="arena-input" placeholder="••••••••" />
            </label>

            {message ? <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</p> : null}

            <button type="submit" className="arena-button-primary w-full">
              Entrar
            </button>
          </form>
        </Card>
      </div>
    </PublicShell>
  );
}
