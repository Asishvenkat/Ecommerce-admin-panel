import { Client, Storage, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("684d5add003ce6bd9cb0"); // Your project ID

const storage = new Storage(client);

export { storage, ID };
