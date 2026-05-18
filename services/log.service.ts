import { auth, db } from '@/config/firebase';
import { endOfDay, parseISO, startOfDay } from 'date-fns';
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
    title: string;
    date: Timestamp;
}

export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all' | 'none';

export interface LogFilter {
    categoryType: string;
    timeRange: TimeRange;
    selectedDate?: string;
}

const COLLECTION_NAME = 'logs';



// --- Service Implementation ---

export const logService = {
    /**
     * CREATE: Adds a new expense log
     */
    async addLog(data: {
        title: string;
        note?: string;
        amount: number;
        category: string;
        date: Date;
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

    async fetchLogs(
    filters: LogFilter = { categoryType: 'all', timeRange: 'none' },
    userId: string,
    anchorDateString?: string
): Promise<ExpenseLog[]> {
    if (!userId) throw new Error("User must be authenticated");

    const logRef = collection(db, COLLECTION_NAME);

    const constraints: any[] = [
        where("userId", "==", userId),
    ];

    if (filters.categoryType !== 'all') {
        constraints.push(where("category", "==", filters.categoryType));
    }

    // 2. FILTER BY DATE RANGE (range filters after equality)
    if (filters.timeRange === 'day' && anchorDateString) {
        const anchorDate = parseISO(anchorDateString);
        constraints.push(where("createdAt", ">=", Timestamp.fromDate(startOfDay(anchorDate))));
        constraints.push(where("createdAt", "<=", Timestamp.fromDate(endOfDay(anchorDate))));
    }

    constraints.push(orderBy("createdAt", "desc"));

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