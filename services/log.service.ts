import { auth, db } from '@/config/firebase';
import { startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

// --- Types ---

export type LogType = 'personal' | 'family';

export interface ExpenseLog {
    id: string;
    userId: string;
    amount: number;
    category: string; // e.g., 'gym', 'groceries'
    type: LogType;    // 'personal' or 'family'
    note: string;
    createdAt: Timestamp;
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export interface LogFilter {
    categoryType: LogType | 'all';
    timeRange: TimeRange;
}

const COLLECTION_NAME = 'logs';

// --- Service Implementation ---

export const logService = {
    /**
     * CREATE: Adds a new expense log
     */
    async addLog(data: {
        amount: number;
        category: string;
        type: LogType;
        note: string
    }) {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be authenticated");

        const logRef = collection(db, COLLECTION_NAME);
        return await addDoc(logRef, {
            ...data,
            userId: user.uid,
            createdAt: serverTimestamp(),
        });
    },

    /**
     * READ: Fetches logs with dynamic filtering
     */
    async fetchLogs(filters: LogFilter = { categoryType: 'all', timeRange: 'all' }) {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be authenticated");

        const logRef = collection(db, COLLECTION_NAME);
        const constraints: any[] = [
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        ];

        // 1. Filter by Category Type (Personal vs Family)
        if (filters.categoryType !== 'all') {
            constraints.push(where("type", "==", filters.categoryType));
        }

        // 2. Filter by Time Range
        const now = new Date();
        if (filters.timeRange === 'week') {
            constraints.push(where("createdAt", ">=", startOfWeek(now)));
        } else if (filters.timeRange === 'month') {
            constraints.push(where("createdAt", ">=", startOfMonth(now)));
        } else if (filters.timeRange === 'year') {
            constraints.push(where("createdAt", ">=", startOfYear(now)));
        }

        const q = query(logRef, ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as ExpenseLog[];
    },

    /**
     * UPDATE: Edit an existing log
     */
    async updateLog(logId: string, updates: Partial<Omit<ExpenseLog, 'id' | 'userId' | 'createdAt'>>) {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be authenticated");

        const logRef = doc(db, COLLECTION_NAME, logId);
        return await updateDoc(logRef, updates);
    },

    /**
     * DELETE: Remove a log
     */
    async deleteLog(logId: string) {
        const user = auth.currentUser;
        if (!user) throw new Error("User must be authenticated");

        const logRef = doc(db, COLLECTION_NAME, logId);
        return await deleteDoc(logRef);
    }
};