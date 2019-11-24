import React, {useState} from 'react';
import {Query} from "react-apollo";
import gql from "graphql-tag";
import TrackList from "./TrackList";
import {Input} from 'antd';

const AntSearch = Input.Search;

const searchTracks = gql`
    query tracks($search: String!) {
        tracks(search: $search) {
            name
            album {
                name
                images {
                    url
                }
            }
        }
    }
`;

function Search() {
  const [searchString, setSearchString] = useState(undefined);

  return (
    <>
      <AntSearch
        placeholder="input search text"
        style={{width: '100%'}}
        onSearch={searchString => setSearchString(searchString)}
      />
      {searchString && <Query
        variables={{search: searchString}}
        query={searchTracks}
      >
        {({loading, error, data}) => {
          if (error) return <p>Error :(</p>;
          return <TrackList tracks={data ? data.tracks : []} loading={loading}/>;
        }}
      </Query>}
    </>
  );
}

export default Search;