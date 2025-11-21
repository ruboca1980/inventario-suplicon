import { collection, doc, runTransaction, serverTimestamp, getDoc, query, where, getDocs } from "firebase/firestore";
import { db, auth } from './config'; // ¡IMPORTANTE: Importamos 'auth'!

// (La función getNextCorrelative se queda igual)
export const getNextCorrelative = async (type) => {
  const correlativeRef = doc(db, 'app_meta', 'counters');
  try {
    const correlativeDoc = await getDoc(correlativeRef);
    if (correlativeDoc.exists()) {
      const currentYear = new Date().getFullYear().toString().slice(-2);
      let prefix = ''; 
      let counterField = ''; 

      if (type === 'entry') {
        prefix = 'ENT';
        counterField = `lastEntryCorrelative_${currentYear}`;
      } else if (type === 'exit') {
        prefix = 'SAL';
        counterField = `lastExitCorrelative_${currentYear}`;
      } else if (type === 'deliveryNote') { 
        prefix = 'NE';
        counterField = `lastDeliveryNoteCorrelative_${currentYear}`;
      } else {
        throw new Error('Tipo de correlativo no válido'); 
      }

      const lastNumber = correlativeDoc.data()[counterField] || 0;
      const nextNumber = lastNumber + 1;
      return `${prefix}-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
    }
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const prefix = type === 'entry' ? 'ENT' : type === 'exit' ? 'SAL' : 'NE';
    return `${prefix}-${currentYear}-001`;
  } catch (error) {
    console.error("Error al obtener el siguiente correlativo: ", error);
    throw error;
  }
}

/**
 * Crea una nueva entrada (CON AUDITORÍA)
 */
export const createInventoryEntry = async (entryData) => {
  const correlativeRef = doc(db, "app_meta", "counters");
  
  // --- ¡AUDITORÍA AUTOMÁTICA! ---
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Usuario no autenticado.");
  
  const auditData = {
    createdByUid: currentUser.uid,
    createdByEmail: currentUser.email,
    // Si el nombre no está en Auth, usamos el email como fallback
    createdByName: currentUser.displayName || currentUser.email, 
    createdAt: serverTimestamp()
  };
  // ------------------------------

  try {
    await runTransaction(db, async (transaction) => {
      const correlativeDoc = await transaction.get(correlativeRef);
      const inventoryRefs = entryData.items.map(item => doc(db, "inventory", item.productId));
      const inventoryDocs = await Promise.all(inventoryRefs.map(ref => transaction.get(ref)));
      const productRefs = entryData.items.map(item => doc(db, "products", item.productId));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const counterField = `lastEntryCorrelative_${currentYear}`;
      
      let lastNumber = 0;
      if (correlativeDoc.exists()) {
        lastNumber = correlativeDoc.data()[counterField] || 0;
      }

      const newCorrelativeNumber = lastNumber + 1;
      const newCorrelative = `ENT-${currentYear}-${String(newCorrelativeNumber).padStart(3, '0')}`;

      const batchDocRef = doc(collection(db, "transaction_batches"));
      
      // Guardamos el lote con la HUELLA DIGITAL
      transaction.set(batchDocRef, {
        correlative: newCorrelative,
        type: "ENTRADA",
        date: entryData.entryDate || serverTimestamp(), 
        supplierId: entryData.supplierId,
        staffReceiverId: entryData.staffReceiverId,
        status: "Completado",
        ...auditData // <-- Inyectamos la auditoría
      });

      for (let i = 0; i < entryData.items.length; i++) {
        const item = entryData.items[i]; 
        const inventoryDoc = inventoryDocs[i]; 
        const inventoryRef = inventoryRefs[i]; 
        const productDoc = productDocs[i]; 
        
        if (!productDoc.exists()) {
          throw `La definición del producto no fue encontrada para el ID: ${item.productId}`;
        }
        const productData = productDoc.data(); 

        const transactionRef = collection(db, "transactions");
        transaction.set(doc(transactionRef), { 
          batchId: batchDocRef.id, 
          type: "ENTRADA",
          date: entryData.entryDate || serverTimestamp(),
          productId: item.productId,
          quantity: item.quantity,
          sku: productData.sku,
          description: productData.description,
          ...auditData // <-- Inyectamos la auditoría en cada línea también (opcional pero útil)
        });
        
        const inventoryDataPayload = {
          productId: item.productId,
          sku: productData.sku,
          productName: productData.description, 
          category: productData.category || '',
          brand: productData.brand || '',
          type: productData.type || '',
          unitOfMeasure: productData.unitOfMeasure || '',
          minStockLevel: productData.minStockLevel || 0, 
          lastUpdated: serverTimestamp(), 
        };

        if (inventoryDoc.exists()) {
          const newStock = inventoryDoc.data().currentStock + item.quantity;
          transaction.update(inventoryRef, {
            ...inventoryDataPayload, 
            currentStock: newStock,
          });
        } else {
          transaction.set(inventoryRef, {
            ...inventoryDataPayload,
            currentStock: item.quantity, 
          });
        }

        if (item.serials && item.serials.length > 0) {
          const serialsCollectionRef = collection(db, "serials");
          for (const serial of item.serials) {
            const serialDocRef = doc(serialsCollectionRef);
            transaction.set(serialDocRef, {
              serialNumber: serial,
              productId: item.productId, 
              status: "En Stock", 
              entryTransactionId: batchDocRef.id,
              // Los seriales también llevan huella de quién los ingresó
              registeredBy: auditData.createdByEmail, 
              registeredAt: auditData.createdAt
            });
          }
        }
      }

      transaction.set(correlativeRef, { [counterField]: newCorrelativeNumber }, { merge: true });
    });
    console.log("¡Entrada de inventario creada con éxito!");
  } catch (e) {
    console.error("Error en la transacción de entrada: ", e);
    throw new Error("No se pudo completar la entrada de inventario. " + (e.message || e));
  }
};

/**
 * Crea una nueva salida (CON AUDITORÍA)
 */
export const createInventoryExit = async (exitData) => {
  const correlativeRef = doc(db, "app_meta", "counters");

  // --- ¡AUDITORÍA AUTOMÁTICA! ---
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Usuario no autenticado.");
  
  const auditData = {
    createdByUid: currentUser.uid,
    createdByEmail: currentUser.email,
    createdByName: currentUser.displayName || currentUser.email,
    createdAt: serverTimestamp()
  };
  // ------------------------------

  try {
    await runTransaction(db, async (transaction) => {
      const correlativeDoc = await transaction.get(correlativeRef);
      const inventoryRefs = exitData.items.map(item => doc(db, "inventory", item.productId));
      const inventoryDocs = await Promise.all(inventoryRefs.map(ref => transaction.get(ref)));
      
      const serialRefsToUpdate = [];
      for (const item of exitData.items) {
        if (item.serials && item.serials.length > 0) {
          for (const serialNumber of item.serials) {
            const q = query(collection(db, "serials"), where("serialNumber", "==", serialNumber), where("status", "==", "En Stock"));
            const serialSnapshot = await getDocs(q); 
            if (serialSnapshot.empty) {
              throw new Error(`El serial ${serialNumber} no fue encontrado o ya no está en stock.`);
            }
            serialRefsToUpdate.push(serialSnapshot.docs[0].ref); 
          }
        }
      }

      for (let i = 0; i < exitData.items.length; i++) {
        if (!inventoryDocs[i].exists() || inventoryDocs[i].data().currentStock < exitData.items[i].quantity) {
          throw `Stock insuficiente para el producto con ID: ${exitData.items[i].productId}`;
        }
      }
      
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const counterField = `lastExitCorrelative_${currentYear}`;
      let lastNumber = 0;
      if (correlativeDoc.exists()) {
        lastNumber = correlativeDoc.data()[counterField] || 0;
      }
      const newCorrelativeNumber = lastNumber + 1;
      const newCorrelative = `SAL-${currentYear}-${String(newCorrelativeNumber).padStart(3, '0')}`;

      const batchDocRef = doc(collection(db, "transaction_batches"));
      
      // Guardamos el lote con la HUELLA DIGITAL
      transaction.set(batchDocRef, {
        correlative: newCorrelative,
        type: "SALIDA",
        date: exitData.exitDate || serverTimestamp(),
        customerId: exitData.customerId,
        staffIssuerId: exitData.staffIssuerId,
        status: "Completado",
        ...auditData // <-- Inyectamos auditoría
      });

      for (let i = 0; i < exitData.items.length; i++) {
        const item = exitData.items[i];
        const inventoryDoc = inventoryDocs[i];
        const inventoryRef = inventoryRefs[i];

        const transactionDocRef = doc(collection(db, "transactions"));
        transaction.set(transactionDocRef, {
          batchId: batchDocRef.id,
          type: "SALIDA",
          date: exitData.exitDate || serverTimestamp(),
          productId: item.productId,
          quantity: item.quantity,
          sku: inventoryDoc.data().sku,
          description: inventoryDoc.data().productName,
          category: inventoryDoc.data().category || '',
          brand: inventoryDoc.data().brand || '',
          serials: item.serials || [],
          ...auditData // <-- Inyectamos auditoría
        });

        const newStock = inventoryDoc.data().currentStock - item.quantity;
        transaction.update(inventoryRef, { currentStock: newStock, lastUpdated: serverTimestamp() });
      }

      for (const serialRef of serialRefsToUpdate) {
        transaction.update(serialRef, {
          status: "Asignado", 
          exitTransactionId: batchDocRef.id 
        });
      }

      transaction.set(correlativeRef, { [counterField]: newCorrelativeNumber }, { merge: true });
    });
    console.log("¡Salida de inventario creada con éxito!");
  } catch (e) {
    console.error("Error en la transacción de salida: ", e);
    throw new Error("No se pudo completar la salida de inventario. " + (e.message || e));
  }
};