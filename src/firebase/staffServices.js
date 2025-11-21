import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './config';

const STAFF_COLLECTION = 'staff';

export const addStaff = (staffData) => {
    return addDoc(collection(db, STAFF_COLLECTION), staffData);
};

export const updateStaff = (staffId, staffData) => {
    const staffRef = doc(db, STAFF_COLLECTION, staffId);
    return updateDoc(staffRef, staffData);
};

export const deleteStaff = (staffId) => {
    const staffRef = doc(db, STAFF_COLLECTION, staffId);
    return deleteDoc(staffRef);
};

export const getStaffRealTime = (callback) => {
    const staffCollection = collection(db, STAFF_COLLECTION);
    return onSnapshot(staffCollection, (querySnapshot) => {
        const staff = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(staff);
    });
};