import React from "react";
import logo from "../assets/logo.svg";

const Footer = () => (
  <footer className="bg-light p-3 text-center">
    <div>
      <img className="mb-3 app-logo" src={logo} alt="React logo" width="50" />
    </div>
    <p>
      Sample project provided by{" "}
      <a href="https://superfluid.finance">Superfluid</a>
    </p>
  </footer>
);

export default Footer;
