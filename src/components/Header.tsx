import { Button, Menu, Switch } from "antd";
import { TrophyOutlined, PlusOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import "./Header.css";

interface HeaderProps {
  theme: "light" | "dark";
  currentMenu: string;
  onToggleTheme: (checked: boolean) => void;
  onMenuClick: (e: { key: string }) => void;
  onShowCreateModal: () => void;
  onShowCreateTournamentModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  currentMenu,
  onToggleTheme,
  onMenuClick,
  onShowCreateModal,
  onShowCreateTournamentModal,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    onToggleTheme(checked);
  };

  const menuItems = [
    { key: "matches", label: "Матчи" },
    { key: "match-table", label: "Таблица матчей" },
    { key: "match-calendar", label: "Календарь" },
    { key: "match-stats", label: "Статистика" },
    { key: "tournaments", label: "Турниры" },
  ];

  return (
    <header className={`header ${theme === "dark" ? "dark-theme" : ""}`}>
      <div className="header-container">
        <Menu
          mode="horizontal"
          selectedKeys={[currentMenu]}
          onClick={onMenuClick}
          items={menuItems}
          className={theme === "dark" ? "menu-dark" : "menu-light"}
        />
        <div className="header-actions">
          <Button
            type="primary"
            icon={<TrophyOutlined />}
            onClick={onShowCreateModal}
          >
            Создать матч
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onShowCreateTournamentModal}
          >
            Создать турнир
          </Button>
          <Switch
            checked={isDarkMode}
            onChange={handleThemeChange}
            checkedChildren={<SunOutlined />}
            unCheckedChildren={<MoonOutlined />}
            className="theme-switch"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;