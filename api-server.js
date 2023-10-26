const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");
const { ethers } = require("ethers");
const { Framework } = require("@superfluid-finance/sdk-core");
const crypto = require("crypto");
const axios = require("axios");

const app = express();

// -------------------------- CONSTANTS --------------------------

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;
const myProvider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_PROVIDER || "https://polygon-testnet.public.blastapi.io"
);
const receiverAddress = process.env.RECEIVER_ADDRESS || "0x0000000000000000000000000000000000000001";

// -------------------------- INITIALIZATION --------------------------

// If essential configurations are missing, exit.
if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );
  process.exit();
}

// -------------------------- MIDDLEWARES --------------------------

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(express.json());

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});



// -------------------------- FUNCTIONS --------------------------

//Simple Hash function to generate deterministic API key
function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Validates API key in request headers.
function validateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || !apiKeysStore[apiKey]) {
    return res.status(401).send({ message: "Invalid or missing API key" });
  }
  next();
}

// Fetches flow information of a user.
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

// -------------------------- DATA STORE --------------------------

let apiKeysStore = {};

// -------------------------- ROUTE HANDLERS --------------------------

// Generates an API key for authorized users with a flow set up.
async function handleGenerateAPIKey(req, res) {
  const user = req.auth.payload.sub.slice(-42);
  const flowInfo = await getFlowInfo(user);

  if (flowInfo.flowRate > 0) {
    const newApiKey = hashCode(user).toString();
    apiKeysStore[newApiKey] = true;
    res.send({ msg: `Here is your API Key: ${newApiKey}` });
  } else {
    res.send({ msg: "You have no flow set up!" });
  }
}

// Fetches data from TheGraph based on the GraphQL query provided.
async function handleFetchFromTheGraph(req, res) {
  const graphqlQuery = req.body.query;

  if (!graphqlQuery) {
    return res.status(400).send({ message: "No GraphQL query provided." });
  }

  try {
    const response = await axios.post(
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
      {
        query: graphqlQuery,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    res.send(response.data);
  } catch (error) {
    console.error("Error fetching from TheGraph:", error);
    res.status(500).send({ message: "Error fetching data from TheGraph." });
  }
}

// -------------------------- ROUTES --------------------------

app.get("/generate", checkJwt, handleGenerateAPIKey);
app.post("/api/mumbai", validateApiKey, handleFetchFromTheGraph);

// -------------------------- SERVER INIT --------------------------

app.listen(port, () => console.log(`API Server listening on port ${port}`));
