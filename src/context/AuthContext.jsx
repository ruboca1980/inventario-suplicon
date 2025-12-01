import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// 1. Creamos el contexto
export const AuthContext = createContext();

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// 2. Creamos el proveedor
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Datos extra (rol, status, foto)
  const [loading, setLoading] = useState(true);

  // Registro: Crea usuario en Auth y en Firestore con rol 'user' y status 'pending'
  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Guardamos los datos extendidos en Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      uid: firebaseUser.uid,
      name: name,
      email: email,
      role: "user", // Por defecto
      status: "pending", // Por defecto entra al limbo
      photoURL: "", // Campo para foto futura
      createdAt: new Date()
    });
  };

  const login = async (email, password) => {
    // Establecer persistencia de sesión (se cierra al cerrar pestaña/ventana)
    await setPersistence(auth, browserSessionPersistence);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // --- INACTIVIDAD (10 MINUTOS) ---
  const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutos en milisegundos

  const handleLogout = useCallback(() => {
    if (user) {
      console.log("Cerrando sesión por inactividad...");
      logout();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, INACTIVITY_LIMIT);
    };

    // Eventos a escuchar
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    // Iniciar timer
    resetTimer();

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Limpieza
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, handleLogout]);
  // --------------------------------

  // Efecto maestro: Escucha cambios de sesión Y cambios en el perfil de base de datos
  useEffect(() => {
    // Configurar persistencia de sesión al cargar la app
    setPersistence(auth, browserSessionPersistence).catch(error => {
      console.error("Error setting persistence:", error);
    });

    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 1. Si hay usuario logueado, escuchamos su documento en Firestore en tiempo real
        const userRef = doc(db, "users", currentUser.uid);

        unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            // Combinamos la info de Auth con la info de la Base de Datos
            const firestoreData = docSnap.data();
            setUser({ ...currentUser, ...firestoreData }); // user ahora tiene .role y .status
            setUserData(firestoreData);
          } else {
            // Caso raro: Usuario en Auth pero no en BD (ej: borrado manual)
            setUser(currentUser);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error escuchando perfil de usuario:", error);
          setLoading(false);
        });

      } else {
        // 2. Si no hay usuario (logout), limpiamos todo
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (unsubscribeFirestore) unsubscribeFirestore();
      }
    });

    // Limpieza al desmontar
    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // Valores que exponemos a toda la app
  const value = {
    user,       // Objeto combinado (Auth + Firestore)
    userData,   // Solo datos de Firestore
    loading,
    signup,
    login,
    logout,
    // Helpers para verificar roles fácilmente
    isProgrammer: user?.role === 'programmer',
    isAdmin: user?.role === 'admin' || user?.role === 'programmer', // El programador también es admin
    isUser: user?.role === 'user',
    isActive: user?.status === 'active'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};