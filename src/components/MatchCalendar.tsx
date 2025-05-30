import { Calendar, Skeleton } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Match } from "../types/types"; // Импорт из types.ts

interface MatchCalendarProps {
  matches: Match[];
  contentLoading: boolean;
  viewedComponents: { "match-calendar": boolean };
  onDateSelect: (value: Dayjs) => void;
}

const MatchCalendar: React.FC<MatchCalendarProps> = ({
  matches,
  contentLoading,
  viewedComponents,
  onDateSelect,
}) => {
  const handleCellRender = (value: Dayjs) => {
    const dayMatches = matches.filter((match) => dayjs(match.date).isSame(value, "day"));
    return dayMatches.length > 0 ? (
      <div style={{ height: "80px", cursor: "pointer", padding: "4px" }}>
        {dayMatches.map((match) => (
          <div
            key={match.id}
            style={{ fontSize: "12px", margin: "4px 0", color: "var(--text-color)" }}
          >
            {match.team1} - {match.team2}
          </div>
        ))}
      </div>
    ) : null;
  };

  return (
    <div>
      {!viewedComponents["match-calendar"] && contentLoading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Calendar cellRender={handleCellRender} onSelect={onDateSelect} />
      )}
    </div>
  );
};

export default MatchCalendar;