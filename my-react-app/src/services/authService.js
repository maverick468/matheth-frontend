// src/services/authService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import apiClient from "./apiClient";

export const authService = {
  async register({ name, email, password }) {
    let firebaseUser;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
      } else {
        throw err;
      }
    }

    const token = await firebaseUser.getIdToken();
    localStorage.setItem('token', token);

    const response = await apiClient.post('/auth/register', {
      firebaseUid: firebaseUser.uid,
      name,
      email,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  },

  async login(email, password) {
    // Handle both object or direct parameters safely
    const userEmail = typeof email === 'object' ? email.email : email;
    const userPassword = typeof email === 'object' ? email.password : password;

    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const firebaseUser = userCredential.user;
    const token = await firebaseUser.getIdToken();

    localStorage.setItem('token', token);

    const response = await apiClient.post('/auth/login', {
      firebaseUid: firebaseUser.uid,
      email: userEmail
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  }
};