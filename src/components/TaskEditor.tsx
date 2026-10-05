import { useState } from 'react';

import FormInput from './FormInput';
import OptionSelector from './OptionSelector';
import Button from './Button';
import Message from './Message';
import { getFirestoreErrorMessage } from '../services/firestoreErrors';
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  TASK_LIMITS,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from '../types/task';
import { formatDate, maskDate, parseDate } from '../utils/date';
import { hasErrors, validateTask, type FieldErrors, type TaskForm } from '../utils/validation';

type TaskEditorProps = {
  task?: Task;
  submitLabel: string;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
};

function toForm(task?: Task): TaskForm {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    category: task?.category ?? '',
    dueDate: task?.dueDate ? formatDate(task.dueDate) : '',
    priority: task?.priority ?? '',
    status: task?.status ?? 'pendente',
  };
}

// Formulário compartilhado pelas telas de cadastro e edição de tarefa.
export default function TaskEditor({ task, submitLabel, onSubmit, onCancel }: TaskEditorProps) {
  const [form, setForm] = useState<TaskForm>(() => toForm(task));
  const [errors, setErrors] = useState<FieldErrors<TaskForm>>({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const setField =
    <K extends keyof TaskForm>(field: K) =>
    (value: TaskForm[K]) =>
      setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit() {
    setFeedback('');
    const validation = validateTask(form);
    setErrors(validation);
    if (hasErrors(validation)) {
      setFeedback('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // Os valores já foram validados acima.
      await onSubmit({
        title: form.title,
        description: form.description,
        category: form.category,
        dueDate: parseDate(form.dueDate) as Date,
        priority: form.priority as TaskPriority,
        status: form.status as TaskStatus,
      });
    } catch (error) {
      setFeedback(getFirestoreErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <>
      <Message type="error" text={feedback} />

      <FormInput
        label="Título"
        placeholder="Ex.: Estudar para a prova de Mobile"
        value={form.title}
        onChangeText={setField('title')}
        error={errors.title}
        maxLength={TASK_LIMITS.title}
      />
      <FormInput
        label="Descrição"
        placeholder="Detalhes da tarefa"
        value={form.description}
        onChangeText={setField('description')}
        error={errors.description}
        maxLength={TASK_LIMITS.description}
        multiline
        numberOfLines={4}
      />
      <FormInput
        label="Categoria"
        placeholder="Ex.: Faculdade, Trabalho, Pessoal"
        value={form.category}
        onChangeText={setField('category')}
        error={errors.category}
        maxLength={TASK_LIMITS.category}
      />
      <FormInput
        label="Data de entrega"
        placeholder="DD/MM/AAAA"
        value={form.dueDate}
        onChangeText={(text) => setField('dueDate')(maskDate(text))}
        error={errors.dueDate}
        keyboardType="number-pad"
        maxLength={10}
      />
      <OptionSelector
        label="Prioridade"
        options={PRIORITY_OPTIONS}
        value={form.priority}
        onChange={setField('priority')}
        error={errors.priority}
      />
      <OptionSelector
        label="Status"
        options={STATUS_OPTIONS}
        value={form.status}
        onChange={setField('status')}
        error={errors.status}
      />

      <Button title={submitLabel} onPress={handleSubmit} loading={loading} />
      <Button title="Cancelar" variant="link" onPress={onCancel} disabled={loading} />
    </>
  );
}
