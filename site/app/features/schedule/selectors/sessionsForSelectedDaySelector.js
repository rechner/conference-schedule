import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import selectedDaySelector from './selectedDaySelector';
import sessionsSelector from './sessionsSelector';
import favoritesSelector from './favoritesSelector';
import selectedConferenceSelector from './selectedConferenceSelector';
import {favoritesFilterSelector} from '../../shared/selectors';

export default createSelector(
  selectedConferenceSelector,
  selectedDaySelector,
  sessionsSelector,
  favoritesSelector,
  favoritesFilterSelector,
  (conference, day, allSessions, favorites, favoritesFilter) => {
    const sessions = (allSessions || []).filter(s => {
      if (!moment(s.startTime).isSame(day, 'day')) {
        return false;
      }

      return !favoritesFilter || favorites[conference.title].includes(s.id);
    });

    return _.sortBy(sessions, s => moment(s.startTime));
  },
);
