import React, { Component } from 'react';
import { Segment, Icon, Header, Input } from 'semantic-ui-react';

export default class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading
    } = this.props;
    return (
      <Segment clearing>
        <Header fluid as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelName}
            <Icon name="star outline" color="black" />
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>
        <Header floated="right">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
            size="mini"
            placeholder="Search Messages"
            icon="search"
            name="searchTerm"
          />
        </Header>
      </Segment>
    );
  }
}
