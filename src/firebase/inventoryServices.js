import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from './config';

/**
 * Obtiene el stock de un producto específico por su ID.
 * @param {string} productId - El ID del producto.
 * @returns {Promise<number>} - El stock actual del producto.
 */
export const getStockByProductId = async (productId) => {
    const inventoryRef = doc(db, "inventory", productId);
    try {
        const docSnap = await getDoc(inventoryRef);
        if (docSnap.exists()) {
            return docSnap.data().currentStock;
        } else {
            return 0; // Si no hay registro, el stock es 0
        }
    } catch (error) {
        console.error("Error al obtener el stock:", error);
        return 0;
    }
};
/**
 * Obtiene todos los registros del inventario en tiempo real.
 * @param {function} callback - Función que se ejecuta cada vez que los datos cambian.
 */
export const getInventoryRealTime = (callback) => {
    const inventoryCollection = collection(db, "inventory");
    return onSnapshot(inventoryCollection, (querySnapshot) => {
        const inventory = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(inventory);
    });
};