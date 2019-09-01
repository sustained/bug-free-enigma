/*
  Node standard libraries.
*/

import { join } from "path";
import { writeFile } from "fs";

/*
  NPM packages.
*/

import Discord from "discord.js";

/*
  Our packages.
*/

import INSTRUCTIONS from "./instructions";

/*
  Constants
*/

const { BOT_TOKEN } = process.env;

if ( ! BOT_TOKEN) {
  console.info(INSTRUCTIONS.join("\n"));
  process.exit();
}

// Only gusto can initiate the command.
const GUSTO_ID = "287377476647124992";

// Only members with these roles are relevant to us.
const ROLE_IDS = [
  "361871508102053892", // Core Team
  "336317962522722316", // Moderators
  "359877575738130432", // Library Maintainers
  "469085209187319808", // Community Leaders
  "443314906050330635", // MVP
];

// Contains various placeholders that will be filled out once the 
// data has been gathered from other sources - modify as you see fit!
const USER_OBJECT_TEMPLATE = {
  realName: "",
  nickname: "",

  country: {
    bornIn: "",
    liveIn: ""
  },
  languages: [],

  discord: {
    roles: [],
    username: null,
    discriminator: null
  },

  events: {
    attended: [],
    organised: []
  },

  libraries: [],
};

const OUTPUT_JSON_FILENAME = "output.json";
const OUTPUT_JSON_DIRECTORY = __dirname;
const OUTPUT_JSON_INDENT_SIZE = 2;

/*
  Let's roll.
*/

const client = new Discord.Client({ fetchAllMembers: true });

client.on("ready", () => console.info(`Logged in as ${client.user.tag}!`));

client.on("message", msg => {
  if (msg.content !== "!dump-json") {
    return;
  }

  if (msg.author.id !== GUSTO_ID) {
    return msg.reply("You are not the chosen one.");
  }

  msg
    .reply("JSON dump initiated. Please keep your extremities within the vehicle during transit.")
    .then(() => dumpJson(msg.guild, msg))
});

async function onFileWritten(error, msg) {
  if (error) {
    console.error(error);
    return msg.reply("An error occured while writing the JSON to disc, please check the console.");
  }

  await msg.reply(`Written to disc as ${OUTPUT_JSON_FILENAME}. Thank you for flying with Sustained Airways.`);

  client.destroy();
}

function buildMember(member) {
  let memberData = Object.assign({}, USER_OBJECT_TEMPLATE);

  const roles = member.roles
    .filter((role) => ROLE_IDS.includes(role.id))
    .map((role) => role.name);
  const { username, discriminator } = member.user;
  memberData.discord = { roles, username, discriminator };

  return memberData;
}

function dumpJson(guild, msg) {
  if ( ! guild.available) {
    // Probably can't happen since we managed to process the initiating command, but hey.
    return console.error("Discord outage!");
  }

  const outputJson = [];
  
  const relevantMembers = guild.members.filter((member) => {
    return member.roles.some((role) => ROLE_IDS.includes(role.id));
  });

  for (let [_, member] of relevantMembers) {
    outputJson.push(buildMember(member));
  }

  writeFile(
    join(OUTPUT_JSON_DIRECTORY, OUTPUT_JSON_FILENAME),
    JSON.stringify(outputJson, null, OUTPUT_JSON_INDENT_SIZE),
    (error) => { onFileWritten(error, msg) }
  );
}

try {
  client.login(BOT_TOKEN);
}
catch(e) {
  console.error("An error occured while logging in - perhaps an invalid BOT_TOKEN?");
}
