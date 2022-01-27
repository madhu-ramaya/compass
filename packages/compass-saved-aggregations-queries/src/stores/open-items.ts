import { Reducer } from 'redux';

type Status = 'initial' | 'fetching' | 'refreshing' | 'error' | 'ready';

export type State = {
  isModalOpen: boolean;
  createCollectionStatus: Status;
  databases: string[];
  databasesStatus: Status;
  collections: string[];
  collectionsStatus: Status;
};

const INITIAL_STATE: State = {
  isModalOpen: false,
  createCollectionStatus: 'initial',
  databases: [],
  databasesStatus: 'initial',
  collections: [],
  collectionsStatus: 'initial',
};

export enum ActionTypes {
  OpenModal = 'compass-saved-aggregations-queries/openModal',
  CloseModal = 'compass-saved-aggregations-queries/closeModal',
  FetchDatabasesStatusChange = 'compass-saved-aggregations-queries/fetchDatabasesStatusChange',
  FetchCollectionsStatusChange = 'compass-saved-aggregations-queries/fetchCollectionsStatusChange',
  CreateNamespaceStatusChange = 'compass-saved-aggregations-queries/createNamespaceStatusChange',
}

type OpenModalAction = {
  type: ActionTypes.OpenModal;
};

type CloseModalAction = {
  type: ActionTypes.CloseModal;
};

type CreateNamespaceStatusChangeAction = {
  type: ActionTypes.CreateNamespaceStatusChange;
  status: Status;
};

type FetchDatabasesStatusChangeAction = {
  type: ActionTypes.FetchDatabasesStatusChange;
  status: Status;
};

type FetchCollectionsStatusChangeAction = {
  type: ActionTypes.FetchCollectionsStatusChange;
  status: Status;
};

export type Actions =
  | OpenModalAction
  | CloseModalAction
  | CreateNamespaceStatusChangeAction
  | FetchDatabasesStatusChangeAction
  | FetchCollectionsStatusChangeAction;

const reducer: Reducer<State, Actions> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ActionTypes.OpenModal:
      return {
        ...state,
        isModalOpen: true,
      };
    case ActionTypes.CloseModal:
      return {
        ...state,
        isModalOpen: false,
      };
    case ActionTypes.CreateNamespaceStatusChangeAction:
        return {
            
        }
    case ActionTypes.FetchDatabasesStatusChangeAction:
    case ActionTypes.FetchCollectionsStatusChangeAction:
    default:
      return state;
  }
};

export default reducer;
