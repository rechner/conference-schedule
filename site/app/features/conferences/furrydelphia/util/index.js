import {loadSchedule, loadSession} from '../actions';

export default () => ({
  title: 'Furrydelphia',
  loadSchedule,
  loadSession,
  days: ['2019-08-16', '2019-08-17', '2019-08-18'],
  tags: ['furrydelphia'],
  location: 'King of Prussia, PA',
  site: 'https://www.furrydelphia.org/',
  image:
    'https://pbs.twimg.com/profile_images/1114566057967128576/oeLqboxj_400x400.png',
});
