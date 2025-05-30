import { Card, notification, Tag, Space, Button } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import axios from "axios";
import { Match } from "../types/types";
import "./MatchCard.css";

dayjs.extend(duration);

const MATCH_STATUSES = {
  UPCOMING: "Предстоящий" as const,
  IN_PROGRESS: "Идет" as const,
  FINISHED: "Завершен" as const,
};

interface MatchCardProps {
  match: Match;
  onEdit: (match: Match) => void;
  onUpdate: (updatedMatch: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onEdit, onUpdate }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    let interval: number | null = null;

    const updateTimer = () => {
      const now = dayjs();
      const matchTime = dayjs(match.date);

      if (
        match.status === MATCH_STATUSES.UPCOMING &&
        matchTime.diff(now, "second") <= 0 &&
        !match.start_time
      ) {
        const updatedMatch: Match = {
          ...match,
          status: MATCH_STATUSES.IN_PROGRESS,
          start_time: now.toISOString(),
        };
        axios
          .put(`/matches/${match.id}`, updatedMatch, {
            headers: { "Content-Type": "application/json" },
          })
          .then((response) => {
            onUpdate(response.data);
            if (!hasNotified) {
              notification.success({
                message: "Матч начался!",
                description: `${match.team1} vs ${match.team2} начался в ${matchTime.format(
                  "DD-MM-YYYY HH:mm"
                )}.`,
                placement: "topRight",
              });
              setHasNotified(true);
            }
          })
          .catch(() => {
            notification.error({
              message: "Ошибка",
              description: "Не удалось обновить статус матча.",
              placement: "topRight",
            });
          });
      }

      if (match.status === MATCH_STATUSES.IN_PROGRESS && match.duration && match.start_time) {
        const startTime = dayjs(match.start_time);
        const endTime = startTime.add(match.duration, "minute");
        const remainingSeconds = endTime.diff(now, "second");

        if (remainingSeconds > 0) {
          if (!isPaused) {
            setTimeLeft((prev) => {
              if (prev === null) {
                return remainingSeconds;
              }
              return prev > 0 ? prev - 1 : 0;
            });
          }
        } else {
          setTimeLeft(0);
          if (match.status === MATCH_STATUSES.IN_PROGRESS) {
            const updatedMatch: Match = {
              ...match,
              status: MATCH_STATUSES.FINISHED,
            };
            axios
              .put(`/matches/${match.id}`, updatedMatch, {
                headers: { "Content-Type": "application/json" },
              })
              .then((response) => {
                onUpdate(response.data);
              })
              .catch(() => {
                notification.error({
                  message: "Ошибка",
                  description: "Не удалось завершить матч.",
                  placement: "topRight",
                });
              });
          }
        }
      } else {
        setTimeLeft(null);
      }
    };

    updateTimer();
    interval = setInterval(updateTimer, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [match, onUpdate, hasNotified, isPaused]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const matchType = match.match_type || "Неизвестный";

  return (
    <Card
      className="match-card"
      styles={{
        body: {
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        },
      }}
    >
      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}
      >
        <span className="ant-typography" style={{ fontSize: "14px", fontWeight: "bold" }}>
          {match.team1}
        </span>
        <span
          className="ant-typography"
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: match.status === MATCH_STATUSES.IN_PROGRESS ? "#52c41a" : "var(--text-color)",
          }}
        >
          {match.score1} - {match.score2}
        </span>
        <span className="ant-typography" style={{ fontSize: "14px", fontWeight: "bold" }}>
          {match.team2}
        </span>
      </Space>
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <div className="ant-typography" style={{ fontSize: "12px" }}>
          <CalendarOutlined style={{ marginRight: "6px" }} />
          {dayjs(match.date).format("DD-MM-YY HH:mm")}
          <Tag
            color={matchType === "Турнирный" ? "blue" : matchType === "Товарищеский" ? "green" : "gray"}
            style={{ marginLeft: 6, fontSize: "10px", lineHeight: "18px" }}
          >
            {matchType}
          </Tag>
        </div>
        <div className="ant-typography" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          <EnvironmentOutlined style={{ marginRight: "6px" }} />
          {match.location}
        </div>
        {match.referee && (
          <div className="ant-typography" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            <UserOutlined style={{ marginRight: "6px" }} />
            Судья: {match.referee}
          </div>
        )}
        <div className="ant-typography" style={{ fontSize: "12px" }}>
          <PlayCircleOutlined style={{ marginRight: "6px" }} />
          <Tag color={match.status === MATCH_STATUSES.IN_PROGRESS ? "green" : match.status === MATCH_STATUSES.FINISHED ? "red" : "blue"}>
            {match.status}
          </Tag>
        </div>
        {match.status === MATCH_STATUSES.IN_PROGRESS && timeLeft !== null && (
          <Space>
            <div
              className="ant-typography"
              style={{ fontSize: "12px", color: "#ff4d4f" }}
            >
              <ClockCircleOutlined style={{ marginRight: "6px" }} />
              {formatTime(timeLeft)}
            </div>
            <Button onClick={togglePause} size="small">
              {isPaused ? "Возобновить" : "Пауза"}
            </Button>
          </Space>
        )}
      </Space>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SettingOutlined
          style={{
            fontSize: "16px",
            color: "var(--primary-color)",
            cursor: "pointer",
          }}
          onClick={() => onEdit(match)}
        />
      </div>
    </Card>
  );
};

export default MatchCard;