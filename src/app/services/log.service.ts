import { Injectable } from '@angular/core';

export interface E1Log {
  id?: number;
  LogType: string;
  Message: string;
  DateTime: string;
  Url?: string;
  Stack?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private readonly dbName = 'E1LogDB';
  private readonly dbVersion = 1;
  private readonly storeName = 'E1Log';

  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.openDatabase();
  }

  private openDatabase(): Promise<IDBDatabase> {

    return new Promise((resolve, reject) => {

      const request = indexedDB.open(
        this.dbName,
        this.dbVersion
      );

      request.onupgradeneeded = (event: any) => {

        const db: IDBDatabase = event.target.result;

        if (!db.objectStoreNames.contains(this.storeName)) {

          db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(
          'Failed to open E1Log IndexedDB:',
          request.error
        );

        reject(request.error);
      };
    });
  }

  /**
   * Store an error log
   */
  error(
    message: string,
    stack?: string
  ): void {

    this.addLog({
      LogType: 'Error',
      Message: message,
      DateTime: new Date().toISOString(),
      Url: window.location.href,
      Stack: stack
    });
  }

  /**
   * Store a warning log
   */
  warning(
    message: string
  ): void {

    this.addLog({
      LogType: 'Warning',
      Message: message,
      DateTime: new Date().toISOString(),
      Url: window.location.href
    });
  }

  /**
   * Store an information log
   */
  info(
    message: string
  ): void {

    this.addLog({
      LogType: 'Info',
      Message: message,
      DateTime: new Date().toISOString(),
      Url: window.location.href
    });
  }

  private async addLog(log: E1Log): Promise<void> {

    try {

      const db = await this.dbReady;

      const transaction = db.transaction(
        this.storeName,
        'readwrite'
      );

      const store = transaction.objectStore(
        this.storeName
      );

      store.add(log);

    } catch (error) {

      // Never allow logging failure to break the application.
      console.error(
        'Failed to save E1Log:',
        error
      );
    }
  }

  /**
   * Get all logs
   */
  async getLogs(): Promise<E1Log[]> {

    const db = await this.dbReady;

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(
        this.storeName,
        'readonly'
      );

      const store = transaction.objectStore(
        this.storeName
      );

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}