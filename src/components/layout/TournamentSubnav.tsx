import Link from "next/link";
import { cn } from "@/lib/utils";

type Section = "overview" | "players" | "table" | "matches" | "knockout";

interface TournamentSubnavProps {
  basePath: string;
  active: Section;
  includePlayers?: boolean;
  className?: string;
}

const BASE_ITEMS: Array<{ key: Section; label: string; suffix: string }> = [
  { key: "overview", label: "Visão geral", suffix: "" },
  { key: "players", label: "Jogadores", suffix: "/jogadores" },
  { key: "table", label: "Tabela", suffix: "/tabela" },
  { key: "matches", label: "Partidas", suffix: "/partidas" },
  { key: "knockout", label: "Mata-mata", suffix: "/mata-mata" },
];

export function TournamentSubnav({ basePath, active, includePlayers = false, className }: TournamentSubnavProps) {
  const items = includePlayers ? BASE_ITEMS : BASE_ITEMS.filter((item) => item.key !== "players");

  return (
    <nav className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => {
        const href = `${basePath}${item.suffix}`;
        const isActive = item.key === active;

        return (
          <Link
            key={item.key}
            href={href}
            className={isActive ? "arena-button-primary" : "arena-button-secondary"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
