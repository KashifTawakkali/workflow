import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Workflow {
  id?: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const saveWorkflow = async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'workflows'), {
      ...workflow,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving workflow:', error);
    throw error;
  }
};

export const getWorkflows = async (): Promise<Workflow[]> => {
  try {
    const q = query(collection(db, 'workflows'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Workflow[];
  } catch (error) {
    console.error('Error getting workflows:', error);
    throw error;
  }
}; 