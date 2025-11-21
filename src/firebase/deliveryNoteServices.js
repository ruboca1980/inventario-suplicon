import { db, auth } from './config'; // ¡Importamos auth para la auditoría!
import { 
  collection, doc, runTransaction, serverTimestamp, 
  query, where, getDocs, orderBy 
} from 'firebase/firestore';

/**
 * Obtiene todas las 'SALIDAS' completadas de 'transaction_batches'
 * para llenar el selector de la página de Notas de Entrega.
 */
export const getCompletedExits = async () => {
  const batchesRef = collection(db, 'transaction_batches');
  // Requiere índice compuesto: type (ASC) + date (DESC)
  const q = query(batchesRef, 
    where("type", "==", "SALIDA"),
    orderBy("date", "desc")
  );

  try {
    const querySnapshot = await getDocs(q);
    const exits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return exits;
  } catch (error) {
    console.error("Error al obtener las salidas:", error);
    return [];
  }
};

/**
 * Guarda una Nota de Entrega completa en la base de datos.
 * Incluye auditoría automática del usuario creador.
 * @param {object} noteData - Datos del formulario (cliente, logística, items).
 */
export const saveDeliveryNote = async (noteData) => {
  // 1. Referencia al documento de contadores
  const correlativeRef = doc(db, 'app_meta', 'counters');
  
  // --- AUDITORÍA AUTOMÁTICA ---
  const currentUser = auth.currentUser;
  const auditData = currentUser ? {
    createdByUid: currentUser.uid,
    createdByEmail: currentUser.email,
    // Si no tiene displayName, usamos el email como nombre
    createdByName: currentUser.displayName || currentUser.email, 
  } : {
    createdByName: 'Sistema/Desconocido' // Fallback por si acaso
  };
  // ----------------------------

  try {
    // 2. Ejecutar como una transacción (Atomicidad)
    const newCorrelative = await runTransaction(db, async (transaction) => {
      
      // 3. Obtener el documento de contadores
      const correlativeDoc = await transaction.get(correlativeRef);
      const currentYear = new Date().getFullYear().toString().slice(-2); // "25"
      const currentField = `lastDeliveryNoteCorrelative_${currentYear}`;
      
      let lastNumber = 0;
      if (correlativeDoc.exists()) {
        lastNumber = correlativeDoc.data()[currentField] || 0;
      }
      
      // 4. Calcular el nuevo correlativo
      const newCorrelativeNumber = lastNumber + 1;
      const correlative = `NE-${currentYear}-${String(newCorrelativeNumber).padStart(3, '0')}`;

      // 5. Crear la referencia para el nuevo documento
      const noteRef = doc(collection(db, "deliveryNotes"));

      // 6. Guardar el documento con TODOS los datos
      transaction.set(noteRef, {
        ...noteData, 
        correlative: correlative, // Sobrescribe con el correlativo real
        createdAt: serverTimestamp(), // Marca de tiempo del servidor
        ...auditData // Inyectamos la huella digital del usuario
      });

      // 7. Actualizar el contador (o crearlo si no existe con merge: true)
      transaction.set(correlativeRef, { [currentField]: newCorrelativeNumber }, { merge: true });

      // 8. Devolver el nuevo correlativo para usarlo en la UI
      return correlative;
    });

    console.log("Nota de Entrega guardada con éxito:", newCorrelative);
    return newCorrelative;

  } catch (e) {
    console.error("Error al guardar la Nota de Entrega", e);
    throw new Error("No se pudo guardar la Nota de Entrega: " + e.message);
  }
};