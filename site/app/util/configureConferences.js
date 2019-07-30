import moment from 'moment';
import configureFurrydelphia from '../features/conferences/furrydelphia/util';

const configurations = [
  configureFurrydelphia,
];

export const CONFERENCES = [];

const DATE_FORMAT = 'YYYY-MM-DD';
const configureAndStore = conferenceConfig => {
  const conference = conferenceConfig();

  CONFERENCES.push({
    ...conference,
    days: conference.days.map(x => moment(x, DATE_FORMAT)),
  });
};

export default () => {
  configurations.forEach(configureAndStore);
};
