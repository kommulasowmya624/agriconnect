import { User, Job, Equipment, WorkerProfile, Notification, UserRole } from '../types';
import { calculateDistance } from '../constants';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// Firestore collection names
const USERS_COLLECTION = 'users';
const JOBS_COLLECTION = 'jobs';
const EQUIPMENT_COLLECTION = 'equipment';

export const storageService = {
  // USER OPERATIONS

  // 1. Fetch User by Phone (For Login)
  getUserByPhone: async (phone: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      return null;
    }
  },

  // 2. Save/Register User (For Signup)
  saveUser: async (user: User): Promise<User> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.id);
      await setDoc(userRef, {
        ...user,
        available: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ User saved to Firestore:', user.id);
      return user;
    } catch (error) {
      console.error('❌ Error saving user to Firestore:', error);
      throw error;
    }
  },

  updateUser: async (id: string, updates: Partial<User> | { available: boolean }): Promise<User | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const updatedDoc = await getDoc(userRef);
      if (!updatedDoc.exists()) {
        return null;
      }

      return { id: updatedDoc.id, ...updatedDoc.data() } as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  getWorkers: async (lat: number, lng: number, radius: number = 50): Promise<WorkerProfile[]> => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('role', '==', UserRole.WORKER));
      const querySnapshot = await getDocs(q);

      const workers: WorkerProfile[] = [];
      querySnapshot.forEach((doc) => {
        const user = { id: doc.id, ...doc.data() } as User;
        const distance = calculateDistance(lat, lng, user.lat, user.lng);

        if (distance <= radius) {
          workers.push({
            id: user.id,
            name: user.name,
            skills: ['General Labor'],
            rating: 5.0,
            distance,
            available: (user as any).available ?? true,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
            lat: user.lat,
            lng: user.lng
          });
        }
      });

      return workers.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error fetching workers:', error);
      return [];
    }
  },

  // JOB OPERATIONS
  postJob: async (job: Job) => {
    try {
      const jobsRef = collection(db, JOBS_COLLECTION);
      const docRef = await addDoc(jobsRef, {
        ...job,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Job posted to Firestore:', docRef.id);
    } catch (error) {
      console.error('❌ Error posting job to Firestore:', error);
      throw error;
    }
  },

  updateJobStatus: async (id: string, status: string) => {
    try {
      const jobRef = doc(db, JOBS_COLLECTION, id);
      await updateDoc(jobRef, {
        status,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Job status updated:', id, status);
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  },

  getJobs: async (lat: number, lng: number, radius: number = 50): Promise<Job[]> => {
    try {
      const jobsRef = collection(db, JOBS_COLLECTION);
      const q = query(jobsRef, where('status', '==', 'OPEN'));
      const querySnapshot = await getDocs(q);

      const jobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        const job = { id: doc.id, ...doc.data() } as Job;
        const distance = calculateDistance(lat, lng, job.lat, job.lng);

        if (distance <= radius) {
          jobs.push({ ...job, distance });
        }
      });

      return jobs.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  getMyJobs: async (farmerId: string): Promise<Job[]> => {
    try {
      const jobsRef = collection(db, JOBS_COLLECTION);
      const q = query(jobsRef, where('farmerId', '==', farmerId));
      const querySnapshot = await getDocs(q);

      const jobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as Job);
      });

      return jobs;
    } catch (error) {
      console.error('Error fetching my jobs:', error);
      return [];
    }
  },

  // EQUIPMENT OPERATIONS
  addEquipment: async (item: Equipment) => {
    try {
      const equipRef = collection(db, EQUIPMENT_COLLECTION);
      const docRef = await addDoc(equipRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Equipment added to Firestore:', docRef.id);
    } catch (error) {
      console.error('❌ Error adding equipment to Firestore:', error);
      throw error;
    }
  },

  getEquipment: async (lat: number, lng: number, radius: number = 50): Promise<Equipment[]> => {
    try {
      const equipRef = collection(db, EQUIPMENT_COLLECTION);
      const querySnapshot = await getDocs(equipRef);

      const equipment: Equipment[] = [];
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as Equipment;
        const distance = calculateDistance(lat, lng, item.lat, item.lng);

        if (distance <= radius) {
          equipment.push({ ...item, distance });
        }
      });

      return equipment.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
  },

  // NOTIFICATIONS (Placeholder - can be implemented later)
  getNotifications: async (userId: string): Promise<Notification[]> => {
    return [];
  }
};
