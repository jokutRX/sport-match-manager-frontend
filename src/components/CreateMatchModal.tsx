import { Modal, Form, Input, DatePicker, InputNumber, Button } from "antd";
import { Dayjs } from "dayjs";

interface CreateMatchModalProps {
  open: boolean;
  onCancel: () => void;
  onCreateFinish: (values: {
    team1: string;
    team2: string;
    date: Dayjs;
    location: string;
    duration: number;
    referee: string;
  }) => void;
}

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  open,
  onCancel,
  onCreateFinish,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Создать матч"
      open={open}
      onCancel={onCancel}
      footer={null}
      style={{ textAlign: "center" }}
    >
      <Form
        form={form}
        onFinish={onCreateFinish}
        layout="vertical"
        style={{ maxWidth: 400, margin: "0 auto" }}
      >
        <Form.Item
          name="team1"
          label="Команда 1"
          rules={[
            { required: true, message: "Введите название первой команды" },
          ]}
        >
          <Input placeholder="Название команды 1" />
        </Form.Item>
        <Form.Item
          name="team2"
          label="Команда 2"
          rules={[
            { required: true, message: "Введите название второй команды" },
          ]}
        >
          <Input placeholder="Название команды 2" />
        </Form.Item>
        <Form.Item
          name="date"
          label="Дата и время"
          rules={[{ required: true, message: "Выберите дату и время" }]}
        >
          <DatePicker
            showTime
            format="DD-MM-YYYY HH:mm"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="location"
          label="Место проведения"
          rules={[{ required: true, message: "Введите место проведения" }]}
        >
          <Input placeholder="Место проведения" />
        </Form.Item>
        <Form.Item
          name="duration"
          label="Длительность матча (минуты)"
          rules={[{ required: true, message: "Введите длительность матча" }]}
        >
          <InputNumber
            min={1}
            placeholder="Длительность в минутах"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="referee"
          label="Судья"
        >
          <Input placeholder="Имя судьи (необязательно)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Создать
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateMatchModal;