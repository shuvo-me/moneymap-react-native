import { auth, db } from '@/config/firebase';
import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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
    },

    async exportToCSV(logs: ExpenseLog[], fileNamePrefix: string = 'MoneyMap_Statement') {
        if (!logs || logs.length === 0) {
            throw new Error("No data available to export");
        }

        try {
            // 1. Build standard ledger headers
            const headers = ['Title', 'Date', 'Category', 'Amount', 'Note'];

            // 2. Map row entries safely escaping any string tokens
            const rows = logs.map(log => {
                const formattedDate = log.date
                    ? format(log.date.toDate(), 'yyyy-MM-dd HH:mm')
                    : '';
                // Escape double quotes to prevent breaking csv layout formatting
                const escapedTitle = `"${(log.title || '').replace(/"/g, '""')}"`;
                const category = `"${log.category || ''}"`;
                const amount = log.amount || 0;
                const escapedNote = `"${(log.note || '').replace(/"/g, '""')}"`;

                return [escapedTitle, formattedDate, category, amount, escapedNote].join(',');
            });

            // Combine headers and rows with line breaks
            const csvContent = [headers.join(','), ...rows].join('\n');

            // 3. Create file in document directory using modern API
            const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
            const fileName = `${fileNamePrefix}_${timestamp}.csv`;

            const file = new File(Paths.document, fileName);

            // 4. Write CSV content to file
            file.write(csvContent);

            // 5. Share the file using native share dialog
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Expense Report Statement',
                    UTI: 'public.comma-separated-values-text', // iOS metadata for CSV files
                });
            } else {
                throw new Error("Sharing capability is not available on this device");
            }

            return file.uri;
        } catch (error) {
            console.error('Export Engine Failure:', error);
            throw error;
        }
    }
};