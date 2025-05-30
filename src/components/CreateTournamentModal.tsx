import { Modal, Form, Input, Button, DatePicker, Select, message } from "antd";
import { TrophyOutlined, EnvironmentOutlined, TeamOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import "./CreateTournamentModal.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface CreateTournamentModalProps {
  open: boolean;
  onCancel: () => void;
  onCreateFinish: (values: {
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    teams: { name: string }[];
  }) => void;
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  open,
  onCancel,
  onCreateFinish,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Логирование для диагностики
  useEffect(() => {
    if (open) {
      console.log("CreateTournamentModal: Form instance created", form);
    }
    return () => {
      console.log("CreateTournamentModal: Form instance unmounted");
    };
  }, [form, open]);

  // Обновляем количество полей для команд
  const handleTeamCountChange = (value: number) => {
    const currentTeams = form.getFieldValue("teams") || [];
    const newTeams = Array(value).fill("");
    for (let i = 0; i < Math.min(currentTeams.length, value); i++) {
      newTeams[i] = currentTeams[i];
    }
    form.setFieldsValue({ teams: newTeams });
  };

  // Синхронизируем количество полей с teamCount
  useEffect(() => {
    if (!open) return;
    const teamCount = form.getFieldValue("teamCount") || 4;
    const currentTeams = form.getFieldValue("teams") || [];
    if (currentTeams.length !== teamCount) {
      const newTeams = Array(teamCount).fill("");
      for (let i = 0; i < Math.min(currentTeams.length, teamCount); i++) {
        newTeams[i] = currentTeams[i];
      }
      form.setFieldsValue({ teams: newTeams });
    }
  }, [form, open]);

  const onFinish = async (values: {
    name: string;
    dates: [Dayjs, Dayjs];
    location: string;
    teamCount: number;
    teams: string[];
  }) => {
    setSubmitting(true);
    try {
      const [startDate, endDate] = values.dates;
      const teams = values.teams
        .filter((team) => team.trim() !== "")
        .map((team) => ({ name: team }));
      await onCreateFinish({
        name: values.name,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        location: values.location,
        teams,
      });
      message.success("Турнир успешно создан");
      form.resetFields();
      onCancel();
    } catch {
      message.error("Не удалось создать турнир");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      title="Создать турнир"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={submitting}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={() => form.submit()}>
          Создать
        </Button>,
      ]}
      className="create-tournament-modal"
      style={{ textAlign: "center" }}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      }}
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 400, margin: "0 auto" }}
        className="create-tournament-form"
      >
        <Form.Item
          name="name"
          label="Название турнира"
          rules={[{ required: true, message: "Введите название турнира" }]}
        >
          <Input prefix={<TrophyOutlined />} placeholder="Название турнира" />
        </Form.Item>
        <Form.Item
          name="dates"
          label="Даты проведения"
          rules={[{ required: true, message: "Выберите даты проведения" }]}
        >
          <RangePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="location"
          label="Место проведения"
          rules={[{ required: true, message: "Введите место проведения" }]}
        >
          <Input prefix={<EnvironmentOutlined />} placeholder="Стадион, город" />
        </Form.Item>
        <Form.Item
          name="teamCount"
          label="Количество команд"
          rules={[{ required: true, message: "Выберите количество команд" }]}
          initialValue={4}
        >
          <Select onChange={handleTeamCountChange} placeholder="Выберите количество команд">
            <Option value={4}>4 команды</Option>
            <Option value={8}>8 команд</Option>
            <Option value={16}>16 команд</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Команды-участницы" required>
          <Form.List name="teams">
            {() => (
              <div>
                {Array.from({ length: form.getFieldValue("teamCount") || 4 }, (_, index) => (
                  <Form.Item
                    key={index}
                    name={index}
                    rules={[{ required: true, message: `Введите название команды ${index + 1}` }]}
                    style={{ marginBottom: 8 }}
                  >
                    <Input
                      prefix={<TeamOutlined />}
                      placeholder={`Команда ${index + 1}`}
                    />
                  </Form.Item>
                ))}
              </div>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTournamentModal;