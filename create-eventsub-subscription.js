import "dotenv/config";
import * as readline from "readline";
import { getToken, getUser, registerChatMessageEvent } from "./utils.js";

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
readlineInterface.question(
  "Enter the Channel whose EventSub-Events you want to subscribe to:\n",
  async (user) => {
    let token = await getToken();
    await registerChatMessageEvent(
      token,
      (await getUser(user.toLowerCase())).id,
      process.env.READER_ID,
    );
    readlineInterface.close();
  },
);
