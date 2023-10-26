## README

# Superfluid Subgraph Gating

This repository is a project that allows you to gate Superfluid's Subgraph using Auth0 with Ethereum sign-in. Alongside Auth0, it also utilizes Superfluid's subscription widget for authentication and access control.

## Origin

This project was inspired and based on the Auth0 sample and quickstart. It further incorporates the Superfluid SDK and the widget builder to establish the entire workflow.

## Setting Up

### Environment Variables:

To configure the project according to your preferences, you can set up various environment variables:

* **API_PORT**: The port you want your app to run on locally.
* **SERVER_PORT**: The port for your server.
* **RPC_PROVIDER**: A JSON RPC provider URL for Polygon Mumbai.
* **RECEIVER_ADDRESS**: The Ethereum address where you'll receive Superfluid subscription payments.

Not setting these environment variables will result in the application defaulting to the initial settings (API_PORT: 3000, SERVER_PORT: 3001).

### Installation:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run the following commands:

```bash
# To install dependencies
npm install
# or
yarn install

# To start both the server and the app
npm start
```

This will start the app on port 3000 and the server on port 3001.

## Usage

Once set up and running, users can sign in using Ethereum through Auth0. After authentication, they can access the Superfluid Subgraph, provided they are subscribed using the Superfluid Subscription link provided.

## Conclusion

This project elegantly combines the robust authentication of Auth0 with the power of Superfluid to offer a seamless and secure way to gate the Superfluid Subgraph. It provides developers with a flexible, customizable, and powerful solution for their dApps and other projects.