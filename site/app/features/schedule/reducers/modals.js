import produce from 'immer';
import {stateReducer} from '@truefit/redux-utils';

import {SESSION_SELECTED, TOGGLE_CONFERENCE_MODAL} from '../actions';

const INITIAL = {
  sessionModalVisible: false,

  conferenceModalVisible: false,
};

export default stateReducer(INITIAL, {
  [SESSION_SELECTED]: (state, payload) =>
    produce(state, draft => {
      draft.sessionModalVisible = payload != null;
    }),

  [TOGGLE_CONFERENCE_MODAL]: state =>
    produce(state, draft => {
      draft.conferenceModalVisible = !state.conferenceModalVisible;
    }),
});
