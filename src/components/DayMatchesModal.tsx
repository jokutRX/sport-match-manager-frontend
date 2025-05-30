import { Modal, Space, Card, Tag, Button } from "antd";
import dayjs from "dayjs";
import { Match } from "../types/types"; // Импорт из types.ts

interface DayMatchesModalProps {
  open: boolean;
  matches: Match[];
  theme: "light" | "dark";
  onCancel: () => void;
  onEdit: (match: Match) => void;
}

const DayMatchesModal: React.FC<DayMatchesModalProps> = ({
  open,
  matches,
  theme,
  onCancel,
  onEdit,
}) => (
  <Modal
    title={`Матчи за ${matches.length > 0 ? dayjs(matches[0].date).format("DD MMMM YYYY") : ""}`}
    open={open}
    onCancel={onCancel}
    footer={null}
    style={{ textAlign: "center" }}
  >
    {matches.length > 0 ? (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {matches.map((match) => (
          <Card
            key={match.id}
            title={`${match.team1} - ${match.team2}`}
            extra={
              <Tag
                color={
                  match.status === "Идет"
                    ? "green"
                    : match.status === "Завершен"
                    ? "red"
                    : theme === "dark"
                    ? "cyan"
                    : "blue"
                }
              >
                {match.status}
              </Tag>
            }
          >
            <p>Время: {dayjs(match.date).format("HH:mm")}</p>
            <p>Место: {match.location}</p>
            <p>Счет: {match.score1} - {match.score2}</p>
            <Button type="link" onClick={() => onEdit(match)}>
              Редактировать
            </Button>
          </Card>
        ))}
      </Space>
    ) : (
      <p>Нет матчей в этот день</p>
    )}
  </Modal>
);

export default DayMatchesModal;