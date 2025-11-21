import {  collection,  addDoc,  doc,  updateDoc,  deleteDoc,  onSnapshot } from 'firebase/firestore';
import { db } from './config';

// Definición de la colección
const CUSTOMERS_COLLECTION = 'customers';

/**
 * Añade un nuevo cliente a la base de datos.
 */
export const addCustomer = (customerData) => {
  return addDoc(collection(db, CUSTOMERS_COLLECTION), customerData);
};

/**
 * Actualiza un cliente existente en la base de datos.
 */
export const updateCustomer = (customerId, customerData) => {
  const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  return updateDoc(customerRef, customerData);
};

/**
 * Elimina un cliente de la base de datos.
 */
export const deleteCustomer = (customerId) => {
  const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
  return deleteDoc(customerRef);
};

/**
 * **FUNCIÓN QUE FALTABA Y CAUSA EL ERROR**
 * Obtiene todos los clientes en tiempo real usando onSnapshot.
 */
export const getCustomersRealTime = (callback) => {
  const customersCollection = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(customersCollection, (querySnapshot) => {
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(customers);
  });
};
