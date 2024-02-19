import { CommonModule } from '@angular/common';
import { Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take, tap } from 'rxjs';
import {
  ObjectTypeState,
  actions,
  selectFilterObjectTypes,
  selectSimplerFilterObjectTypes,
} from './reducers';
import { filters } from './utils';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  objectTypesLenght$: Observable<number>;
  objectTypes$: Observable<any[]>;
  filteredObjectTypesLength$: Observable<number> = new Observable();
  filters: any = filters.filters;
  name = '';
  tag = '';
  namespace = 'custom';
  executionTime = 0;
  filterMethod = '';

  constructor(public store: Store<{ objectTypes: ObjectTypeState }>) {
    this.objectTypesLenght$ = this.store
      .select('objectTypes')
      .pipe(map(({ objectTypes }) => objectTypes?.length ?? 0));

    this.objectTypes$ = this.store
      .select('objectTypes')
      .pipe(map(({ objectTypes }) => objectTypes));

    this.filteredObjectTypesLength$ = this.store
      .select('objectTypes')
      .pipe(map(({ filteredObjectTypes }) => filteredObjectTypes?.length ?? 0));
  }

  dispatchFilter() {
    this.filterMethod = 'Complex';
    performance.mark('start');
    this.filteredObjectTypesLength$ = this.store
      .select(selectFilterObjectTypes(filters.filters))
      .pipe(
        tap(() => {
          performance.mark('end');
          const measure = performance.measure('Filtering', 'start', 'end');
          console.log('Filter duration: ' + measure.duration + ' milliseconds');
          this.executionTime = measure.duration;
        }),
        map((types) => types.length)
      );
  }

  dispatchSimpleFilter() {
    this.filterMethod = 'Simpler';
    performance.mark('start simple');
    this.filteredObjectTypesLength$ = this.store
      .select(
        selectSimplerFilterObjectTypes(this.name, this.tag, this.namespace)
      )
      .pipe(
        tap(() => {
          performance.mark('end simple');
          const measure = performance.measure(
            'Filtering',
            'start simple',
            'end simple'
          );
          console.log(
            'Simpler Filter duration: ' + measure.duration + ' milliseconds'
          );
          this.executionTime = measure.duration;
        }),
        map((types) => types.length)
      );
  }
}
