import "dotenv/config";
import { getSubscriptions, getToken } from "./utils.js";

let token = await getToken();
let subscriptions = await getSubscriptions(token);
