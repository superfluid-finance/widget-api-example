import React, { useState, useEffect } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
const { ethers } = require("ethers");
const { Framework } = require("@superfluid-finance/sdk-core");

// -------------------------- CONFIGURATION --------------------------

const { apiOrigin = "http://localhost:3001", audience } = getConfig();
const myProvider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_PROVIDER || "https://polygon-testnet.public.blastapi.io"
);
const receiverAddress = process.env.RECEIVER_ADDRESS || "0x0000000000000000000000000000000000000001";

// -------------------------- MAIN COMPONENT --------------------------

export const ExternalApiComponent = () => {
  const { user } = useAuth0();
  const { getAccessTokenSilently, loginWithPopup, getAccessTokenWithPopup } =
    useAuth0();

  // -------------------------- DATA STORE --------------------------

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const [hasFlow, setHasFlow] = useState(null);

  // -------------------------- SUPERFLUID FUNCTIONS --------------------------

  async function getFlowInfo(userAddress) {
    const sf = await Framework.create({
      chainId: 80001,
      provider: myProvider,
    });
    const daix = await sf.loadSuperToken(
      "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
    );
    return daix.getFlow({
      sender: userAddress,
      receiver: receiverAddress,
      providerOrSigner: myProvider,
    });
  }

  useEffect(() => {
    async function checkFlow() {
      const flowInfo = await getFlowInfo(user.nickname);
      setHasFlow(flowInfo.flowRate > 0);
    }

    checkFlow();
  }, []);

  // -------------------------- API CALL FUNCTIONS --------------------------

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${apiOrigin}/generate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({ ...state, error: null });
    } catch (error) {
      setState({ ...state, error: error.error });
    }
    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({ ...state, error: null });
    } catch (error) {
      setState({ ...state, error: error.error });
    }
    await callApi();
  };

  // -------------------------- COMPONENT RENDER --------------------------
  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        <h1>Get Your Superfluid Subgraph API Key</h1>
        <p className="lead">
          Click the button below to obtain your unique API Key.
        </p>

        <p>
          By obtaining this API Key, you'll gain access to query data directly
          from the Superfluid Subgraph. This service is protected and gated by
          Superfluid's subscription widget. To maintain access to the data,
          ensure you have an active subscription with Superfluid.
        </p>

        {!audience && (
          <Alert color="warning">
            <p>
              You can't call the API at the moment because your application does
              not have any configuration for <code>audience</code>, or it is
              using the default value of <code>YOUR_API_IDENTIFIER</code>. You
              might get this default value if you used the "Download Sample"
              feature of{" "}
              <a href="https://auth0.com/docs/quickstart/spa/react">
                the quickstart guide
              </a>
              , but have not set an API up in your Auth0 Tenant. You can find
              out more information on{" "}
              <a href="https://auth0.com/docs/api">setting up APIs</a> in the
              Auth0 Docs.
            </p>
            <p>
              The audience is the identifier of the API that you want to call
              (see{" "}
              <a href="https://auth0.com/docs/get-started/dashboard/tenant-settings#api-authorization-settings">
                API Authorization Settings
              </a>{" "}
              for more info).
            </p>

            <p>
              In this sample, you can configure the audience in a couple of
              ways:
            </p>
            <ul>
              <li>
                in the <code>src/index.js</code> file
              </li>
              <li>
                by specifying it in the <code>auth_config.json</code> file (see
                the <code>auth_config.json.example</code> file for an example of
                where it should go)
              </li>
            </ul>
            <p>
              Once you have configured the value for <code>audience</code>,
              please restart the app and try to use the "Ping API" button below.
            </p>
          </Alert>
        )}

        {hasFlow === null ? (
          <Loading /> // Show a loading spinner or some placeholder while checking the flow info
        ) : hasFlow ? (
          <Button
            color="primary"
            className="mt-5"
            onClick={callApi}
            disabled={!audience}
          >
            Generate Key
          </Button>
        ) : (
          <>
            <p
              style={{
                color: "#FF7373",
                fontStyle: "italic",
                fontWeight: "bold",
              }}
            >
              It seems like you don't have a valid subscription for our API.
              Please subscribe to our API to gain access to the data.
            </p>
            <Button
              color="success"
              className="mt-5"
              onClick={() =>
                (window.location.href =
                  "https://checkout.superfluid.finance/QmZNVHW11wjjkSnC5uRd3PnxHLEpRjFxzP9Q2CoewjjP42")
              }
            >
              Subscribe
            </Button>
          </>
        )}
      </div>

      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
            </Highlight>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
