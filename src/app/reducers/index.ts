import { isDevMode } from '@angular/core';
import {
  ActionReducerMap,
  createActionGroup,
  createReducer,
  createSelector,
  props,
} from '@ngrx/store';
import {
  createObjectTypes,
  matchesTag,
  matchesTypes,
  matchesObjectTypes,
  intersectionOfTwoArrayOfObjects,
} from './utils';

export type ObjectTypeState = {
  filteredObjectTypes: any[];
  objectTypes: any[];
  loading: boolean;
  error: unknown;
};

export interface State {
  objectTypes: ObjectTypeState;
}

const initialState: ObjectTypeState = {
  filteredObjectTypes: [],
  objectTypes: createObjectTypes(),
  loading: false,
  error: '',
};

export const actions = createActionGroup({
  source: 'ObjectType',
  events: {
    'Filter Object Types': props<{ filters: Array<any> }>(),
  },
});

export const reducers: ActionReducerMap<State> = {
  objectTypes: createReducer(initialState),
};

export const selectObjectTypes = (state: { objectTypes: ObjectTypeState }) =>
  state.objectTypes.objectTypes;

export const selectFilterObjectTypes = (filters: any[]) =>
  createSelector(selectObjectTypes, (objectTypes) => {
    if (filters.length === 0) {
      return objectTypes;
    }

    const tagFilters = filters.filter((filter) => filter.type === 'tag');
    const namespaceFilters = filters.filter(
      (filter) => filter.type === 'namespace'
    );
    const objectTypeFilters = filters.filter(
      (filter) => filter.type === 'objectType'
    );

    const filterObjectTypesByTags: any[] = tagFilters.reduce((prev, curr) => {
      const otypes = objectTypes.filter((ot: any) => {
        return matchesTag(curr, ot);
      });

      return [...prev, ...otypes];
    }, []);

    const filterObjectTypesByTypeOrigin: any[] = namespaceFilters.reduce(
      (prev, curr) => {
        const otypes = objectTypes.filter((ot: any) => {
          return matchesTypes(curr, ot);
        });

        return [...prev, ...otypes];
      },
      []
    );

    const filterObjectTypesById: any[] = objectTypeFilters.reduce(
      (prev, curr) => {
        const otypes = objectTypes.filter((ot: any) => {
          return matchesObjectTypes(curr, ot);
        });

        return [...prev, ...otypes];
      },
      []
    );

    let result = [];
    const eachFilterLengthArray = [
      filterObjectTypesByTags.length,
      filterObjectTypesByTypeOrigin.length,
      filterObjectTypesById.length,
    ];
    const helper = {
      0: filterObjectTypesByTags,
      1: filterObjectTypesByTypeOrigin,
      2: filterObjectTypesById,
    };

    const filtersResults = eachFilterLengthArray.map((len, index) =>
      // @ts-ignore
      len > 0 ? helper[index] : undefined
    );
    const filtersThatHaveMatches = filtersResults.filter((r) => r?.length > 0);

    if (filtersThatHaveMatches.length === 1) {
      result = filtersThatHaveMatches[0];
    } else if (filtersThatHaveMatches.length === 2) {
      result = intersectionOfTwoArrayOfObjects(
        filtersThatHaveMatches[0],
        filtersThatHaveMatches[1],
        'id'
      );
    } else if (filtersThatHaveMatches.length === 3) {
      const first = intersectionOfTwoArrayOfObjects(
        filtersThatHaveMatches[0],
        filtersThatHaveMatches[1],
        'id'
      );

      result = intersectionOfTwoArrayOfObjects(
        first,
        filtersThatHaveMatches[2],
        'id'
      );
    }

    return result;
  });

export const selectSimplerFilterObjectTypes = (
  name: string,
  tag: string,
  namespace: string
) =>
  createSelector(selectObjectTypes, (objectTypes: any[]) => {
    const result = objectTypes.filter(
      (ot) =>
        ot.name.toLowerCase().includes(name.toLowerCase()) &&
        (tag.length ? ot.tags.includes(tag) : true) &&
        ot.namespace === namespace
    );

    return result;
  });
