import { LogStoreClient } from "@logsn/client";
import * as os from "os";
import * as fs from "fs";
import { streamId } from "./constants";

// getting privateKey from the cli configuration, we could get from .env
const homeDir = os.homedir();
const { privateKey } = JSON.parse(
  fs.readFileSync(`${homeDir}/.logstore-cli/default.json`, "utf8"),
);

// we instantiate our client using this private key
const client = new LogStoreClient({
  auth: {
    privateKey: privateKey,
  },
});

const stream = await client.getStream(streamId);

// on terminal new line we get the message and publish to stream
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk: string) => {
  // ctrl c to exit
  if (chunk === "\u0003") {
    process.exit();
  }

  const strippedMessage = chunk.replace(/(\r\n|\n|\r)/gm, "");

  // this is where we publish the message
  const result = await stream.publish({ message: strippedMessage });

  console.log(
    "Published a new message with signature: ",
    result.signature,
  );
  console.log("");
});

console.log(
  "We're ready to publish messages that you type through this terminal.",
);
console.log("");

// terminate on 'ctrl + c'
process.on("SIGINT", function () {
  process.exit(0);
});
