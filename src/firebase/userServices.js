import { collection, doc, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from './config';

const USERS_COLLECTION = 'users';

/**
 * Obtiene la lista de todos los usuarios en tiempo real.
 * Ordenados por fecha de creación (los más nuevos primero, para ver solicitudes rápido).
 */
export const getUsersRealTime = (callback) => {
  const q = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  });
};

/**
 * Actualiza el rol o estatus de un usuario.
 * @param {string} userId - ID del usuario
 * @param {object} data - Ej: { status: 'active', role: 'admin' }
 */
export const updateUser = async (userId, data) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, data);
};