/*
  NPM packages.
*/

import open from "open";

/*
  Our packages.
*/

import INSTRUCTIONS from "./instructions";

/*
  Constants
*/

const { CLIENT_ID } = process.env;

if ( ! CLIENT_ID) {
  console.info(INSTRUCTIONS.join("\n"));
  process.exit();
}

const AUTHORISE_URL = `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot`;

/*
  Let's roll.
*/

open(AUTHORISE_URL);
