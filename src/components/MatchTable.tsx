import { Table, Tag, Space, Button, Skeleton } from "antd";
import { ClockCircleOutlined, PlayCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Match } from "../types/types"; // Импорт из types.ts

interface MatchTableProps {
  matches: Match[];
  theme: "light" | "dark";
  contentLoading: boolean;
  viewedComponents: { "match-table": boolean };
  onEdit: (match: Match) => void;
}

const MatchTable: React.FC<MatchTableProps> = ({
  matches,
  theme,
  contentLoading,
  viewedComponents,
  onEdit,
}) => {
  const columns = [
    {
      title: "Команды",
      dataIndex: "teams",
      key: "teams",
      render: (_: unknown, record: Match) => (
        <span style={{ fontWeight: "bold", color: theme === "dark" ? "#40c4ff" : "#1890ff" }}>
          {record.team1} - {record.team2}
        </span>
      ),
      sorter: (a: Match, b: Match) => a.team1.localeCompare(b.team1),
    },
    {
      title: "Дата и время",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span style={{ fontSize: "14px" }}>{dayjs(date).format("DD MMM YYYY, HH:mm")}</span>
      ),
      sorter: (a: Match, b: Match) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Место",
      dataIndex: "location",
      key: "location",
      render: (location: string) => (
        <span style={{ color: "var(--text-secondary)" }}>{location}</span>
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = theme === "dark" ? "cyan" : "blue";
        let icon = <ClockCircleOutlined />;
        if (status === "Идет") {
          color = "green";
          icon = <PlayCircleOutlined />;
        } else if (status === "Завершен") {
          color = "red";
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon} style={{ borderRadius: "12px", padding: "2px 8px" }}>
            {status}
          </Tag>
        );
      },
      sorter: (a: Match, b: Match) => a.status.localeCompare(b.status),
    },
    {
      title: "Счёт",
      dataIndex: "score",
      key: "score",
      render: (_: unknown, record: Match) => (
        <span
          style={{
            fontWeight: "bold",
            color: record.status === "Идет" ? "#52c41a" : "var(--text-color)",
            background:
              record.status === "Идет"
                ? "rgba(82, 196, 26, 0.1)"
                : theme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            padding: "4px 8px",
            borderRadius: "8px",
          }}
        >
          {record.score1} - {record.score2}
        </span>
      ),
    },
    {
      title: "События",
      dataIndex: "events",
      key: "events",
      render: (_: unknown, record: Match) => {
        const events = [];
        const yellowCards1 = record.yellowCards1 ?? 0;
        const yellowCards2 = record.yellowCards2 ?? 0;
        const redCards1 = record.redCards1 ?? 0;
        const redCards2 = record.redCards2 ?? 0;
        const totalYellowCards = yellowCards1 + yellowCards2;
        const totalRedCards = redCards1 + redCards2;
        const totalGoals = record.score1 + record.score2;

        if (totalYellowCards > 0) events.push(`ЖК: ${totalYellowCards}`);
        if (totalRedCards > 0) events.push(`КК: ${totalRedCards}`);
        if (totalGoals > 0) events.push(`Голы: ${totalGoals}`);

        return events.length > 0 ? (
          <Space size="small">
            {events.map((event, index) => (
              <Tag
                key={index}
                color={theme === "dark" ? "purple" : "geekblue"}
                style={{ fontSize: "12px" }}
              >
                {event}
              </Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: "var(--text-secondary)" }}>Нет событий</span>
        );
      },
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: unknown, record: Match) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => onEdit(record)}
            style={{ padding: 0, color: theme === "dark" ? "#40c4ff" : "#1890ff" }}
          >
            Редактировать
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {!viewedComponents["match-table"] && contentLoading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={matches}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => (record.status === "Идет" ? "table-row-active" : "")}
        />
      )}
    </div>
  );
};

export default MatchTable;