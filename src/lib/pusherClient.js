import PusherJS from "pusher-js";

let client = null;

export function getPusherClient() {
  if (typeof window === "undefined") return null; // SSR guard

  if (!client) {
    client = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
  }
  return client;
}