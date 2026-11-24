import type { HistoryRecord } from '../types/index';

const STORAGE_KEY = 'drishti_history';
const MAX_RECORDS = 50;

class HistoryService {
  private readFromStorage(): HistoryRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed as HistoryRecord[];
    } catch {
      return [];
    }
  }

  private writeToStorage(records: HistoryRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to write history to localStorage:', error);
    }
  }

  /**
   * Add a recognition record.
   * By default, photographs are stripped before persisting to ensure privacy
   * and conserve local device storage.
   */
  addRecord(record: HistoryRecord): void {
    const records = this.readFromStorage();

    // Privacy by default: do not store currency photographs in persistent storage
    const sanitizedRecord: HistoryRecord = {
      id: record.id,
      denomination: record.denomination,
      confidence: record.confidence,
      status: record.status || (record.confidence !== undefined && record.confidence >= 0.5 ? 'success' : 'uncertain'),
      timestamp: record.timestamp || Date.now(),
      isDemo: Boolean(record.isDemo),
      recognitionMode: record.recognitionMode || (record.isDemo ? 'demo' : 'real'),
      engineUsed: record.engineUsed,
      // imageUrl intentionally omitted for privacy
    };

    records.unshift(sanitizedRecord);

    // Auto-trim oldest records beyond the maximum
    if (records.length > MAX_RECORDS) {
      records.length = MAX_RECORDS;
    }

    this.writeToStorage(records);
  }

  getHistory(): HistoryRecord[] {
    return this.readFromStorage();
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history from localStorage:', error);
    }
  }

  getRecordById(id: string): HistoryRecord | null {
    const records = this.readFromStorage();
    return records.find((record) => record.id === id) ?? null;
  }
}

export const historyService = new HistoryService();
export default historyService;
export { HistoryService };
