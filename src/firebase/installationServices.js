import { 
  collection, query, where, getDocs, doc, updateDoc, getDoc 
} from "firebase/firestore";
import { db, auth } from './config'; // ¡Importamos auth para la auditoría!

/**
 * 1. Obtiene los equipos despachados (status: "Asignado") pendientes por instalar.
 * Cruza información con Productos y Clientes.
 */
export const getPendingInstallations = async () => {
  try {
    // Buscar seriales con estado "Asignado"
    const q = query(collection(db, "serials"), where("status", "==", "Asignado"));
    const snapshot = await getDocs(q);

    const equipmentList = [];

    for (const serialDoc of snapshot.docs) {
      const serialData = serialDoc.data();
      const serialId = serialDoc.id;

      // Objeto base
      let item = {
        id: serialId,
        serialNumber: serialData.serialNumber,
        productId: serialData.productId,
        exitTransactionId: serialData.exitTransactionId,
        // Valores por defecto
        productName: 'Cargando...',
        brand: '',
        clientName: 'Cargando...',
        dispatchDate: null,
      };

      // Buscar datos del Producto
      if (serialData.productId) {
        const prodSnap = await getDoc(doc(db, "products", serialData.productId));
        if (prodSnap.exists()) {
          const prod = prodSnap.data();
          item.productName = prod.description;
          item.brand = prod.brand;
          item.category = prod.category;
        }
      }

      // Buscar datos de la Salida (para saber Cliente y Fecha)
      if (serialData.exitTransactionId) {
        const exitSnap = await getDoc(doc(db, "transaction_batches", serialData.exitTransactionId));
        if (exitSnap.exists()) {
          const exitData = exitSnap.data();
          item.dispatchDate = exitData.date.toDate(); // Fecha de despacho
          
          // Buscar nombre del cliente
          if (exitData.customerId) {
            const clientSnap = await getDoc(doc(db, "customers", exitData.customerId));
            if (clientSnap.exists()) {
              item.clientName = clientSnap.data().name;
            }
          }
        }
      }

      equipmentList.push(item);
    }

    return equipmentList;

  } catch (error) {
    console.error("Error obteniendo instalaciones pendientes:", error);
    return [];
  }
};

/**
 * 2. Registra la instalación de un equipo.
 * Cambia el estado a "Instalado", guarda detalles y la huella del usuario.
 */
export const registerInstallation = async (serialId, installData) => {
  try {
    const currentUser = auth.currentUser;
    const serialRef = doc(db, "serials", serialId);
    
    await updateDoc(serialRef, {
      status: "Instalado", // Cambiamos el estado
      
      // Datos de la instalación
      installationDate: installData.installationDate,
      location: installData.location, // Objeto { macolla, pozo }
      reportUrl: installData.reportUrl, // Link del reporte
      technician: installData.technician,
      
      installedAt: new Date(), // Fecha de registro en sistema
      
      // --- AUDITORÍA AUTOMÁTICA ---
      installedByUid: currentUser ? currentUser.uid : 'unknown',
      installedByEmail: currentUser ? currentUser.email : 'unknown'
    });
    
    console.log("Instalación registrada con éxito");
    return true;
  } catch (error) {
    console.error("Error registrando instalación:", error);
    throw error;
  }
};

/**
 * 3. Obtiene el historial de equipos ya instalados (status: "Instalado").
 */
export const getInstalledEquipment = async () => {
  try {
    const q = query(collection(db, "serials"), where("status", "==", "Instalado"));
    const snapshot = await getDocs(q);

    const equipmentList = [];

    for (const serialDoc of snapshot.docs) {
      const serialData = serialDoc.data();
      const serialId = serialDoc.id;

      let item = {
        id: serialId,
        ...serialData, // Trae location, reportUrl, technician, installedByEmail, etc.
        productName: 'Cargando...',
        clientName: 'Cargando...',
      };

      // Buscar datos del Producto
      if (serialData.productId) {
        const prodSnap = await getDoc(doc(db, "products", serialData.productId));
        if (prodSnap.exists()) {
          const prod = prodSnap.data();
          item.productName = prod.description;
          item.brand = prod.brand;
        }
      }

      // Buscar Cliente
      if (serialData.exitTransactionId) {
        const exitSnap = await getDoc(doc(db, "transaction_batches", serialData.exitTransactionId));
        if (exitSnap.exists()) {
          const exitData = exitSnap.data();
          if (exitData.customerId) {
            const clientSnap = await getDoc(doc(db, "customers", exitData.customerId));
            if (clientSnap.exists()) {
              item.clientName = clientSnap.data().name;
            }
          }
        }
      }

      equipmentList.push(item);
    }

    return equipmentList;

  } catch (error) {
    console.error("Error obteniendo historial de instalaciones:", error);
    return [];
  }
};

/**
 * 4. Obtiene los conteos para el Dashboard (Pendientes vs Instalados).
 */
export const getInstallationStats = async () => {
  try {
    const qPending = query(collection(db, "serials"), where("status", "==", "Asignado"));
    const qInstalled = query(collection(db, "serials"), where("status", "==", "Instalado"));

    const [snapPending, snapInstalled] = await Promise.all([
      getDocs(qPending),
      getDocs(qInstalled)
    ]);

    return {
      pending: snapPending.size,
      installed: snapInstalled.size
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return { pending: 0, installed: 0 };
  }
};