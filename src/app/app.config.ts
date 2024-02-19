import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { reducers } from './reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore(reducers),
    provideStoreDevtools(),
  ],
};
