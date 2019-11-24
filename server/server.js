const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');
const cors = require('cors');
const request = require('request');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});
const scopes = ['playlist-modify-public', 'user-read-private'], state = 'some-state-of-my-choice';
const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, false);
console.log(authorizeURL);


const server = express();
server.use(bodyParser.json());
server.use(cors());

server.use('/graphql', graphqlHttp(request => {
  console.log('--------- REQUEST --------', request.headers.origin);
  if (request.query && request.query.code) {
    console.log('QUERY CODE:', request.query.code);
    getAccessToken(request.query.code);
  }
  return {
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        type Track {
            name: String
            album: Album
        }
        
        type Album {
            name: String
            images: [Image]
        }
        
        type Image {
            url: String
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
            
        }
        
        type RootQuery {
            tracks(search: String!): [Track]
            addTrack(id: String!): String
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }
        
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      tracks: function ({search}) {
        return spotifyApi.searchTracks(search)
          .then(function (data) {
            return data.body.tracks.items;
          }, function (err) {
            console.error(err);
            return [{name: 'ERROR'}];
          });
      },
      addTrack: function ({id}) {
        return spotifyApi.addTracksToPlaylist('7jdLTofojJWCi1DXj8dHum', ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh"])
          .then(function (data) {
            console.log('Added track to playlist:', id);
            return "success";
          }, function (err) {
            console.log('Something went wrong!', err);
            return "";
          });
      },
      events: () => {
        return Event.find().then(events => {
          return events.map(event => {
            return {...event._doc, _id: event.id};
          })
        }).catch(err => {
          throw err;
        });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        return event.save().then(result => {
          console.log(result);
          return {...result._doc, _id: event.id};
        }).catch(err => {
          console.log(err);
          throw err;
        });
      }
    },
    graphiql: true
  };
}));


const getAccessToken = (code) => {
  spotifyApi.authorizationCodeGrant(code).then(
    function (data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
    },
    function (err) {
      console.log('Something went wrong!', err);
    }
  );
};

const refreshAccessToken = () => {
  spotifyApi.refreshAccessToken().then(
    function (data) {
      console.log('The access token has been refreshed!');
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function (err) {
      console.log('Could not refresh access token', err);
    }
  );
};

const gotoAuthorizeURL = () => {
  request(authorizeURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Authorize url request: SUCCESS!")
    } else {
      console.log("Authorize url request: ERROR!")
    }
  });
};


mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost:27017/local').then(() => {
  server.listen(4000);
}).catch(err => {
  console.log(err);
});
