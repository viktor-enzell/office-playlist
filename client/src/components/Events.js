import React from 'react';
import {Query} from "react-apollo";
import gql from "graphql-tag";

const Events = () => (
  <Query
    query={gql`
      {
        events {
          title
        }
      }
    `}
  >
    {({loading, error, data}) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error :(</p>;
      return data.events.map(event => (
        <div key={event.title}>{event.title}</div>
      ));

    }}
  </Query>
);

export default Events;