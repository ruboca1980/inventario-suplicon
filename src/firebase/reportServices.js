import {
  collection, query, where, orderBy, getDocs, doc, getDoc, Timestamp
} from "firebase/firestore";
import { db } from './config';

// (Función existente: getProductKardex)
export const getProductKardex = async (productId) => {
  // ... (tu código de getProductKardex va aquí, no lo borres)
  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef,
    where("productId", "==", productId),
    orderBy("date", "asc")
  );
  try {
    const querySnapshot = await getDocs(q);
    const kardexData = [];
    let currentBalance = 0;
    const batchPromises = querySnapshot.docs.map(transactionDoc => {
      const batchId = transactionDoc.data().batchId;
      if (!batchId) return Promise.resolve(null);
      return getDoc(doc(db, "transaction_batches", batchId));
    });
    const batchSnapshots = await Promise.all(batchPromises);
    const customerNames = new Map();
    const supplierNames = new Map();
    for (let i = 0; i < querySnapshot.docs.length; i++) {
      const transactionDoc = querySnapshot.docs[i];
      const data = transactionDoc.data();
      const batchDoc = batchSnapshots[i];
      const batchData = batchDoc && batchDoc.exists() ? batchDoc.data() : {};
      let entityName = '';
      let entityType = '';
      if (data.type === 'ENTRADA' && batchData.supplierId) {
        entityType = 'Proveedor';
        if (supplierNames.has(batchData.supplierId)) {
          entityName = supplierNames.get(batchData.supplierId);
        } else {
          try {
            const supplierRef = doc(db, "suppliers", batchData.supplierId);
            const supplierSnap = await getDoc(supplierRef);
            entityName = supplierSnap.exists() ? supplierSnap.data().name : `ID Proveedor: ${batchData.supplierId}`;
            supplierNames.set(batchData.supplierId, entityName);
          } catch (supplierError) {
            entityName = `ID Proveedor: ${batchData.supplierId}`;
          }
        }
      }
      else if (data.type === 'SALIDA' && batchData.customerId) {
        entityType = 'Cliente';
        if (customerNames.has(batchData.customerId)) {
          entityName = customerNames.get(batchData.customerId);
        } else {
          try {
            const customerRef = doc(db, "customers", batchData.customerId);
            const customerSnap = await getDoc(customerRef);
            entityName = customerSnap.exists() ? customerSnap.data().name : `ID Cliente: ${batchData.customerId}`;
            customerNames.set(batchData.customerId, entityName);
          } catch (customerError) {
            entityName = `ID Cliente: ${batchData.customerId}`;
          }
        }
      }
      if (data.type === 'ENTRADA') {
        currentBalance += data.quantity;
      } else if (data.type === 'SALIDA') {
        currentBalance -= data.quantity;
      }
      kardexData.push({
        id: transactionDoc.id,
        date: data.date?.toDate ? data.date.toDate().toLocaleDateString('es-VE') : 'Fecha Inválida',
        type: data.type,
        correlative: batchData.correlative || 'N/A',
        entityType: entityType,
        entityName: entityName,
        quantity: data.quantity,
        balance: currentBalance,
      });
    }
    kardexData.reverse();
    return kardexData;
  } catch (error) {
    console.error("Error al obtener el Kardex:", error);
    throw error;
  }
};

// (Función existente: getTransactionsForBatch)
export const getTransactionsForBatch = async (batchId) => {
  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef, where("batchId", "==", batchId));
  try {
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return transactions;
  } catch (error) {
    console.error("Error al obtener las transacciones del lote:", error);
    throw error;
  }
};

// (Función existente: searchAllDocuments)
export const searchAllDocuments = async (filters = {}) => {
  // ... (tu código de searchAllDocuments va aquí, no lo borres)
  const { type, startDate, endDate, correlative } = filters;
  let allDocuments = [];
  const startTimestamp = startDate ? Timestamp.fromDate(new Date(startDate + 'T00:00:00')) : null;
  const endTimestamp = endDate ? Timestamp.fromDate(new Date(endDate + 'T23:59:59')) : null;
  if (!type || type === 'ENTRADA' || type === 'SALIDA') {
    try {
      let q_batches = query(collection(db, "transaction_batches"), orderBy("date", "desc"));
      if (type && type !== 'Todos') {
        q_batches = query(q_batches, where("type", "==", type));
      }
      if (startTimestamp) {
        q_batches = query(q_batches, where("date", ">=", startTimestamp));
      }
      if (endTimestamp) {
        q_batches = query(q_batches, where("date", "<=", endTimestamp));
      }
      if (correlative) {
        q_batches = query(q_batches, where("correlative", ">=", correlative), where("correlative", "<=", correlative + '\uf8ff'));
      }
      const querySnapshot = await getDocs(q_batches);
      const batches = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          _docType: data.type,
          correlative: data.correlative,
          date: data.date.toDate(),
          customerId: data.customerId || null,
          supplierId: data.supplierId || null,
        };
      });
      allDocuments.push(...batches);
    } catch (error) {
      console.error("Error buscando en transaction_batches (¿Falta índice?):", error);
    }
  }
  if (!type || type === 'Nota de Entrega') {
    try {
      let q_notes = query(collection(db, "deliveryNotes"), orderBy("createdAt", "desc"));
      if (startTimestamp) {
        q_notes = query(q_notes, where("createdAt", ">=", startTimestamp));
      }
      if (endTimestamp) {
        q_notes = query(q_notes, where("createdAt", "<=", endTimestamp));
      }
      if (correlative) {
        q_notes = query(q_notes, where("correlative", ">=", correlative), where("correlative", "<=", correlative + '\uf8ff'));
      }
      const querySnapshot = await getDocs(q_notes);
      const notes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          _docType: 'Nota de Entrega',
          correlative: data.correlative,
          date: data.createdAt ? data.createdAt.toDate() : new Date(),
          customerId: data.customerData?.id || (data.customerData ? data.customerData.rif : null), // Compatibilidad
          supplierId: null,
        };
      });
      allDocuments.push(...notes);
    } catch (error) {
      console.error("Error buscando en deliveryNotes (¿Falta índice?):", error);
    }
  }
  allDocuments.sort((a, b) => b.date - a.date);
  return allDocuments;
};


// --- ¡NUEVAS FUNCIONES DE "EMPAQUETADO"! ---

/**
 * Obtiene todos los datos formateados para el EntryPreviewModal
 */
export const getEntryPreviewData = async (docId) => {
  const batchSnap = await getDoc(doc(db, 'transaction_batches', docId));
  if (!batchSnap.exists()) throw new Error("No se encontró el lote de entrada.");

  const batchData = batchSnap.data();

  // Promesas para obtener todo en paralelo
  const itemsPromise = getTransactionsForBatch(docId);
  const supplierPromise = getDoc(doc(db, 'suppliers', batchData.supplierId));
  const receiverPromise = getDoc(doc(db, 'staff', batchData.staffReceiverId));

  const [items, supplierSnap, receiverSnap] = await Promise.all([itemsPromise, supplierPromise, receiverPromise]);

  // Formatear los datos como los espera el modal
  return {
    correlative: batchData.correlative,
    date: batchData.date.toDate().toLocaleDateString('es-VE'),
    supplierName: supplierSnap.exists() ? supplierSnap.data().name : 'N/A',
    receiverName: receiverSnap.exists() ? receiverSnap.data().name : 'N/A',
    receiverNationalId: receiverSnap.exists() ? receiverSnap.data().nationalId : 'N/A',
    items: items.map(item => ({
      ...item,
      // EntryDocument espera 'lotOrSerials' como un string
      lotOrSerials: Array.isArray(item.serials) ? item.serials.join(', ') : (item.lotNumber || ''),
    })),
  };
};

/**
 * Obtiene todos los datos formateados para el ExitPreviewModal
 */
export const getExitPreviewData = async (docId) => {
  const batchSnap = await getDoc(doc(db, 'transaction_batches', docId));
  if (!batchSnap.exists()) throw new Error("No se encontró el lote de salida.");

  const batchData = batchSnap.data();

  // Promesas en paralelo
  const itemsPromise = getTransactionsForBatch(docId);
  const customerPromise = getDoc(doc(db, 'customers', batchData.customerId));
  const issuerPromise = getDoc(doc(db, 'staff', batchData.staffIssuerId));

  const [items, customerSnap, issuerSnap] = await Promise.all([itemsPromise, customerPromise, issuerPromise]);

  // Formatear datos
  return {
    correlative: batchData.correlative,
    date: batchData.date.toDate().toLocaleDateString('es-VE'),
    customerName: customerSnap.exists() ? customerSnap.data().name : 'N/A',
    issuerName: issuerSnap.exists() ? issuerSnap.data().name : 'N/A',
    issuerNationalId: issuerSnap.exists() ? issuerSnap.data().nationalId : 'N/A',
    items: items, // ExitDocument ya espera 'serials' como un array
  };
};

/**
 * Obtiene todos los datos formateados para el DeliveryNotePreviewModal
 */
export const getDeliveryNotePreviewData = async (docId) => {
  const noteSnap = await getDoc(doc(db, 'deliveryNotes', docId));
  if (!noteSnap.exists()) throw new Error("No se encontró la Nota de Entrega.");

  // La Nota de Entrega ya se guarda como un "snapshot"
  // por lo que tiene todos los datos que el modal necesita.
  return noteSnap.data();
};

/**
 * Obtiene el historial completo de transacciones para auditoría.
 * Incluye: Entradas, Salidas y Notas de Entrega.
 * Muestra: Fecha, Hora, Tipo, Nombre (Entidad), Usuario (Creador).
 */
export const getAuditHistory = async () => {
  try {
    // 1. Obtener Lotes de Transacción (Entradas y Salidas)
    const batchesRef = collection(db, 'transaction_batches');
    const qBatches = query(batchesRef, orderBy('date', 'desc'));
    const batchesSnap = await getDocs(qBatches);

    // 2. Obtener Notas de Entrega
    const notesRef = collection(db, 'deliveryNotes');
    const qNotes = query(notesRef, orderBy('createdAt', 'desc'));
    const notesSnap = await getDocs(qNotes);

    // 3. Mapear Lotes
    // Necesitamos obtener nombres de Cliente/Proveedor si no están en el lote (optimización: asumimos que searchAllDocuments ya lo hace, pero aquí lo haremos simplificado o reutilizaremos lógica si es necesario.
    // Para auditoría rápida, el ID o una búsqueda rápida es mejor. 
    // PERO, transaction_batches NO guarda el nombre de la entidad, solo el ID.
    // Para hacerlo eficiente, podríamos hacer lo mismo que searchAllDocuments o simplemente mostrar el ID si no queremos hacer N lecturas.
    // MEJORA: Usaremos una lógica similar a searchAllDocuments para los nombres, pero simplificada.

    // Para no complicar con N lecturas aquí, vamos a devolver los datos básicos y dejar que el componente o una carga diferida maneje los nombres si es crítico.
    // Sin embargo, el usuario pidió "Nombre". Intentaremos obtenerlos de los mapas en memoria en el componente si es posible, 
    // o hacer un fetch rápido de todos los clientes/proveedores (son pocos) y mapear.
    // O mejor: transaction_batches tiene auditData.

    const history = [];

    batchesSnap.forEach(doc => {
      const data = doc.data();
      history.push({
        id: doc.id,
        rawDate: data.date ? data.date.toDate() : new Date(),
        date: data.date ? data.date.toDate().toLocaleDateString('es-VE') : 'N/A',
        time: data.date ? data.date.toDate().toLocaleTimeString('es-VE') : 'N/A',
        type: data.type, // ENTRADA / SALIDA
        entityId: data.supplierId || data.customerId || 'N/A', // El componente resolverá el nombre
        entityType: data.type === 'ENTRADA' ? 'Proveedor' : 'Cliente',
        user: data.createdByName || data.createdByEmail || 'Desconocido',
        correlative: data.correlative
      });
    });

    notesSnap.forEach(doc => {
      const data = doc.data();
      history.push({
        id: doc.id,
        rawDate: data.createdAt ? data.createdAt.toDate() : new Date(),
        date: data.createdAt ? data.createdAt.toDate().toLocaleDateString('es-VE') : 'N/A',
        time: data.createdAt ? data.createdAt.toDate().toLocaleTimeString('es-VE') : 'N/A',
        type: 'NOTA DE ENTREGA',
        entityId: data.customerData?.id || data.customerData?.rif || 'N/A',
        entityNameFallback: data.customerData?.name, // Las notas guardan el nombre snapshot
        entityType: 'Cliente',
        user: data.createdByName || data.createdByEmail || 'Desconocido',
        correlative: data.correlative
      });
    });

    // 4. Ordenar por fecha descendente
    history.sort((a, b) => b.rawDate - a.rawDate);

    return history;

  } catch (error) {
    console.error("Error obteniendo historial de auditoría:", error);
    return [];
  }
};