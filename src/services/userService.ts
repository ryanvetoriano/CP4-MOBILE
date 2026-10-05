import { doc, getDocs, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';

import { db } from '../config/firebase';
import { tasksCollection, USERS_COLLECTION } from './tasksService';

// Um batch do Firestore aceita até 500 operações.
const BATCH_LIMIT = 500;

// Salva/atualiza o documento usuarios/{uid}. A senha nunca é enviada ao Firestore.
export async function saveUserProfile(user: User, isNewUser = false): Promise<void> {
  await setDoc(
    doc(db, USERS_COLLECTION, user.uid),
    {
      nome: user.displayName ?? '',
      email: user.email ?? '',
      ultimoLogin: serverTimestamp(),
      ...(isNewUser ? { criadoEm: serverTimestamp() } : {}),
    },
    { merge: true },
  );
}

// Remove as tarefas e o documento do usuário. O Firestore não apaga subcoleções
// automaticamente, então cada tarefa é excluída junto com o documento principal.
export async function deleteUserData(uid: string): Promise<void> {
  const tasks = await getDocs(tasksCollection(uid));
  const refs = [...tasks.docs.map((task) => task.ref), doc(db, USERS_COLLECTION, uid)];

  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    refs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
