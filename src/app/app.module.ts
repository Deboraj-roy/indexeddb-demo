import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { IndexedDBService } from './services/indexed-db.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    {
      provide: ErrorHandler,
      useExisting: IndexedDBService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
