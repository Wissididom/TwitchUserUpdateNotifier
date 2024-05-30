export async function getUser(clientId, accessToken, login) {
  let apiUrl = login
    ? `https://api.twitch.tv/helix/users?login=${login}`
    : `https://api.twitch.tv/helix/users`;
  let userResponse = await fetch(apiUrl, {
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
  return userResponse.data[0];
}

// https://dev.twitch.tv/docs/api/reference/#create-eventsub-subscription
export async function registerChatMessageEvent(
  token,
  broadcasterUserId,
  userId,
) {
  let data = {
    type: "channel.chat.message",
    version: "1",
    condition: {
      broadcaster_user_id: broadcasterUserId,
      user_id: userId,
    },
    transport: {
      method: "webhook",
      callback: process.env.URL ?? "https://localhost",
      secret: process.env.EVENTSUB_SECRET,
    },
  };
  console.log(`registerChatMessageEvent:\n${JSON.stringify(data)}`);
  return await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(async (res) => {
    // 202 Accepted = Successfully accepted the subscription request
    // 400 Bad Request
    // 401 Unauthorized
    // 403 Forbidden = The sender is not permitted to send chat messages to the broadcaster’s chat room.
    // 409 Conflict - A subscription already exists for the specified event type and condition combination
    // 429 Too Many Requests
    console.log(`${res.status}:\n${JSON.stringify(await res.json(), null, 2)}`);
    if (res.status >= 200 && res.status < 300) {
      return true;
    } else {
      return false;
    }
  });
}

// https://dev.twitch.tv/docs/api/reference/#create-eventsub-subscription
export async function registerUserUpdateEvent(token, userId) {
  let data = {
    type: "user.update",
    version: "1",
    condition: {
      user_id: userId,
    },
    transport: {
      method: "webhook",
      callback: process.env.URL ?? "https://localhost",
      secret: process.env.EVENTSUB_SECRET,
    },
  };
  console.log(`registerUserUpdateEvent:\n${JSON.stringify(data)}`);
  return await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(async (res) => {
    // 202 Accepted = Successfully accepted the subscription request
    // 400 Bad Request
    // 401 Unauthorized
    // 403 Forbidden = The sender is not permitted to send chat messages to the broadcaster’s chat room.
    // 409 Conflict - A subscription already exists for the specified event type and condition combination
    // 429 Too Many Requests
    console.log(`${res.status}:\n${JSON.stringify(await res.json(), null, 2)}`);
    if (res.status >= 200 && res.status < 300) {
      return true;
    } else {
      return false;
    }
  });
}

// https://dev.twitch.tv/docs/api/reference/#get-eventsub-subscriptions
export async function getSubscriptions(
  token,
  status = null,
  type = null,
  userId = null,
  after = null,
) {
  let data = [];
  if (status) {
    data.push(`status=${encodeURIComponent(status)}`);
  }
  if (type) {
    data.push(`type=${encodeURIComponent(type)}`);
  }
  if (userId) {
    data.push(`user_id=${encodeURIComponent(userId)}`);
  }
  if (after) {
    data.push(`after=${encodeURIComponent(after)}`);
  }
  let url =
    data.length < 1
      ? "https://api.twitch.tv/helix/eventsub/subscriptions"
      : `https://api.twitch.tv/helix/eventsub/subscriptions?${data.join("&")}`;
  return await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      "Content-Type": "application/json",
    },
  }).then(async (res) => {
    // 200 OK = Successfully retrieved the subscriptions
    // 400 Bad Request
    // 401 Unauthorized
    console.log(`${res.status}:\n${JSON.stringify(await res.json(), null, 2)}`);
    if (res.status >= 200 && res.status < 300) {
      return true;
    } else {
      return false;
    }
  });
}

// https://dev.twitch.tv/docs/api/reference/#delete-eventsub-subscription
export async function deleteSubscription(token, id) {
  return await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
      },
    },
  ).then(async (res) => {
    // 204 No Content = Successfully deleted the subscription
    // 400 Bad Request - The id query parameter is required
    // 401 Unauthorized
    // 404 Not Found - The subscription was not found
    // console.log(`${res.status}:\n${JSON.stringify(await res.json(), null, 2)}`);
    console.log(`${res.status}:\n${await res.text()}`);
    if (res.status >= 200 && res.status < 300) {
      return true;
    } else {
      return false;
    }
  });
}

export async function getToken() {
  let clientCredentials = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: "POST",
    },
  );
  if (clientCredentials.status >= 200 && clientCredentials.status < 300) {
    let clientCredentialsJson = await clientCredentials.json();
    let token = {
      access_token: clientCredentialsJson.access_token,
      expires_in: clientCredentialsJson.expires_in,
      token_type: clientCredentialsJson.token_type,
    };
    return token;
  }
  return null;
}
