import { ErrorHandler, Injectable } from '@angular/core';

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
export class LogService implements ErrorHandler {

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

  handleError(error: any): void {

    const message = error?.message || String(error);
    const stack = error?.stack;

    this.error(message, stack);

    // Keep normal Angular/browser console error
    console.error(error);
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

  exportLogs(): void {

    this.getLogs().then(logs => {

      if (!logs || logs.length === 0) {
        console.warn('No log data available to export.');
        return;
      }

      const json = JSON.stringify(logs, null, 2);

      const blob = new Blob(
        [json],
        { type: 'application/json' }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      const date = new Date()
        .toISOString()
        .replace(/[:.]/g, '-');

      link.href = url;
      link.download = `E1Log_${date}.json`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    })
      .catch(error => {

        console.error(
          'Failed to export E1Log:',
          error
        );
      });
  }

  // handleError(error: any): void {

  //   const message = this.getErrorMessage(error);
  //   const stack = this.getErrorStack(error);

  //   this.logService.error(message, stack);

  //   // Keep Angular's normal console error behavior
  //   console.error(error);
  // }

  // private getErrorMessage(error: any): string {

  //   if (!error) {
  //     return 'Unknown application error';
  //   }

  //   if (error.message) {
  //     return error.message;
  //   }

  //   return String(error);
  // }

  // private getErrorStack(error: any): string | undefined {

  //   if (error && error.stack) {
  //     return error.stack;
  //   }

  //   return undefined;
  // }

}