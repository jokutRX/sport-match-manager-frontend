import { Tabs, Space, Select, Input, Skeleton } from "antd";
import MatchCard from "./MatchCard";
import { Match } from "../types/types";
import dayjs from "dayjs";
import { useState } from "react";
import "./MatchTabs.css";

interface MatchTabsProps {
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
  onUpdate: (updatedMatch: Match) => void;
}

const MatchTabs: React.FC<MatchTabsProps> = ({
  matches,
  theme,
  contentLoading,
  viewedComponents,
  onEdit,
  onUpdate,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filterMatches = (matches: Match[], status: Match["status"]) => {
    return matches
      .filter((match) => match.status === status)
      .filter((match) => {
        if (!filterPeriod) return true;
        const matchDate = dayjs(match.date);
        const now = dayjs();
        switch (filterPeriod) {
          case "last24h":
            return now.diff(matchDate, "hour") <= 24;
          case "lastWeek":
            return now.diff(matchDate, "week") <= 1;
          case "lastMonth":
            return now.diff(matchDate, "month") <= 1;
          default:
            return true;
        }
      })
      .filter((match) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          match.team1.toLowerCase().includes(query) ||
          match.team2.toLowerCase().includes(query)
        );
      });
  };

  const items = [
    {
      key: "upcoming",
      label: "Предстоящие",
      children: (
        <div>
          <Space direction="horizontal" size="middle" style={{ marginBottom: 16 }}>
            <Input
              placeholder="Поиск по команде"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Выберите период"
              style={{ width: 200 }}
              onChange={(value) => setFilterPeriod(value)}
              allowClear
              options={[
                { value: "last24h", label: "За последние сутки" },
                { value: "lastWeek", label: "За последнюю неделю" },
                { value: "lastMonth", label: "За последний месяц" },
              ]}
            />
          </Space>
          {!viewedComponents.matches && contentLoading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : filterMatches(matches, "Предстоящий").length > 0 ? (
            <div className="matches-grid">
              {filterMatches(matches, "Предстоящий").map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEdit={onEdit}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          ) : (
            <p>Нет предстоящих матчей за выбранный период или по запросу</p>
          )}
        </div>
      ),
    },
    {
      key: "in-progress",
      label: "Идет",
      children: (
        <div>
          <Input
            placeholder="Поиск по команде"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 200, marginBottom: 16 }}
            allowClear
          />
          {!viewedComponents.matches && contentLoading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : filterMatches(matches, "Идет").length > 0 ? (
            <div className="matches-grid">
              {filterMatches(matches, "Идет").map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEdit={onEdit}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          ) : (
            <p>Нет матчей в процессе по запросу</p>
          )}
        </div>
      ),
    },
    {
      key: "completed",
      label: "Завершенные",
      children: (
        <div>
          <Space direction="horizontal" size="middle" style={{ marginBottom: 16 }}>
            <Input
              placeholder="Поиск по команде"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Выберите период"
              style={{ width: 200 }}
              onChange={(value) => setFilterPeriod(value)}
              allowClear
              options={[
                { value: "last24h", label: "За последние сутки" },
                { value: "lastWeek", label: "За последнюю неделю" },
                { value: "lastMonth", label: "За последний месяц" },
              ]}
            />
          </Space>
          {!viewedComponents.matches && contentLoading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : filterMatches(matches, "Завершен").length > 0 ? (
            <div className="matches-grid">
              {filterMatches(matches, "Завершен").map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEdit={onEdit}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          ) : (
            <p>Нет завершенных матчей за выбранный период или по запросу</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <Tabs
      items={items}
      className={theme === "dark" ? "dark-tabs" : "light-tabs"}
    />
  );
};

export default MatchTabs;