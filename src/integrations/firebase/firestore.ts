import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  created_at: Date;
  updated_at: Date;
  is_sent: boolean;
}

export interface NotificationRecipient {
  id: string;
  notification_id: string;
  user_id: string;
  read_at: Date | null;
  created_at: Date;
}

// Profile functions
export const createProfile = async (userId: string, displayName: string) => {
  try {
    const docRef = await addDoc(collection(db, 'profiles'), {
      user_id: userId,
      display_name: displayName,
      avatar_url: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { data: { id: docRef.id }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getProfile = async (userId: string) => {
  try {
    const q = query(collection(db, 'profiles'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: null, error: null };
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      data: {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate(),
        updated_at: data.updated_at?.toDate()
      } as Profile,
      error: null
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateProfile = async (profileId: string, updates: Partial<Profile>) => {
  try {
    await updateDoc(doc(db, 'profiles', profileId), {
      ...updates,
      updated_at: serverTimestamp()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Notification functions
export const getNotifications = async (userId: string) => {
  try {
    // Get notification recipients for this user
    const recipientsQuery = query(
      collection(db, 'notification_recipients'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const recipientsSnapshot = await getDocs(recipientsQuery);
    const notifications = [];
    
    for (const recipientDoc of recipientsSnapshot.docs) {
      const recipientData = recipientDoc.data();
      
      // Get the actual notification
      const notificationDoc = await getDoc(doc(db, 'notifications', recipientData.notification_id));
      
      if (notificationDoc.exists()) {
        const notificationData = notificationDoc.data();
        notifications.push({
          id: notificationDoc.id,
          ...notificationData,
          created_at: notificationData.created_at?.toDate(),
          updated_at: notificationData.updated_at?.toDate(),
          read_at: recipientData.read_at?.toDate()
        });
      }
    }
    
    return { data: notifications, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    const q = query(
      collection(db, 'notification_recipients'),
      where('user_id', '==', userId),
      where('notification_id', '==', notificationId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        read_at: serverTimestamp()
      });
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Real-time subscription for notifications
export const subscribeToNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  const q = query(
    collection(db, 'notification_recipients'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const notifications = [];
    
    for (const recipientDoc of snapshot.docs) {
      const recipientData = recipientDoc.data();
      
      // Get the actual notification
      const notificationDoc = await getDoc(doc(db, 'notifications', recipientData.notification_id));
      
      if (notificationDoc.exists()) {
        const notificationData = notificationDoc.data();
        notifications.push({
          id: notificationDoc.id,
          ...notificationData,
          created_at: notificationData.created_at?.toDate(),
          updated_at: notificationData.updated_at?.toDate(),
          read_at: recipientData.read_at?.toDate()
        });
      }
    }
    
    callback(notifications);
  });
};