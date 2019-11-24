import React from 'react';
import {Avatar, List, Button} from "antd";
import {Query, withApollo} from "react-apollo";
import gql from "graphql-tag";

const addTrack = gql`
    query addTrack($trackId: String!) {
        addTrack(id: $trackId)
    }
`;

function TrackList({tracks, loading}) {
  return (
    <List
      itemLayout="horizontal"
      dataSource={tracks}
      loading={loading}
      renderItem={item => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={item.album.images[0].url}/>}
            title={<a href="https://ant.design">{item.name}</a>}
            description={item.album.name}
          />
          <Button onClick={() =>
            this.props.client.query({
              query: addTrack,
              variables: {id: 'trackId'},
            })}>Add song</Button>
        </List.Item>
      )}
    />
  );
}

export default withApollo(TrackList);