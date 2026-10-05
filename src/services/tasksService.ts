import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentSnapshot,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import type { Task, TaskInput } from '../types/task';

// Estrutura no Firestore: usuarios/{uid}/tarefas/{tarefaId}
export const USERS_COLLECTION = 'usuarios';
export const TASKS_COLLECTION = 'tarefas';

export function tasksCollection(uid: string) {
  return collection(db, USERS_COLLECTION, uid, TASKS_COLLECTION);
}

function taskDoc(uid: string, taskId: string) {
  return doc(db, USERS_COLLECTION, uid, TASKS_COLLECTION, taskId);
}

// Os registros sempre são lidos/gravados no caminho do usuário autenticado no Firebase Auth.
function currentUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw Object.assign(new Error('Usuário não autenticado'), { code: 'unauthenticated' });
  return uid;
}

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

// Os campos são salvos em português no Firestore e convertidos para o tipo usado no app.
function fromSnapshot(snapshot: DocumentSnapshot): Task {
  // "estimate" evita null nos campos com serverTimestamp ainda não confirmados pelo servidor.
  const data = snapshot.data({ serverTimestamps: 'estimate' }) ?? {};
  return {
    id: snapshot.id,
    title: data.titulo ?? '',
    description: data.descricao ?? '',
    category: data.categoria ?? '',
    dueDate: toDate(data.dataEntrega),
    priority: data.prioridade,
    status: data.status,
    createdAt: toDate(data.criadoEm),
    updatedAt: toDate(data.atualizadoEm),
  };
}

function toFirestore(input: TaskInput) {
  return {
    titulo: input.title.trim(),
    descricao: input.description.trim(),
    categoria: input.category.trim(),
    dataEntrega: Timestamp.fromDate(input.dueDate),
    prioridade: input.priority,
    status: input.status,
  };
}

// READ: escuta as tarefas do usuário em tempo real, ordenadas pela data de entrega.
// fromCache = true indica que o Firestore está sem conexão com o servidor e só tem os dados em memória.
export function subscribeToTasks(
  onChange: (tasks: Task[], fromCache: boolean) => void,
  onError: (error: FirestoreError | Error) => void,
): Unsubscribe {
  let unsubscribe: Unsubscribe | undefined;
  let cancelled = false;

  // A sessão pode vir do AsyncStorage antes de o Firebase restaurar o login,
  // então espera o Auth ficar pronto para a consulta já sair autenticada.
  auth.authStateReady().then(() => {
    if (cancelled) return;
    try {
      const tasksQuery = query(tasksCollection(currentUid()), orderBy('dataEntrega', 'asc'));
      // includeMetadataChanges avisa também quando a conexão volta, mesmo sem mudança nos dados.
      unsubscribe = onSnapshot(
        tasksQuery,
        { includeMetadataChanges: true },
        (snapshot) => onChange(snapshot.docs.map(fromSnapshot), snapshot.metadata.fromCache),
        onError,
      );
    } catch (error) {
      onError(error as Error);
    }
  });

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

// READ: busca uma tarefa específica (usado na tela de edição).
export async function getTask(taskId: string): Promise<Task | null> {
  await auth.authStateReady();
  const snapshot = await getDoc(taskDoc(currentUid(), taskId));
  return snapshot.exists() ? fromSnapshot(snapshot) : null;
}

// CREATE
export async function createTask(input: TaskInput): Promise<string> {
  const uid = currentUid();
  const ref = await addDoc(tasksCollection(uid), {
    ...toFirestore(input),
    usuarioId: uid,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

// UPDATE
export async function updateTask(taskId: string, input: TaskInput): Promise<void> {
  await updateDoc(taskDoc(currentUid(), taskId), {
    ...toFirestore(input),
    atualizadoEm: serverTimestamp(),
  });
}

// DELETE
export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(taskDoc(currentUid(), taskId));
}
