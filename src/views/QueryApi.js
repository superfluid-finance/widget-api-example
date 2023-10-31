import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import Highlight from "../components/Highlight";

const API_URL = "http://localhost:3001/api/mumbai";
const defaultQuery = `
query MyQuery {
  account(id: "INSERT_SENDER_ADDRESS_HERE") {
    outflows(where: {receiver: "INSERT_RECEIVER_ADDRESS_HERE"}) {
      currentFlowRate
    }
  }
}`;

function FetchDataFromTheGraph() {
  const [state, setState] = useState({
    apiKey: "",
    query: defaultQuery,
    apiMessage: null,
    showResult: false,
  });

  const fetchData = async () => {
    try {
      setState((prevState) => ({
        ...prevState,
        showResult: false,
      }));
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": state.apiKey,
      };

      const response = await axios.post(
        API_URL,
        { query: state.query },
        { headers }
      );
      setState((prevState) => ({
        ...prevState,
        apiMessage: response.data,
        showResult: true,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Check the console for more information.");
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2 className="header mb-4">Fetch Data from TheGraph</h2>

          <FormGroup className="mb-3">
            <Label for="apiKey">API Key:</Label>
            <Input
              id="apiKey"
              type="text"
              value={state.apiKey}
              onChange={(e) => setState({ ...state, apiKey: e.target.value })}
              placeholder="Enter your API key"
            />
          </FormGroup>

          <FormGroup className="mb-4">
            <Label for="graphqlQuery">GraphQL Query:</Label>
            <Input
              id="graphqlQuery"
              type="textarea"
              rows="10"
              value={state.query}
              onChange={(e) => setState({ ...state, query: e.target.value })}
            />
          </FormGroup>

          <Button color="success" className="mb-4" onClick={fetchData}>
            Fetch Data
          </Button>

          <div className="result-block-container mt-4">
            {state.showResult && (
              <div className="result-block" data-testid="api-result">
                <h6 className="muted">Result</h6>
                <Highlight>
                  <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
                </Highlight>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default FetchDataFromTheGraph;
