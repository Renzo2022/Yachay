import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import type { Unsubscribe } from 'firebase/auth'
import { firebaseAuth } from '../../services/firebase/firebase.ts'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

export const signInWithGoogle = async () => signInWithPopup(firebaseAuth, provider)

export const logout = async () => signOut(firebaseAuth)

export const observeAuthState = (callback: (user: User | null) => void): Unsubscribe =>
  onAuthStateChanged(firebaseAuth, callback)
