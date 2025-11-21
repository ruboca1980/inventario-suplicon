import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from './config';

const SERIALS_COLLECTION = 'serials';

// Función para obtener los seriales disponibles de un producto específico
export const getAvailableSerialsForProduct = async (productId) => {
    const serialsRef = collection(db, SERIALS_COLLECTION);

    // Creamos una consulta con dos condiciones:
    // 1. Que el 'productId' coincida.
    // 2. Que el 'status' sea exactamente "En Stock".
    const q = query(serialsRef, 
        where("productId", "==", productId), 
        where("status", "==", "En Stock")
    );

    try {
        const querySnapshot = await getDocs(q);
        const availableSerials = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return availableSerials;
    } catch (error) {
        console.error("Error al obtener seriales disponibles:", error);
        return []; // Devolver un array vacío en caso de error
    }
};