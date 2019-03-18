import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {pipe, withHandlers, lifecycle} from '@synvox/rehook';

import WorkerImage from 'react-sw-img';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Divider from '@material-ui/core/Divider';

import Loading from './loading';

import {
  execute,
  selectSession,
  toggleFavorite,
  selectSessionModalModeDetail,
  selectSessionModalModeSpeakers,
} from '../actions';

import {
  modalsSelector,
  selectedConferenceSelector,
  selectedSessionSelector,
  speakersForSessionSelector,
  roomForSessionSelector,
  tagsForSessionSelector,
  isFavoriteSessionSelector,
  loadingSessionDetailSelector,
} from '../selectors';

import {
  SESSION_DETAIL_SELECTED,
  SESSION_SPEAKERS_SELECTED,
} from '../constants/actions';

import {AVATAR, DATA_STATE} from '../constants/misc';

// styles
const styles = () => ({
  dialogTitle: {
    paddingBottom: 0,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeSelection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  speakerTitle: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    marginRight: 10,

    height: 50,
    width: 50,

    borderRadius: 25,
  },

  divider: {
    marginTop: 10,
    marginBottom: 10,
  },
});

// helpers
const colorForButton = (modals, value) =>
  modals.sessionModalMode === value ? 'primary' : 'default';

// render
const Speakers = ({classes, speakers}) => {
  const divider = index =>
    index < speakers.length - 1 ? (
      <Divider className={classes.divider} variant="middle" />
    ) : null;

  return (
    <div>
      {speakers.map((speaker, i) => (
        <div key={speaker.id}>
          <div className={classes.speakerTitle}>
            <WorkerImage
              alt={speaker.name}
              placeholder={AVATAR}
              src={speaker.profilePicture}
              className={classes.avatar}
            />
            <Typography variant="h6">{speaker.name}</Typography>
          </div>
          <Typography
            component="p"
            variant="body2"
            dangerouslySetInnerHTML={{__html: speaker.bio}}
          />

          {divider(i)}
        </div>
      ))}
    </div>
  );
};

const SessionDetail = ({classes, speakers, room, tags, session}) => (
  <div>
    <Typography variant="subtitle2">
      <span className="bold">Room: </span>
      {room.name}
    </Typography>
    <Typography variant="subtitle2">
      <span className="bold">Speaker{speakers.length === 1 ? '' : 's'}: </span>
      {speakers.map(s => s.name).join(', ')}
    </Typography>
    <Typography variant="subtitle2">
      <span className="bold">Tags: </span>
      {tags.map(c => c.name).join(', ')}
    </Typography>
    <Divider className={classes.divider} variant="middle" />
    <Typography
      component="p"
      variant="body2"
      dangerouslySetInnerHTML={{__html: session.description}}
    />
  </div>
);

const Content = ({modals, loading, ...props}) => {
  if (loading === DATA_STATE.LOADING_DATA_NONE_CACHED) {
    return <Loading />;
  }

  if (modals.sessionModalMode === SESSION_DETAIL_SELECTED) {
    return <SessionDetail {...props} />;
  }

  return <Speakers {...props} />;
};

const ModeSelection = ({
  classes,
  modals,
  selectSessionModalModeDetail,
  selectSessionModalModeSpeakers,
  speakers,
}) => (
  <div className={classes.modeSelection}>
    <Button
      color={colorForButton(modals, SESSION_DETAIL_SELECTED)}
      onClick={selectSessionModalModeDetail}
    >
      Detail
    </Button>
    <Button
      color={colorForButton(modals, SESSION_SPEAKERS_SELECTED)}
      onClick={selectSessionModalModeSpeakers}
    >
      Speaker{speakers.length <= 1 ? '' : 's'}
    </Button>
  </div>
);

const Header = ({classes, session, isFavorite, handleFavoriteClick}) => (
  <div className={classes.header}>
    <Typography variant="h6">{session.title}</Typography>

    <IconButton
      aria-label="Add to favorites"
      color={isFavorite ? 'secondary' : 'default'}
      onClick={handleFavoriteClick}
    >
      <FavoriteIcon />
    </IconButton>
  </div>
);

const Session = props => (
  <Fragment>
    <DialogTitle id="scroll-dialog-title" className={props.classes.dialogTitle}>
      <Header {...props} />
    </DialogTitle>
    <DialogContent>
      <ModeSelection {...props} />
      <Content {...props} />
    </DialogContent>
  </Fragment>
);

const SessionModal = ({
  classes,
  modals,
  session,

  handleClose,

  ...props
}) => {
  if (!session) {
    return null;
  }

  return (
    <Dialog
      open={modals.sessionModalVisible}
      onClose={handleClose}
      scroll="body"
      aria-labelledby="scroll-dialog-title"
      maxWidth="md"
      fullWidth={true}
      className="session-modal"
    >
      <Session
        classes={classes}
        modals={modals}
        session={session}
        handleClose={handleClose}
        {...props}
      />
    </Dialog>
  );
};

// hooks
const ComposedSessionModal = pipe(
  lifecycle({
    componentDidUpdate(prevProps) {
      const {execute, conference, session} = this.props;

      if (!prevProps || prevProps.session?.id !== session?.id) {
        execute(conference.loadSessionDetail, session);
      }
    },
  }),
  withHandlers({
    handleClose: ({selectSession, selectSessionModalModeDetail}) => () => {
      selectSession(null);
      selectSessionModalModeDetail();
    },

    handleFavoriteClick: ({toggleFavorite, conference, session}) => () => {
      toggleFavorite(conference, session);
    },
  }),

  SessionModal,
);

// redux
const mapStateToProps = (state, props) => ({
  loading: loadingSessionDetailSelector(state),

  conference: selectedConferenceSelector(state),
  session: selectedSessionSelector(state),
  modals: modalsSelector(state),

  speakers: speakersForSessionSelector(state, props),
  room: roomForSessionSelector(state, props),
  tags: tagsForSessionSelector(state, props),
  isFavorite: isFavoriteSessionSelector(state, props),
});

const mapDispatchToProps = {
  execute,
  selectSession,
  toggleFavorite,
  selectSessionModalModeDetail,
  selectSessionModalModeSpeakers,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(ComposedSessionModal));
