const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");
const { ethers } = require("ethers");
const { Framework } = require("@superfluid-finance/sdk-core");
const crypto = require("crypto");

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

const myProvider= new ethers.providers.JsonRpcProvider("https://gateway.tenderly.co/public/polygon-mumbai");


const receiverAddress = "0x5E48a37D34d93778807ef19D74E06128252BAB45";

let apiKeysStore = {};

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

function validateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || !apiKeysStore[apiKey]) {
      return res.status(401).send({ message: "Invalid or missing API key" });
  }
  next();
}

async function getFlowInfo(userAddress) {

  sf = await Framework.create({
    chainId: 80001, //your chainId here
    provider: myProvider,
  });

const daix = await sf.loadSuperToken("0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"); 
let flowInfo = await daix.getFlow({ 
    sender: userAddress, 
    receiver: receiverAddress,
    providerOrSigner: myProvider
});

return flowInfo;

}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.use(checkJwt);

/*app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});*/

app.get("/generate", (req, res) => {
  console.log("user", req.auth.payload.sub.slice(-42));

  const user = req.auth.payload.sub.slice(-42);
  //const userAddress = ethers.utils.getAddress(user);
  (async () => {
    let flowInfo = await getFlowInfo(user);
    if (flowInfo.flowRate > 0) {
      const newApiKey = crypto.randomBytes(20).toString('hex');
      apiKeysStore[newApiKey] = true;
      res.send({
        msg: `Here is your API Key: ${newApiKey}`,
      });
    }
    else {
      res.send({
        msg: "You have no flow set up!",
      });
    }
  })();
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
