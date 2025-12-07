import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración literal tomada de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBSI-iG6uTUw8Vlzx5f6whsT_MfS4TOM8A",
  authDomain: "construct-ia.firebaseapp.com",
  projectId: "construct-ia",
  storageBucket: "construct-ia.firebasestorage.app",
  messagingSenderId: "586113670224",
  appId: "1:586113670224:web:98a1d0f679acd2fbfac555",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar instancia de Auth para usar en el chat
export const auth = getAuth(app);

