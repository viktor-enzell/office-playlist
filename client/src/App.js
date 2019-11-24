import React from 'react';
import './App.css';
import Search from './components/Search'
import ApolloClient from "apollo-boost";
import {ApolloProvider} from "react-apollo";
import {Row, Col, Typography} from 'antd';
import 'antd/dist/antd.css';

const {Title} = Typography;

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql"
});

const App = () => (
  <ApolloProvider client={client}>
    <Row justify="center">
      <Col offset={6} span={12}>
        <Title>Office playlist</Title>
        <Search/>
      </Col>
    </Row>
  </ApolloProvider>
);

export default App;
