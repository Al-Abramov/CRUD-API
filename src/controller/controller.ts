import { regexUUID } from "../constant";
import { store } from "../database/database";
import { IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";
import { parse, UrlWithParsedQuery } from "url";

export class Controller {
  parsedUrl: UrlWithParsedQuery;
  method: string;
  pathName: string;
  decoder: StringDecoder;
  req: IncomingMessage;
  res: ServerResponse;

  constructor(request: IncomingMessage, response: ServerResponse) {
    this.res = response;
    this.req = request;
    this.parsedUrl = parse(request.url, true);
    this.method = request.method;
    this.pathName = this.parsedUrl.pathname.slice(1);
    this.decoder = new StringDecoder('utf-8');
  }

  getUsers() {
    const users = store.getUsers();

    this.res.statusCode = 200;
    this.res.end(JSON.stringify(users));
  }

  getUserBuId(id: string) {
    const isValidId = regexUUID.test(id);

    if (!isValidId) {
      this.res.writeHead(400, { "Content-Type": "application/json" });
      this.res.end(JSON.stringify({
        title: "Validation Failed",
        message: "UUID is not valid",
      }));
      return;
    }

    const user = store.getUserById(id);

    if (!user) {
      this.res.statusCode = 404;
      this.res.end(
        JSON.stringify({ title: "Not Found", message: "User doesn't exist" })
      );
      return;
    }

    this.res.statusCode = 200;
    this.res.end(JSON.stringify(user));
  }
}
