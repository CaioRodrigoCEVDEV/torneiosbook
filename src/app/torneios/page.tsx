import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PublicTournamentCard } from "@/components/tournaments/PublicTournamentCard";
import { getPublicTournaments } from "@/lib/tournament-service";

export default async function TournamentsPage() {
  const tournaments = await getPublicTournaments();

  return (
    <PublicShell>
      <div className="space-y-8 py-8">
        <PageHeader
          eyebrow="Vitrine pública"
          title="Torneios"
          description="Lista de campeonatos publicados para acompanhamento público."
          actions={
            <Link href="/admin/login" className="arena-button-secondary">
              Entrar no admin
            </Link>
          }
        />

        {tournaments.length === 0 ? (
          <EmptyState
            title="Ainda não há torneios publicados"
            description="Quando um torneio estiver marcado como público, ele aparece nesta lista."
            action={
              <Link href="/admin/login" className="arena-button-primary">
                Publicar torneio
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tournaments.map((tournament) => (
              <PublicTournamentCard key={tournament.id} tournament={tournament} href={`/torneios/${tournament.id}`} />
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
