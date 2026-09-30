import { ErrorHandler, Injectable } from '@angular/core';

export interface E1Log {
  id?: number;
  LogType: string;
  Message: string;
  DateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService implements ErrorHandler {

  private readonly dbName = 'E1LogDB';
  private readonly dbVersion = 1;
  private readonly storeName = 'E1Log';

  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.openDatabase();
    // Catch JavaScript errors that are not handled by Angular ErrorHandler.
    this.registerGlobalErrorHandlers();

  }

  // This function opens the IndexedDB database and creates the object store if it doesn't exist.
  private openDatabase(): Promise<IDBDatabase> {

    return new Promise((resolve, reject) => {

      // Open the IndexedDB database with the specified name and version.
      const request = indexedDB.open(
        this.dbName,
        this.dbVersion
      );

      // Handle the onupgradeneeded event to create the object store if it doesn't exist.
      request.onupgradeneeded = (event: any) => {

        const db: IDBDatabase = event.target.result;

        if (!db.objectStoreNames.contains(this.storeName)) {

          db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      };

      // Handle the onsuccess event to resolve the promise with the opened database.
      request.onsuccess = () => {
        resolve(request.result);
      };

      // Handle the onerror event to reject the promise with the error.
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
   * This function is called by Angular's ErrorHandler to log errors.
   */
  handleError(error: any): void {

    const message = error?.message || String(error);
    this.error(message);
    // Keep normal Angular/browser console error
    console.error(error);
  }


  /**
   * Registers browser-level global error handlers.
   *
   * window.onerror:
   * Captures JavaScript runtime errors that may not
   * be handled by Angular's ErrorHandler.
   *
   * unhandledrejection:
   * Captures unhandled Promise/async errors.
   */
  private registerGlobalErrorHandlers(): void {

    window.onerror = (
      message,
      source,
      lineno,
      colno,
      error
    ) => {

      const errorMessage =
        error?.message ||
        String(message);

      const stack =
        error?.stack ||
        `Source: ${source}, Line: ${lineno}, Column: ${colno}`;
      var errorMessageWithStack = errorMessage + '\n' + stack;

      this.error(
        errorMessageWithStack 
      );

      // Return false so the browser keeps its normal error handling.
      return false;
    };


    window.addEventListener(
      'unhandledrejection',
      (event: PromiseRejectionEvent) => {

        const reason = event.reason;

        const message =
          reason?.message ||
          String(reason);
        const stack =
          reason?.stack ||
          `Source: ${reason?.source}, Line: ${reason?.lineno}, Column: ${reason?.colno}`;
        var errorMessageWithStack = message + '\n' + stack;

        this.error(
          errorMessageWithStack 
        );

        // Keep the normal browser unhandled-rejection behavior.
        console.error(
          'Unhandled Promise rejection:',
          reason
        );
      }
    );
  }

  /**
   * Store an error log
   */
  error(
    message: string 
  ): void {

    this.addLog({
      LogType: 'Error',
      Message: message,
      DateTime: new Date().toISOString()
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
      DateTime: new Date().toISOString() 
    });
  }

   /**
   * Store a log
   */
  log(
    LogType: string,
    message: string 
  ): void {

    this.addLog({
      LogType: LogType,
      Message: message,
      DateTime: new Date().toISOString() 
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
      link.download = `E1Log_${new Date().toISOString().slice(0, 10)}.json`;

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

}