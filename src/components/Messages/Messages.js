import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import { setUserPosts } from '../../actions';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Typing from './Typing';
import Skeleton from './Skeleton';

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref('messages'),
    typingRef: firebase.database().ref('typing'),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    isChannelStarred: false,
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    typingUsers: [],
    connectedRef: firebase.database().ref('.info/connected'),
    listeners: []
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user.uid);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    const { listeners, connectedRef } = this.state;
    this.removeListeners(listeners);
    connectedRef.off();
  }

  addToListeners = (id, ref, event) => {
    const { listeners } = this.state;
    const index = listeners.findIndex(listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: listeners.concat(newListener) });
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListeners(channelId);
  };

  removeListeners = listeners => {
    listeners.forEach(({ ref, id, event }) => {
      ref.child(id).off(event);
    });
  };

  addTypingListeners = channelId => {
    let typingUsers = [];
    const {
      typingRef,
      connectedRef,
      user: { uid }
    } = this.state;
    typingRef.child(channelId).on('child_added', snap => {
      if (snap.key !== uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });

        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, typingRef, 'child_added');

    typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(({ id }) => id === snap.key);

      if (index !== -1) {
        typingUsers = typingUsers.filter(({ id }) => id === snap.key);
        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, typingRef, 'child_removed');

    connectedRef.on('value', snap => {
      if (snap.val() === true) {
        typingRef
          .child(channelId)
          .child(uid)
          .onDisconnect()
          .remove(reason => {
            if (reason !== null) {
              console.error(reason);
            }
          });
      }
    });
  };

  addMessageListener = channelId => {
    const loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });

    this.addToListeners(channelId, ref, 'child_added');
  };

  addUserStarsListener = (channelId, userId) => {
    const { usersRef } = this.state;
    usersRef
      .child(userId)
      .child('starred')
      .once('value')
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleStar = () => {
    this.setState(
      prevState => ({
        isChannelStarred: !prevState.isChannelStarred
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    const {
      usersRef,
      isChannelStarred,
      channel: { id, name, details, createdBy },
      user: { uid }
    } = this.state;
    if (isChannelStarred) {
      usersRef.child(`${uid}/starred`).update({
        [id]: {
          name,
          details,
          createdBy
        }
      });
    } else {
      usersRef
        .child(`${uid}/starred`)
        .child(id)
        .remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const { messages, searchTerm } = this.state;
    const channelMessages = [...messages];
    const regex = new RegExp(searchTerm, 'gi');
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = messages => {
    const { setUserPosts } = this.props;
    const userPosts = messages.reduce((acc, { user: { name, avatar } }) => {
      if (name in acc) {
        acc[name].count += 1;
      } else {
        acc[name] = {
          avatar,
          count: 1
        };
      }
      return acc;
    }, {});
    setUserPosts(userPosts);
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  displayChannelName = channel =>
    channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';

  displayTypingUsers = users =>
    users.length > 0 &&
    users.map(({ id, name }) => (
      <div
        key={id}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.2em'
        }}
      >
        <span className="user__typing">{name} is typing</span>
        <Typing />
      </div>
    ));

  displayMessagesSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />

        <Segment>
          <Comment.Group className="messages">
            {this.displayMessagesSkeleton(messagesLoading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)} />
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(
  null,
  { setUserPosts }
)(Messages);
