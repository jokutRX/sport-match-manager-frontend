import { Collapse, Space, Button, Modal, Form, Input, DatePicker, message, Tag, Select } from "antd";
import {
  TrophyOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ScheduleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Tournament, Match } from "../types/types";
import EditMatchModal from "./EditMatchModal";
import "./TournamentList.css";

interface Team {
  id?: number;
  name: string;
}

interface TournamentListProps {
  tournaments: Tournament[];
  theme: "light" | "dark"; // Added theme property
}

const TournamentList: React.FC<TournamentListProps> = ({ tournaments, theme }) => {
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Логирование для отладки создания формы
  console.log("TournamentList: editForm instance created", editForm);

  const [localTournaments, setLocalTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    setLocalTournaments(tournaments);
  }, [tournaments]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const tournamentsWithMatches = await Promise.all(
          tournaments.map(async (tournament) => {
            try {
              const matchesResponse = await axios.get(
                `/tournaments/${tournament.id}/matches/`,
                { headers: { "Content-Type": "application/json" } }
              );
              console.log(`Matches for tournament ${tournament.id}:`, matchesResponse.data);
              return { ...tournament, matches: matchesResponse.data };
            } catch (error) {
              console.error(`Error fetching matches for tournament ${tournament.id}:`, error);
              return { ...tournament, matches: [] };
            }
          })
        );
        setLocalTournaments(tournamentsWithMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
        message.error("Не удалось загрузить матчи");
      }
    };
    if (tournaments.length > 0) {
      fetchMatches();
    }
  }, [tournaments]);

  const handleCreateSchedule = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setScheduleModalVisible(true);
  };

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setEditModalVisible(true);
  };

  const handleScheduleCancel = () => {
    setScheduleModalVisible(false);
    setSelectedTournament(null);
    matchForm.resetFields();
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setSelectedMatch(null);
    editForm.resetFields();
  };

  const handleSaveSchedule = () => {
    matchForm.validateFields().then(async (values) => {
      if (!selectedTournament) return;
      const match = {
        tournament_id: selectedTournament.id,
        team1: values.team1,
        team2: values.team2,
        date: values.date?.toISOString() || new Date().toISOString(),
        location: selectedTournament.location,
        status: "Предстоящий" as const,
        score1: 0,
        score2: 0,
        shotsOnGoal1: 0,
        shotsOnGoal2: 0,
        shotsOnTarget1: 0,
        shotsOnTarget2: 0,
        yellowCards1: 0,
        yellowCards2: 0,
        redCards1: 0,
        redCards2: 0,
        corners1: 0,
        corners2: 0,
        possession1: 0,
        possession2: 0,
        start_time: null,
        duration: null,
        goalScorers1: null,
        goalScorers2: null,
        yellowCardPlayers1: null,
        yellowCardPlayers2: null,
        redCardPlayers1: null,
        redCardPlayers2: null,
        match_type: "Турнирный" as const,
        referee: "",
        stage: values.stage || null,
      };
      console.log("Creating match:", match);
      try {
        const response = await axios.post("/matches/", match, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("Match creation response:", response.data);
        if (typeof response.data.id !== "number") {
          throw new Error("Invalid match ID returned from API");
        }
        const createdMatch = { ...match, id: response.data.id };
        setLocalTournaments((prev) =>
          prev.map((tournament) =>
            tournament.id === selectedTournament.id
              ? { ...tournament, matches: [...(tournament.matches || []), createdMatch] }
              : tournament
          )
        );
        message.success("Матч успешно добавлен в расписание");
      } catch (error) {
        console.error("Error creating match:", error);
        message.error("Не удалось сохранить матч");
      }
      handleScheduleCancel();
    }).catch((error) => {
      console.error("Form validation failed:", error);
      message.error("Пожалуйста, заполните все обязательные поля");
    });
  };

  const handleEditFinish = async (values: {
    score1: number;
    score2: number;
    shotsOnGoal1: number;
    shotsOnGoal2: number;
    shotsOnTarget1: number;
    shotsOnTarget2: number;
    yellowCards1: number;
    yellowCards2: number;
    redCards1: number;
    redCards2: number;
    corners1: number;
    corners2: number;
    possession1: number;
    possession2: number;
    goalScorers1?: string[];
    goalScorers2?: string[];
    yellowCardPlayers1?: string[];
    yellowCardPlayers2?: string[];
    redCardPlayers1?: string[];
    redCardPlayers2?: string[];
  }) => {
    if (!selectedMatch || !selectedTournament) return;
    const updatedMatch: Match = {
      id: selectedMatch.id,
      tournament_id: selectedTournament.id,
      team1: selectedMatch.team1,
      team2: selectedMatch.team2,
      date: selectedMatch.date,
      location: selectedMatch.location,
      status: selectedMatch.status,
      score1: values.score1,
      score2: values.score2,
      shotsOnGoal1: values.shotsOnGoal1,
      shotsOnGoal2: values.shotsOnGoal2,
      shotsOnTarget1: values.shotsOnTarget1,
      shotsOnTarget2: values.shotsOnTarget2,
      yellowCards1: values.yellowCards1,
      yellowCards2: values.yellowCards2,
      redCards1: values.redCards1,
      redCards2: values.redCards2,
      corners1: values.corners1,
      corners2: values.corners2,
      possession1: values.possession1,
      possession2: values.possession2,
      start_time: selectedMatch.start_time || new Date().toISOString(),
      duration: selectedMatch.duration,
      goalScorers1: values.goalScorers1 || null,
      goalScorers2: values.goalScorers2 || null,
      yellowCardPlayers1: values.yellowCardPlayers1 || null,
      yellowCardPlayers2: values.yellowCardPlayers2 || null,
      redCardPlayers1: values.redCardPlayers1 || null,
      redCardPlayers2: values.redCardPlayers2 || null,
      match_type: selectedMatch.match_type,
      referee: selectedMatch.referee || "",
      stage: selectedMatch.stage || null,
    };
    try {
      await axios.put(`/matches/${selectedMatch.id}`, updatedMatch, {
        headers: { "Content-Type": "application/json" },
      });
      setLocalTournaments((prev) =>
        prev.map((tournament) =>
          tournament.id === selectedTournament.id
            ? {
                ...tournament,
                matches: tournament.matches?.map((m) =>
                  m.id === selectedMatch.id ? updatedMatch : m
                ),
              }
            : tournament
        )
      );
      message.success("Матч успешно обновлён");
    } catch (error) {
      console.error("Error updating match:", error);
      message.error("Не удалось обновить матч");
    }
    handleEditCancel();
  };

  const handleFinishMatch = async () => {
    if (!selectedMatch || !selectedTournament) return;
    try {
      const values = await editForm.validateFields();
      const updatedMatch: Match = {
        id: selectedMatch.id,
        tournament_id: selectedTournament.id,
        team1: selectedMatch.team1,
        team2: selectedMatch.team2,
        date: selectedMatch.date,
        location: selectedMatch.location,
        status: "Завершен" as const,
        score1: values.score1,
        score2: values.score2,
        shotsOnGoal1: values.shotsOnGoal1,
        shotsOnGoal2: values.shotsOnGoal2,
        shotsOnTarget1: values.shotsOnTarget1,
        shotsOnTarget2: values.shotsOnTarget2,
        yellowCards1: values.yellowCards1,
        yellowCards2: values.yellowCards2,
        redCards1: values.redCards1,
        redCards2: values.redCards2,
        corners1: values.corners1,
        corners2: values.corners2,
        possession1: values.possession1,
        possession2: values.possession2,
        start_time: selectedMatch.start_time,
        duration: selectedMatch.duration,
        goalScorers1: values.goalScorers1 || null,
        goalScorers2: values.goalScorers2 || null,
        yellowCardPlayers1: values.yellowCardPlayers1 || null,
        yellowCardPlayers2: values.yellowCardPlayers2 || null,
        redCardPlayers1: values.redCardPlayers1 || null,
        redCardPlayers2: values.redCardPlayers2 || null,
        match_type: selectedMatch.match_type,
        referee: selectedMatch.referee || "",
        stage: selectedMatch.stage || null,
      };
      await axios.put(`/matches/${selectedMatch.id}`, updatedMatch, {
        headers: { "Content-Type": "application/json" },
      });
      setLocalTournaments((prev) =>
        prev.map((tournament) =>
          tournament.id === selectedTournament.id
            ? {
                ...tournament,
                matches: tournament.matches?.map((m) =>
                  m.id === selectedMatch.id ? updatedMatch : m
                ),
              }
            : tournament
        )
      );
      message.success("Матч успешно завершён");
    } catch (error) {
      console.error("Error finishing match:", error);
      message.error("Не удалось завершить матч");
    }
    handleEditCancel();
  };

  return (
    <div className={`tournament-list-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      <Space direction="vertical" size="middle" className="tournament-list">
        {localTournaments.length > 0 ? (
          <Collapse
            accordion
            className="tournament-collapse"
            expandIconPosition="end"
            items={localTournaments.map((tournament) => ({
              key: tournament.id.toString(),
              label: (
                <div className="tournament-header">
                  <TrophyOutlined className="header-icon" />
                  <span>{tournament.name}</span>
                </div>
              ),
              children: (
                <div className="tournament-content">
                  <div className="tournament-info-grid">
                    <div className="info-card">
                      <div className="tournament-info">
                        <TrophyOutlined className="content-icon" />
                        <span className="info-label">Название:</span>
                        <span className="info-value">{tournament.name}</span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="tournament-info">
                        <TeamOutlined className="content-icon" />
                        <span className="info-label">Команды:</span>
                        <span className="info-value">
                          {JSON.parse(tournament.teams || "[]")
                            .map((team: Team) => team.name)
                            .join(", ") || "Нет команд"}
                        </span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="tournament-info">
                        <CalendarOutlined className="content-icon" />
                        <span className="info-label">Даты:</span>
                        <span className="info-value">
                          {dayjs(tournament.startDate).format("DD-MM-YYYY")} -{" "}
                          {dayjs(tournament.endDate).format("DD-MM-YYYY")}
                        </span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="tournament-info">
                        <EnvironmentOutlined className="content-icon" />
                        <span className="info-label">Место:</span>
                        <span className="info-value">{tournament.location}</span>
                      </div>
                    </div>
                  </div>
                  {tournament.matches && tournament.matches.length > 0 && (
                    <div className="matches-section">
                      <h4>Расписание матчей:</h4>
                      <div className="matches-grid">
                        {tournament.matches.map((match) => (
                          <div key={match.id} className="match-card">
                            <div className="match-info">
                              <span className="team-name">{match.team1}</span>
                              <span className="vs">{`${match.score1} : ${match.score2}`}</span>
                              <span className="team-name">{match.team2}</span>
                            </div>
                            <div className="match-date">
                              {new Date(match.date).toLocaleString("ru-RU", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              <Tag
                                color={match.match_type === "Турнирный" ? "blue" : "green"}
                                style={{ marginLeft: 8 }}
                              >
                                {match.match_type}
                              </Tag>
                              {match.stage && (
                                <Tag
                                  color={
                                    match.stage === "Групповой этап"
                                      ? "cyan"
                                      : match.stage === "Четвертьфинал"
                                      ? "purple"
                                      : match.stage === "Полуфинал"
                                      ? "orange"
                                      : "gold"
                                  }
                                  style={{ marginLeft: 8 }}
                                >
                                  {match.stage}
                                </Tag>
                              )}
                            </div>
                            <SettingOutlined
                              className="edit-icon"
                              onClick={() => handleEditMatch(match)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    type="primary"
                    icon={<ScheduleOutlined />}
                    onClick={() => handleCreateSchedule(tournament)}
                    className="schedule-button"
                  >
                    Составить расписание турнира
                  </Button>
                </div>
              ),
            }))}
          />
        ) : (
          <div className="no-tournaments-container">
            <p className="no-tournaments">Турниров пока нет</p>
          </div>
        )}

        <Modal
          title="Добавить матч в расписание"
          open={scheduleModalVisible}
          onCancel={handleScheduleCancel}
          footer={[
            <Button key="cancel" onClick={handleScheduleCancel}>
              Отмена
            </Button>,
            <Button key="submit" type="primary" onClick={handleSaveSchedule}>
              Сохранить
            </Button>,
          ]}
          className="schedule-modal"
        >
          <Form form={matchForm} layout="vertical" className="schedule-form">
            <Space direction="vertical" size="middle">
              <Space direction="horizontal" size="middle">
                <Form.Item
                  label="Команда 1"
                  name="team1"
                  rules={[{ required: true, message: "Введите название команды" }]}
                >
                  <Input placeholder="Название команды" prefix={<TeamOutlined />} />
                </Form.Item>
                <Form.Item
                  label="Команда 2"
                  name="team2"
                  rules={[{ required: true, message: "Введите название команды" }]}
                >
                  <Input placeholder="Название команды" prefix={<TeamOutlined />} />
                </Form.Item>
              </Space>
              <Form.Item
                label="Дата и время матча"
                name="date"
                rules={[{ required: true, message: "Выберите дату и время" }]}
              >
                <DatePicker showTime format="DD-MM-YYYY HH:mm" />
              </Form.Item>
              <Form.Item
                label="Этап турнира"
                name="stage"
                rules={[{ required: true, message: "Выберите этап турнира" }]}
              >
                <Select
                  placeholder="Выберите этап"
                  options={[
                    { value: "Групповой этап", label: "Групповой этап" },
                    { value: "Четвертьфинал", label: "Четвертьфинал" },
                    { value: "Полуфинал", label: "Полуфинал" },
                    { value: "Финал", label: "Финал" },
                  ]}
                />
              </Form.Item>
            </Space>
          </Form>
        </Modal>

        <EditMatchModal
          open={editModalVisible}
          match={selectedMatch}
          form={editForm}
          onCancel={handleEditCancel}
          onEditFinish={handleEditFinish}
          onFinishMatch={handleFinishMatch}
        />
      </Space>
    </div>
  );
};

export default TournamentList;