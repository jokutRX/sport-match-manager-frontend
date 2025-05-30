import { Modal, Form, InputNumber, Button, Input, FormInstance } from "antd";
import {
  DribbbleOutlined,
  AimOutlined,
  WarningOutlined,
  StopOutlined,
  ArrowUpOutlined,
  PercentageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Match } from "../types/types";
import "./EditMatchModal.css";

interface EditMatchModalProps {
  open: boolean;
  match: Match | null;
  form: FormInstance;
  onCancel: () => void;
  onEditFinish: (values: {
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
  }) => void;
  onFinishMatch: () => void;
}

const EditMatchModal: React.FC<EditMatchModalProps> = ({
  open,
  match,
  form,
  onCancel,
  onEditFinish,
  onFinishMatch,
}) => {
  const [score1, setScore1] = useState(match?.score1 || 0);
  const [score2, setScore2] = useState(match?.score2 || 0);

  // Логирование для отладки пропа form
  useEffect(() => {
    console.log("EditMatchModal: Form instance received", form);
    if (!form) {
      console.error("EditMatchModal: Form prop is missing or invalid");
    }
  }, [form]);

  // Инициализация формы
  useEffect(() => {
    if (open && match && form) {
      console.log("EditMatchModal: Initializing form with match data", match);
      const initialValues = {
        score1: match.score1,
        score2: match.score2,
        shotsOnGoal1: match.shotsOnGoal1,
        shotsOnGoal2: match.shotsOnGoal2,
        shotsOnTarget1: match.shotsOnTarget1,
        shotsOnTarget2: match.shotsOnTarget2,
        yellowCards1: match.yellowCards1,
        yellowCards2: match.yellowCards2,
        redCards1: match.redCards1,
        redCards2: match.redCards2,
        corners1: match.corners1,
        corners2: match.corners2,
        possession1: match.possession1,
        possession2: match.possession2,
        goalScorers1: Array.isArray(match.goalScorers1) ? match.goalScorers1 : [],
        goalScorers2: Array.isArray(match.goalScorers2) ? match.goalScorers2 : [],
        yellowCardPlayers1: Array.isArray(match.yellowCardPlayers1)
          ? match.yellowCardPlayers1
          : [],
        yellowCardPlayers2: Array.isArray(match.yellowCardPlayers2)
          ? match.yellowCardPlayers2
          : [],
        redCardPlayers1: Array.isArray(match.redCardPlayers1) ? match.redCardPlayers1 : [],
        redCardPlayers2: Array.isArray(match.redCardPlayers2) ? match.redCardPlayers2 : [],
      };
      console.log("EditMatchModal: Setting initial values", initialValues);
      form.setFieldsValue(initialValues);
      setScore1(match.score1);
      setScore2(match.score2);
    }
  }, [open, match, form]);

  // Синхронизация полей goalScorers1 с score1
  useEffect(() => {
    if (!form) {
      console.warn("EditMatchModal: Form is not available for goalScorers1 sync");
      return;
    }
    const currentFields = form.getFieldValue("goalScorers1") || [];
    const currentFieldsCount = currentFields.length;
    if (currentFieldsCount < score1) {
      const newFields = [...currentFields];
      for (let i = currentFieldsCount; i < score1; i++) {
        newFields.push(undefined);
      }
      form.setFieldsValue({ goalScorers1: newFields });
      console.log("EditMatchModal: Updated goalScorers1 fields", newFields);
    } else if (currentFieldsCount > score1) {
      const newFields = currentFields.slice(0, score1);
      form.setFieldsValue({ goalScorers1: newFields });
      console.log("EditMatchModal: Updated goalScorers1 fields", newFields);
    }
  }, [score1, form]);

  // Синхронизация полей goalScorers2 с score2
  useEffect(() => {
    if (!form) {
      console.warn("EditMatchModal: Form is not available for goalScorers2 sync");
      return;
    }
    const currentFields = form.getFieldValue("goalScorers2") || [];
    const currentFieldsCount = currentFields.length;
    if (currentFieldsCount < score2) {
      const newFields = [...currentFields];
      for (let i = currentFieldsCount; i < score2; i++) {
        newFields.push(undefined);
      }
      form.setFieldsValue({ goalScorers2: newFields });
      console.log("EditMatchModal: Updated goalScorers2 fields", newFields);
    } else if (currentFieldsCount > score2) {
      const newFields = currentFields.slice(0, score2);
      form.setFieldsValue({ goalScorers2: newFields });
      console.log("EditMatchModal: Updated goalScorers2 fields", newFields);
    }
  }, [score2, form]);

  if (!open || !match) return null;

  return (
    <Modal
      title={
        <div className="modal-title">
          <DribbbleOutlined style={{ marginRight: 8 }} />
          {`${match.team1} vs ${match.team2}`}
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="finish"
          type="primary"
          onClick={onFinishMatch}
          disabled={match.status === "Завершен"}
        >
          Завершить матч
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Сохранить
        </Button>,
      ]}
      className="edit-match-modal"
      width={450}
    >
      <Form
        form={form} // Проп form обязателен для связки формы
        onFinish={(values) => {
          console.log("EditMatchModal: Form values before submit", values);
          onEditFinish({
            ...values,
            goalScorers1: values.goalScorers1?.length ? values.goalScorers1 : null,
            goalScorers2: values.goalScorers2?.length ? values.goalScorers2 : null,
            yellowCardPlayers1: values.yellowCardPlayers1?.length
              ? values.yellowCardPlayers1
              : null,
            yellowCardPlayers2: values.yellowCardPlayers2?.length
              ? values.yellowCardPlayers2
              : null,
            redCardPlayers1: values.redCardPlayers1?.length ? values.redCardPlayers1 : null,
            redCardPlayers2: values.redCardPlayers2?.length ? values.redCardPlayers2 : null,
          });
        }}
        layout="vertical"
        className="edit-match-form"
      >
        <div className="form-section score-section">
          <Form.Item
            name="score1"
            label={`${match.team1}`}
            rules={[{ required: true, message: "Введите голы" }]}
          >
            <InputNumber
              min={0}
              onChange={(value) => setScore1(value || 0)}
              prefix={<DribbbleOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="score2"
            label={`${match.team2}`}
            rules={[{ required: true, message: "Введите голы" }]}
          >
            <InputNumber
              min={0}
              onChange={(value) => setScore2(value || 0)}
              prefix={<DribbbleOutlined />}
            />
          </Form.Item>
        </div>

        <Form.List name="goalScorers1">
          {(fields) => (
            <div className="form-section">
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  name={field.name}
                  label={`Автор гола ${index + 1} (${match.team1})`}
                  rules={[{ required: true, message: "Введите имя игрока" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Фамилия игрока" />
                </Form.Item>
              ))}
            </div>
          )}
        </Form.List>

        <Form.List name="goalScorers2">
          {(fields) => (
            <div className="form-section">
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  name={field.name}
                  label={`Автор гола ${index + 1} (${match.team2})`}
                  rules={[{ required: true, message: "Введите имя игрока" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Фамилия игрока" />
                </Form.Item>
              ))}
            </div>
          )}
        </Form.List>

        <div className="form-section">
          <Form.Item
            name="shotsOnGoal1"
            label="Удары по воротам"
            rules={[{ required: true, message: "Введите удары" }]}
          >
            <InputNumber min={0} prefix={<AimOutlined />} />
          </Form.Item>
          <Form.Item
            name="shotsOnGoal2"
            label="Удары по воротам"
            rules={[{ required: true, message: "Введите удары" }]}
          >
            <InputNumber min={0} prefix={<AimOutlined />} />
          </Form.Item>
        </div>

        <div className="form-section">
          <Form.Item
            name="shotsOnTarget1"
            label="Удары в створ"
            rules={[{ required: true, message: "Введите удары" }]}
          >
            <InputNumber min={0} prefix={<AimOutlined />} />
          </Form.Item>
          <Form.Item
            name="shotsOnTarget2"
            label="Удары в створ"
            rules={[{ required: true, message: "Введите удары" }]}
          >
            <InputNumber min={0} prefix={<AimOutlined />} />
          </Form.Item>
        </div>

        <div className="form-section">
          <Form.Item
            name="yellowCards1"
            label="Жёлтые карточки"
            rules={[{ required: true, message: "Введите карточки" }]}
          >
            <InputNumber min={0} prefix={<WarningOutlined />} />
          </Form.Item>
          <Form.Item
            name="yellowCards2"
            label="Жёлтые карточки"
            rules={[{ required: true, message: "Введите карточки" }]}
          >
            <InputNumber min={0} prefix={<WarningOutlined />} />
          </Form.Item>
        </div>

        <div className="form-section">
          <Form.Item
            name="redCards1"
            label="Красные карточки"
            rules={[{ required: true, message: "Введите карточки" }]}
          >
            <InputNumber min={0} prefix={<StopOutlined />} />
          </Form.Item>
          <Form.Item
            name="redCards2"
            label="Красные карточки"
            rules={[{ required: true, message: "Введите карточки" }]}
          >
            <InputNumber min={0} prefix={<StopOutlined />} />
          </Form.Item>
        </div>

        <div className="form-section">
          <Form.Item
            name="corners1"
            label="Угловые"
            rules={[{ required: true, message: "Введите угловые" }]}
          >
            <InputNumber min={0} prefix={<ArrowUpOutlined />} />
          </Form.Item>
          <Form.Item
            name="corners2"
            label="Угловые"
            rules={[{ required: true, message: "Введите угловые" }]}
          >
            <InputNumber min={0} prefix={<ArrowUpOutlined />} />
          </Form.Item>
        </div>

        <div className="form-section">
          <Form.Item
            name="possession1"
            label="Владение мячом (%)"
            rules={[{ required: true, message: "Введите процент" }]}
          >
            <InputNumber min={0} max={100} prefix={<PercentageOutlined />} />
          </Form.Item>
          <Form.Item
            name="possession2"
            label="Владение мячом (%)"
            rules={[{ required: true, message: "Введите процент" }]}
          >
            <InputNumber min={0} max={100} prefix={<PercentageOutlined />} />
          </Form.Item>
        </div>

        <Form.List name="yellowCardPlayers1">
          {(fields) => (
            <div className="form-section">
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  name={field.name}
                  label={`Игрок с жёлтой карточкой ${index + 1} (${match.team1})`}
                  rules={[{ required: true, message: "Введите имя игрока" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Фамилия игрока" />
                </Form.Item>
              ))}
            </div>
          )}
        </Form.List>

        <Form.List name="yellowCardPlayers2">
          {(fields) => (
            <div className="form-section">
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  name={field.name}
                  label={`Игрок с жёлтой карточкой ${index + 1} (${match.team2})`}
                  rules={[{ required: true, message: "Введите имя игрока" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Фамилия игрока" />
                </Form.Item>
              ))}
            </div>
          )}
        </Form.List>

        <Form.List name="redCardPlayers1">
          {(fields) => (
            <div className="form-section">
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  name={field.name}
                  label={`Игрок с красной карточкой ${index + 1} (${match.team1})`}
                  rules={[{ required: true, message: "Введите имя игрока" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Фамилия игрока" />
                </Form.Item>
              ))}
            </div>
          )}
        </Form.List>

        <Form.List name="redCardPlayers2">
          {(fields) => (
            <div className="form-section">
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  name={field.name}
                  label={`Игрок с красной карточкой ${index + 1} (${match.team2})`}
                  rules={[{ required: true, message: "Введите имя игрока" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Фамилия игрока" />
                </Form.Item>
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default EditMatchModal;