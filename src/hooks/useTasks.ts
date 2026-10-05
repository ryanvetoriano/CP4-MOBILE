import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { getFirestoreErrorMessage } from '../services/firestoreErrors';
import { subscribeToTasks } from '../services/tasksService';
import type { Task } from '../types/task';

// Carrega as tarefas do usuário logado direto do Firestore. Como usa onSnapshot,
// a lista é atualizada automaticamente após cadastrar, editar ou excluir.
export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    setError('');

    return subscribeToTasks(
      (data) => {
        setTasks(data);
        setError('');
        setLoading(false);
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setLoading(false);
      },
    );
  }, [user?.uid, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { tasks, loading, error, retry };
}
