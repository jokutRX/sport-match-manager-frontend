import React, { useState, useEffect } from "react";
import { Card, Tag, Space, Popover, Timeline, Button } from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import { Match } from "../types/types";
import dayjs from "dayjs";
import "./StatsMatchCard.css";

const MATCH_STATUSES = {
  UPCOMING: "Предстоящий" as const,
  IN_PROGRESS: "Идет" as const,
  FINISHED: "Завершен" as const,
};

interface StatsMatchCardProps {
  match: Match;
  onEdit: (match: Match) => void; // Added onEdit
}

const StatsMatchCard: React.FC<StatsMatchCardProps> = ({ match, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (match.status === MATCH_STATUSES.IN_PROGRESS && match.start_time && match.duration) {
      const startTime = dayjs(match.start_time);
      const endTime = startTime.add(match.duration, "minute");
      const updateTimer = () => {
        const now = dayjs();
        const diff = endTime.diff(now, "second");

        if (diff <= 0) {
          setTimeLeft("00:00");
        } else {
          const minutes = Math.floor(diff / 60);
          const seconds = diff % 60;
          setTimeLeft(
            `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          );
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [match.status, match.start_time, match.duration]);

  const getStatusIconAndColor = () => {
    switch (match.status) {
      case MATCH_STATUSES.IN_PROGRESS:
        return { icon: <PlayCircleOutlined />, color: "green" };
      case MATCH_STATUSES.FINISHED:
        return { icon: <CheckCircleOutlined />, color: "red" };
      case MATCH_STATUSES.UPCOMING:
      default:
        return { icon: null, color: "gray" };
    }
  };

  const { icon, color } = getStatusIconAndColor();

  const matchEvents = [
    ...(match.goalScorers1 || []).map((player) => ({
      children: `${player} (${match.team1}) - Гол`,
      color: "green",
    })),
    ...(match.goalScorers2 || []).map((player) => ({
      children: `${player} (${match.team2}) - Гол`,
      color: "green",
    })),
    ...(match.yellowCardPlayers1 || []).map((player) => ({
      children: `${player} (${match.team1}) - Жёлтая карточка`,
      color: "yellow",
    })),
    ...(match.yellowCardPlayers2 || []).map((player) => ({
      children: `${player} (${match.team2}) - Жёлтая карточка`,
      color: "yellow",
    })),
    ...(match.redCardPlayers1 || []).map((player) => ({
      children: `${player} (${match.team1}) - Красная карточка`,
      color: "red",
    })),
    ...(match.redCardPlayers2 || []).map((player) => ({
      children: `${player} (${match.team2}) - Красная карточка`,
      color: "red",
    })),
  ];

  const historyContent = (
    <Timeline
      items={
        matchEvents.length > 0
          ? matchEvents
          : [{ children: "Событий нет", color: "gray" }]
      }
    />
  );

  return (
    <Card
      className={`stats-match-card ${isExpanded ? "expanded" : ""}`}
      title={
        <div className="card-title">
          <span>{match.team1} - {match.team2}</span>
        </div>
      }
      extra={
        <Space size="small">
          <Button type="link" onClick={() => onEdit(match)}>
            Редактировать
          </Button>
          {isExpanded ? (
            <UpOutlined
              className="toggle-icon"
              onClick={() => setIsExpanded(false)}
            />
          ) : (
            <DownOutlined
              className="toggle-icon"
              onClick={() => setIsExpanded(true)}
            />
          )}
        </Space>
      }
    >
      <div className="stats-match-content">
        <div className="match-header">
          <Tag color={color} icon={icon} className="status-tag">
            {match.status}
          </Tag>
          <div className="match-score">
            <CountUp end={match.score1} duration={1} /> -{" "}
            <CountUp end={match.score2} duration={1} />
          </div>
          {match.status === MATCH_STATUSES.IN_PROGRESS && timeLeft && (
            <div className="match-timer">
              <span className="timer-text">{timeLeft}</span>
            </div>
          )}
        </div>
        <div className="match-stats">
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div className="stat-row">
              <span className="stat-value">
                <CountUp end={match.shotsOnGoal1 || 0} duration={1} />
              </span>
              <span className="stat-label">Удары по воротам</span>
              <span className="stat-value">
                <CountUp end={match.shotsOnGoal2 || 0} duration={1} />
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-value">
                <CountUp end={match.shotsOnTarget1 || 0} duration={1} />
              </span>
              <span className="stat-label">Удары в створ</span>
              <span className="stat-value">
                <CountUp end={match.shotsOnTarget2 || 0} duration={1} />
              </span>
            </div>
            {isExpanded && (
              <div className="extra-stats fade-in">
                <div className="stat-row">
                  <span className="stat-value">
                    <CountUp end={match.corners1 || 0} duration={1} />
                  </span>
                  <span className="stat-label">Угловые</span>
                  <span className="stat-value">
                    <CountUp end={match.corners2 || 0} duration={1} />
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-value">
                    <CountUp end={match.yellowCards1 || 0} duration={1} />
                  </span>
                  <span className="stat-label">Желтые карточки</span>
                  <span className="stat-value">
                    <CountUp end={match.yellowCards2 || 0} duration={1} />
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-value">
                    <CountUp end={match.redCards1 || 0} duration={1} />
                  </span>
                  <span className="stat-label">Красные карточки</span>
                  <span className="stat-value">
                    <CountUp end={match.redCards2 || 0} duration={1} />
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-value">
                    <CountUp end={match.possession1 || 0} duration={1} suffix="%" />
                  </span>
                  <span className="stat-label">Владение мячом</span>
                  <span className="stat-value">
                    <CountUp end={match.possession2 || 0} duration={1} suffix="%" />
                  </span>
                </div>
              </div>
            )}
            <div className="history-link">
              <Popover content={historyContent} title="История матча" trigger="hover">
                <a>История матча</a>
              </Popover>
            </div>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default StatsMatchCard;