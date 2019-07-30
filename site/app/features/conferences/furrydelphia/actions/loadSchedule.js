import _ from 'lodash';
import moment from 'moment';

import {get} from '@truefit/http-utils';
import {SCHEDULE_URL, FURRYDELPHIA_URL} from '../constants';
import {
  LOADING_SCHEDULE_DATA,
  LOADED_SCHEDULE_DATA,
  FAILED_LOADING_SCHEDULE_DATA,
} from 'schedule-actions';

const TC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

const parseSessions = sessionsList =>
  sessionsList.map(session => {
    const startTime = moment(session.StartTime, TC_DATE_FORMAT);
    const endTime = moment(session.EndTime, TC_DATE_FORMAT);
    const tags = session.Tags.map(t => t.Name);

    return {
      id: session.Id,
      title: session.Title,
      description: session.DescriptionHtml,

      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),

      roomId: session.Room,
      speakers: session.Speakers.map(s => s.Name),
      tags,

      rawSpeakers: session.Speakers,
    };
  });

const parseSpeakers = sessions => {
  const withDuplicates = sessions.map(s => s.rawSpeakers) |> _.flatten;
  const uniq = _.uniqBy(withDuplicates, s => s.Name);

  return uniq.map(s => ({
    id: s.Name,
    name: s.Name,
    bio: s.Bio,
    profilePicture: `${s.Photo}`,
  }));
};

const parseTags = sessions =>
  (sessions.map(s => s.tags) |> _.flatten |> _.uniq).map(s => ({
    id: s,
    name: s,
  }));

const parseRooms = sessions =>
  (sessions.map(s => s.roomId) |> _.uniq).map(room => ({
    id: room,
    name: room,
  }));

const mapToSharedModel = ({ScheduledSessions}) => {
  const sessions = ScheduledSessions |> parseSessions;
  const speakers = parseSpeakers(sessions);
  const tags = parseTags(sessions);
  const rooms = parseRooms(sessions);

  return {
    sessions,
    speakers,
    tags,
    rooms,
  };
};

export const loadSchedule = async dispatch => {
  dispatch({type: LOADING_SCHEDULE_DATA});

  try {
    const response = await get(SCHEDULE_URL);
    const payload = mapToSharedModel(response.data);

    dispatch({
      type: LOADED_SCHEDULE_DATA,
      payload,
    });
  } catch (err) {
    dispatch({
      type: FAILED_LOADING_SCHEDULE_DATA,
      payload: err,
    });
  }
};
