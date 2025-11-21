import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, where, getDoc } from "firebase/firestore";
import { db } from './config';

const PRODUCTS_COLLECTION = 'products';

/**
 * Verifica si un SKU ya existe en la base de datos, excluyendo opcionalmente un ID de producto.
 * @param {string} sku - El SKU a verificar.
 * @param {string|null} currentProductId - El ID del producto actual que se está editando (para no compararlo consigo mismo).
 * @returns {Promise<boolean>} - Devuelve true si el SKU ya existe, de lo contrario false.
 */
export const checkSkuExists = async (sku, currentProductId = null) => {
    // Crea una consulta para buscar documentos con el mismo SKU
    const q = query(collection(db, PRODUCTS_COLLECTION), where("sku", "==", sku));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return false; // No se encontró ningún producto con ese SKU, está disponible.
    }

    // Si estamos editando, necesitamos asegurarnos de que el SKU encontrado no pertenezca al mismo producto.
    if (currentProductId) {
        // Si el único producto encontrado es el que estamos editando, el SKU es válido.
        return querySnapshot.docs[0].id !== currentProductId;
    }

    // Si no estamos editando y se encontró algo, el SKU ya existe.
    return true;
};

// --- FUNCIONES EXISTENTES ---
export const addProduct = (productData) => {
    return addDoc(collection(db, PRODUCTS_COLLECTION), productData);
};

export const updateProduct = (productId, productData) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    return updateDoc(productRef, productData);
};

export const deleteProduct = (productId) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    return deleteDoc(productRef);
};

export const getProductsRealTime = (callback) => {
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(productsCollection, (querySnapshot) => {
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(products);
    });
};