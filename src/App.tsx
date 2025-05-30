import { ConfigProvider, Spin, Form, theme } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import ruRU from "antd/lib/locale/ru_RU";
import Header from "./components/Header";
import MatchTabs from "./components/MatchTabs";
import MatchTable from "./components/MatchTable";
import MatchCalendar from "./components/MatchCalendar";
import MatchStats from "./components/MatchStats";
import CreateMatchModal from "./components/CreateMatchModal";
import EditMatchModal from "./components/EditMatchModal";
import DayMatchesModal from "./components/DayMatchesModal";
import TournamentList from "./components/TournamentList";
import CreateTournamentModal from "./components/CreateTournamentModal";
import { Match, Tournament } from "./types/types";
import "./index.css";

dayjs.locale("ru");

const App: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedDayMatches, setSelectedDayMatches] = useState<Match[]>([]);
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? "dark" : "light";
  });
  const [currentMenu, setCurrentMenu] = useState("matches");
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewedComponents, setViewedComponents] = useState({
    matches: false,
    "match-table": false,
    "match-calendar": false,
    "match-stats": false,
    tournaments: false,
  });
  const [contentLoading, setContentLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    localStorage.setItem("theme", themeMode);
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      const matchesResponse = await axios.get("http://localhost:8000/matches/", {
        headers: { "Content-Type": "application/json" },
      });
      setMatches(matchesResponse.data);
      const tournamentsResponse = await axios.get("http://localhost:8000/tournaments/", {
        headers: { "Content-Type": "application/json" },
      });
      setTournaments(tournamentsResponse.data);
      setTimeout(() => {
        setInitialLoading(false);
        setViewedComponents((prev) => ({ ...prev, matches: true, tournaments: true }));
      }, 500);
    } catch (error) {
      console.error("Ошибка при начальной загрузке данных:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Код состояния:", error.response.status);
        console.error("Детали ошибки от сервера:", JSON.stringify(error.response.data, null, 2));
      }
      setInitialLoading(false);
      setViewedComponents((prev) => ({ ...prev, matches: true, tournaments: true }));
    }
  };

  const fetchMatchesBackground = async () => {
    try {
      const response = await axios.get("http://localhost:8000/matches/", {
        headers: { "Content-Type": "application/json" },
      });
      setMatches(response.data);
    } catch (error) {
      console.error("Ошибка при фоновой загрузке матчей:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchMatchesBackground, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setThemeMode(newTheme);
  };

  const showCreateModal = () => setIsCreateModalOpen(true);
  const showCreateTournamentModal = () => setIsCreateTournamentModalOpen(true);
  const handleCreateCancel = () => setIsCreateModalOpen(false);
  const handleEditCancel = () => setIsEditModalOpen(false);
  const handleDayModalCancel = () => setIsDayModalOpen(false);
  const handleCreateTournamentCancel = () => setIsCreateTournamentModalOpen(false);

  const onCreateFinish = async (values: {
    team1: string;
    team2: string;
    date: Dayjs;
    location: string;
    duration: number;
    referee: string;
  }) => {
    const newMatch = {
      tournament_id: null,
      team1: values.team1,
      team2: values.team2,
      date: values.date.toISOString(),
      location: values.location,
      status: "Предстоящий",
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
      duration: values.duration,
      goalScorers1: null,
      goalScorers2: null,
      yellowCardPlayers1: null,
      yellowCardPlayers2: null,
      redCardPlayers1: null,
      redCardPlayers2: null,
      match_type: "Товарищеский" as const,
      referee: values.referee || null,
    };
    try {
      const response = await axios.post("http://localhost:8000/matches/", newMatch, {
        headers: { "Content-Type": "application/json" },
      });
      setMatches([...matches, response.data]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Ошибка при создании матча:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.log("Детали ошибки от сервера:", JSON.stringify(error.response.data, null, 2));
      }
    }
  };

  const onCreateTournamentFinish = async (values: {
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    teams: { name: string }[];
  }) => {
    try {
      const response = await axios.post("http://localhost:8000/tournaments/", values, {
        headers: { "Content-Type": "application/json" },
      });
      setTournaments([...tournaments, response.data]);
      setIsCreateTournamentModalOpen(false);
    } catch (error) {
      console.error("Ошибка при создании турнира:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.log("Детали ошибки от сервера:", JSON.stringify(error.response.data, null, 2));
      }
    }
  };

  const onEditFinish = async (values: {
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
    if (!editingMatch) return;
    const updatedMatch = {
      tournament_id: editingMatch.tournament_id,
      team1: editingMatch.team1,
      team2: editingMatch.team2,
      date: editingMatch.date,
      location: editingMatch.location,
      status: editingMatch.status,
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
      start_time: editingMatch.start_time || new Date().toISOString(),
      duration: editingMatch.duration,
      goalScorers1: Array.isArray(values.goalScorers1) ? values.goalScorers1 : null,
      goalScorers2: Array.isArray(values.goalScorers2) ? values.goalScorers2 : null,
      yellowCardPlayers1: Array.isArray(values.yellowCardPlayers1) ? values.yellowCardPlayers1 : null,
      yellowCardPlayers2: Array.isArray(values.yellowCardPlayers2) ? values.yellowCardPlayers2 : null,
      redCardPlayers1: Array.isArray(values.redCardPlayers1) ? values.redCardPlayers1 : null,
      redCardPlayers2: Array.isArray(values.redCardPlayers2) ? values.redCardPlayers2 : null,
      match_type: editingMatch.match_type,
      referee: editingMatch.referee,
    };
    console.log("App: Sending updated match to server", updatedMatch);
    try {
      const response = await axios.put(`http://localhost:8000/matches/${editingMatch.id}`, updatedMatch, {
        headers: { "Content-Type": "application/json" },
      });
      setMatches(matches.map((m) => (m.id === editingMatch.id ? response.data : m)));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Ошибка при обновлении матча:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.log("Детали ошибки от сервера:", JSON.stringify(error.response.data, null, 2));
      }
    }
  };

  const onFinishMatch = async () => {
    if (!editingMatch) return;
    try {
      const values = await form.validateFields();
      const updatedMatch = {
        tournament_id: editingMatch.tournament_id,
        team1: editingMatch.team1,
        team2: editingMatch.team2,
        date: editingMatch.date,
        location: editingMatch.location,
        status: "Завершен",
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
        start_time: editingMatch.start_time,
        duration: editingMatch.duration,
        goalScorers1: Array.isArray(values.goalScorers1) ? values.goalScorers1 : null,
        goalScorers2: Array.isArray(values.goalScorers2) ? values.goalScorers2 : null,
        yellowCardPlayers1: Array.isArray(values.yellowCardPlayers1) ? values.yellowCardPlayers1 : null,
        yellowCardPlayers2: Array.isArray(values.yellowCardPlayers2) ? values.yellowCardPlayers2 : null,
        redCardPlayers1: Array.isArray(values.redCardPlayers1) ? values.redCardPlayers1 : null,
        redCardPlayers2: Array.isArray(values.redCardPlayers2) ? values.redCardPlayers2 : null,
        match_type: editingMatch.match_type,
        referee: editingMatch.referee,
      };
      console.log("App: Sending finished match to server", updatedMatch);
      const response = await axios.put(`http://localhost:8000/matches/${editingMatch.id}`, updatedMatch, {
        headers: { "Content-Type": "application/json" },
      });
      setMatches(matches.map((m) => (m.id === editingMatch.id ? response.data : m)));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Ошибка при завершении матча:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.log("Детали ошибки от сервера:", JSON.stringify(error.response.data, null, 2));
      }
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (updatedMatch: Match) => {
    setMatches(matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
  };

  const handleMenuClick = (e: { key: string }) => {
    if (!viewedComponents[e.key as keyof typeof viewedComponents]) {
      setContentLoading(true);
    }
    setCurrentMenu(e.key);
    setTimeout(() => {
      setContentLoading(false);
      setViewedComponents((prev) => ({ ...prev, [e.key]: true }));
    }, 500);
  };

  const handleDateSelect = (value: Dayjs) => {
    const dayMatches = matches.filter((match) => dayjs(match.date).isSame(value, "day"));
    setSelectedDayMatches(dayMatches);
    setIsDayModalOpen(true);
  };

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: themeMode === "dark" ? "#40c4ff" : "#1890ff",
          colorTextBase: themeMode === "dark" ? "#ffffff" : "#000000",
          colorBgBase: themeMode === "dark" ? "#1f1f1f" : "#ffffff",
          colorBorder: themeMode === "dark" ? "#434343" : "#d9d9d9",
        },
        components: {
          Card: {
            colorBgContainer: themeMode === "dark" ? "#2c2c2c" : "#ffffff",
            colorBorder: themeMode === "dark" ? "#434343" : "#d9d9d9",
          },
          Button: {
            colorPrimary: themeMode === "dark" ? "#40c4ff" : "#1890ff",
            colorPrimaryHover: themeMode === "dark" ? "#69c0ff" : "#40a9ff",
          },
          Tabs: {
            colorPrimary: themeMode === "dark" ? "#40c4ff" : "#1890ff",
            colorText: themeMode === "dark" ? "#ffffff" : "#000000",
            colorBgContainer: themeMode === "dark" ? "#2c2c2c" : "#ffffff",
          },
          Menu: {
            itemColor: themeMode === "dark" ? "#ffffff" : "#000000",
            itemHoverColor: themeMode === "dark" ? "#ffffff" : "#000000",
            itemBg: themeMode === "dark" ? "#1f1f1f" : "#ffffff",
            itemHoverBg: themeMode === "dark" ? "#424242" : "#f5f5f5",
            itemSelectedBg: themeMode === "dark" ? "#434343" : "#e6f7ff",
            itemSelectedColor: themeMode === "dark" ? "#40c4ff" : "#1890ff",
          },
          Table: {
            colorBgContainer: themeMode === "dark" ? "#2c2c2c" : "#ffffff",
            colorText: themeMode === "dark" ? "#ffffff" : "#000000",
            colorBorderSecondary: themeMode === "dark" ? "#434343" : "#d9d9d9",
            headerBg: themeMode === "dark" ? "#434343" : "#fafafa",
            rowHoverBg: themeMode === "dark" ? "#424242" : "#f5f5f5",
          },
          Calendar: {
            colorBgContainer: themeMode === "dark" ? "#2c2c2c" : "#ffffff",
            colorText: themeMode === "dark" ? "#ffffff" : "#000000",
            colorBorder: themeMode === "dark" ? "#434343" : "#d9d9d9",
            colorPrimary: themeMode === "dark" ? "#40c4ff" : "#1890ff",
          },
          Modal: {
            wireframe: false,
            colorBgElevated: themeMode === "dark" ? "#303030" : "#ffffff",
            headerBg: themeMode === "dark" ? "#303030" : "#ffffff",
            colorText: themeMode === "dark" ? "#ffffff" : "#000000",
            colorBorder: themeMode === "dark" ? "#434343" : "#d9d9d9",
            boxShadow: "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
          },
          Form: {
            colorText: themeMode === "dark" ? "#ffffff" : "#000000",
            colorBorder: themeMode === "dark" ? "#434343" : "#d9d9d9",
          },
          Collapse: {
            colorBgContainer: themeMode === "dark" ? "#2c2c2c" : "#ffffff",
            colorText: themeMode === "dark" ? "#ffffff" : "#000000",
            colorBorder: themeMode === "dark" ? "#434343" : "#d9d9d9",
          },
        },
      }}
    >
      <div className="app-container">
        {initialLoading && (
          <Spin
            fullscreen
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: themeMode === "dark" ? "#40c4ff" : "#1890ff" }}
                spin
              />
            }
            tip="Загрузка приложения..."
          />
        )}
        <Header
          theme={themeMode}
          currentMenu={currentMenu}
          onToggleTheme={toggleTheme}
          onMenuClick={handleMenuClick}
          onShowCreateModal={showCreateModal}
          onShowCreateTournamentModal={showCreateTournamentModal}
        />
        <div className="tabs-container">
          {currentMenu === "matches" && (
            <MatchTabs
              matches={matches}
              theme={themeMode}
              contentLoading={contentLoading}
              viewedComponents={viewedComponents}
              onEdit={handleEdit}
              onUpdate={handleUpdate}
            />
          )}
          {currentMenu === "match-table" && (
            <MatchTable
              matches={matches}
              theme={themeMode}
              contentLoading={contentLoading}
              viewedComponents={viewedComponents}
              onEdit={handleEdit}
            />
          )}
          {currentMenu === "match-calendar" && (
            <MatchCalendar
              matches={matches}
              contentLoading={contentLoading}
              viewedComponents={viewedComponents}
              onDateSelect={handleDateSelect}
            />
          )}
          {currentMenu === "match-stats" && (
            <MatchStats
              matches={matches}
              theme={themeMode}
              contentLoading={contentLoading}
              viewedComponents={viewedComponents}
              onEdit={handleEdit}
            />
          )}
          {currentMenu === "tournaments" && (
            <TournamentList
              tournaments={tournaments}
              theme={themeMode}
            />
          )}
        </div>
        <CreateMatchModal
          open={isCreateModalOpen}
          onCancel={handleCreateCancel}
          onCreateFinish={onCreateFinish}
        />
        <CreateTournamentModal
          open={isCreateTournamentModalOpen}
          onCancel={handleCreateTournamentCancel}
          onCreateFinish={onCreateTournamentFinish}
        />
        <EditMatchModal
          open={isEditModalOpen}
          match={editingMatch}
          form={form}
          onCancel={handleEditCancel}
          onEditFinish={onEditFinish}
          onFinishMatch={onFinishMatch}
        />
        <DayMatchesModal
          open={isDayModalOpen}
          matches={selectedDayMatches}
          theme={themeMode}
          onCancel={handleDayModalCancel}
          onEdit={handleEdit}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;