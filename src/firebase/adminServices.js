import { db } from './config';
import { collection, getDocs, writeBatch, doc, deleteDoc, limit, query } from 'firebase/firestore';

/**
 * Borra todos los documentos de una colección en lotes de 500.
 * Es la única forma de "borrar" una colección completa en Firestore.
 * @param {string} collectionName El nombre de la colección a borrar.
 */
const deleteCollection = async (collectionName) => {
  console.log(`Borrando colección: ${collectionName}...`);
  const collectionRef = collection(db, collectionName);
  
  // Firestore solo permite borrar en lotes de 500
  const q = query(collectionRef, limit(500));
  
  let snapshot = await getDocs(q);
  
  while (snapshot.size > 0) {
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`...lote de ${snapshot.size} documentos borrado.`);
    
    // Obtener el siguiente lote
    snapshot = await getDocs(q);
  }
  console.log(`Colección ${collectionName} borrada.`);
};

/**
 * ¡FUNCIÓN PELIGROSA!
 * Borra TODAS las colecciones de datos de la base de datos.
 * No borra la colección 'users'.
 */
export const resetDatabase = async () => {
  try {
    // Lista de todas las colecciones que SÍ queremos borrar
    const collectionsToDelete = [
      'products',
      'inventory',
      'serials',
      'suppliers',
      'customers',
      'staff',
      'transaction_batches',
      'transactions',
      'deliveryNotes'
    ];

    // Borra cada colección una por una
    for (const collName of collectionsToDelete) {
      await deleteCollection(collName);
    }

    // Finalmente, resetea los contadores
    // Borramos el documento 'counters' para que se reinicie en 0
    const countersRef = doc(db, 'app_meta', 'counters');
    await deleteDoc(countersRef);
    
    console.log('--- ¡REINICIO DE BASE DE DATOS COMPLETADO! ---');
    return true;

  } catch (error) {
    console.error("Error catastrófico durante el reinicio de la base de datos:", error);
    throw error;
  }
};