import { useState } from "react";
import { Space, Skeleton, Select, Input } from "antd";
import StatsMatchCard from "./StatsMatchCard";
import { Match } from "../types/types";
import dayjs from "dayjs";
import "./MatchStats.css";

const MATCH_STATUSES = {
  UPCOMING: "Предстоящий" as const,
  IN_PROGRESS: "Идет" as const,
  FINISHED: "Завершен" as const,
};

interface MatchStatsProps {
  matches: Match[];
  theme: "light" | "dark";
  contentLoading: boolean;
  viewedComponents: {
    matches: boolean;
    "match-table": boolean;
    "match-calendar": boolean;
    "match-stats": boolean;
    tournaments: boolean;
  };
  onEdit: (match: Match) => void;
}

const MatchStats: React.FC<MatchStatsProps> = ({
  matches,
  theme,
  contentLoading,
  viewedComponents,
  onEdit,
}) => {
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filterMatches = () => {
    let filtered = matches.filter(
      (match) => match.status === MATCH_STATUSES.IN_PROGRESS || match.status === MATCH_STATUSES.FINISHED
    );

    // Временной фильтр
    const now = dayjs();
    if (timeFilter === "day") {
      filtered = filtered.filter((match) => dayjs(match.date).isAfter(now.subtract(1, "day")));
    } else if (timeFilter === "week") {
      filtered = filtered.filter((match) => dayjs(match.date).isAfter(now.subtract(1, "week")));
    } else if (timeFilter === "month") {
      filtered = filtered.filter((match) => dayjs(match.date).isAfter(now.subtract(1, "month")));
    }

    // Поиск по командам
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (match) =>
          match.team1.toLowerCase().includes(query) ||
          match.team2.toLowerCase().includes(query)
      );
    }

    // Сортировка
    if (sortOrder === "scoreDesc") {
      filtered = filtered.sort((a, b) => (b.score1 + b.score2) - (a.score1 + a.score2));
    } else if (sortOrder === "scoreAsc") {
      filtered = filtered.sort((a, b) => (a.score1 + a.score2) - (b.score1 + b.score2));
    }

    return filtered;
  };

  const statsMatches = filterMatches();

  return (
    <div className={`match-stats-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      <Space direction="horizontal" size="middle" style={{ marginBottom: 16, width: "100%" }}>
        <Select
          value={timeFilter}
          onChange={setTimeFilter}
          style={{ width: 160 }}
          options={[
            { value: "all", label: "Все матчи" },
            { value: "day", label: "За сутки" },
            { value: "week", label: "За неделю" },
            { value: "month", label: "За месяц" },
          ]}
        />
        <Select
          value={sortOrder}
          onChange={setSortOrder}
          style={{ width: 200 }}
          options={[
            { value: "default", label: "По умолчанию" },
            { value: "scoreDesc", label: "По убыванию счёта" },
            { value: "scoreAsc", label: "По возрастанию счёта" },
          ]}
        />
        <Input.Search
          placeholder="Поиск по командам"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 200 }}
        />
      </Space>
      {!viewedComponents["match-stats"] && contentLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : statsMatches.length > 0 ? (
        <div className="matches-grid">
          {statsMatches.map((match) => (
            <StatsMatchCard key={match.id} match={match} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <p>Нет действующих или завершенных матчей</p>
      )}
    </div>
  );
};

export default MatchStats;