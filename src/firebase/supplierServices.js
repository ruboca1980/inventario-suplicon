import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './config';

const SUPPLIERS_COLLECTION = 'suppliers';

// FUNCIÓN PARA CREAR un nuevo proveedor
export const addSupplier = (supplierData) => {
    return addDoc(collection(db, SUPPLIERS_COLLECTION), supplierData);
};

// FUNCIÓN PARA ACTUALIZAR un proveedor
export const updateSupplier = (supplierId, supplierData) => {
    const supplierRef = doc(db, SUPPLIERS_COLLECTION, supplierId);
    return updateDoc(supplierRef, supplierData);
};

// FUNCIÓN PARA ELIMINAR un proveedor
export const deleteSupplier = (supplierId) => {
    const supplierRef = doc(db, SUPPLIERS_COLLECTION, supplierId);
    return deleteDoc(supplierRef);
};

// FUNCIÓN PARA OBTENER proveedores en TIEMPO REAL
export const getSuppliersRealTime = (callback) => {
    const suppliersCollection = collection(db, SUPPLIERS_COLLECTION);
    return onSnapshot(suppliersCollection, (querySnapshot) => {
        const suppliers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(suppliers);
    });
};