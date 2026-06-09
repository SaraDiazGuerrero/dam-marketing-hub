import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'

export async function registerUser(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function logoutUser() {
  await signOut(auth)
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback)
}
