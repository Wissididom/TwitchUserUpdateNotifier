import "dotenv/config";
import * as readline from "readline";
import { getToken, deleteSubscription } from "./utils.js";

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
readlineInterface.question(
  "Enter the subscription id of the  EventSub-Event you wnat to delete:\n",
  async (subscription) => {
    let token = await getToken();
    await deleteSubscription(token, subscription);
    readlineInterface.close();
  },
);
