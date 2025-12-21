import { db } from '../firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc
} from 'firebase/firestore';
import { User } from '../types';

/**
 * Firebase User Storage Service
 * Stores user sign-in details in Firestore
 */

export const firebaseUserService = {
    /**
     * Save user to Firestore
     */
    async saveUser(user: User): Promise<User> {
        try {
            const userRef = doc(db, 'users', user.id);
            await setDoc(userRef, {
                ...user,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log('✅ User saved to Firebase:', user.id);
            return user;
        } catch (error) {
            console.error('❌ Error saving user to Firebase:', error);
            throw error;
        }
    },

    /**
     * Get user by phone number
     */
    async getUserByPhone(phone: string): Promise<User | null> {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('phone', '==', phone));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const userDoc = querySnapshot.docs[0];
            return userDoc.data() as User;
        } catch (error) {
            console.error('❌ Error getting user by phone:', error);
            throw error;
        }
    },

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<User | null> {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return null;
            }

            return userDoc.data() as User;
        } catch (error) {
            console.error('❌ Error getting user by ID:', error);
            throw error;
        }
    },

    /**
     * Update user data
     */
    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            });

            const updatedUser = await this.getUserById(userId);
            if (!updatedUser) {
                throw new Error('User not found after update');
            }

            console.log('✅ User updated in Firebase:', userId);
            return updatedUser;
        } catch (error) {
            console.error('❌ Error updating user:', error);
            throw error;
        }
    },

    /**
     * Get all users by role
     */
    async getUsersByRole(role: string): Promise<User[]> {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', role));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => doc.data() as User);
        } catch (error) {
            console.error('❌ Error getting users by role:', error);
            throw error;
        }
    }
};
