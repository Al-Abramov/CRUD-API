import { PATH_NAMES } from "../constant";
import { store } from "../database/database";
import { IncomingMessage, METHODS, ServerResponse } from "http";
import { parse, UrlWithParsedQuery } from 'url';
import { StringDecoder } from "string_decoder";
import { Controller } from "../controller/controller";

export class UsersService {
  parsedUrl: UrlWithParsedQuery;
  method: string;
  pathName: string;
  decoder: StringDecoder;
  req: IncomingMessage;
  res: ServerResponse;
  controller: Controller;

  constructor(request: IncomingMessage, response: ServerResponse) {
    this.res = response;
    this.req = request;
    this.parsedUrl = parse(request.url, true);
    this.method = request.method;
    this.pathName = this.parsedUrl.pathname.slice(1);
    this.decoder = new StringDecoder('utf-8');
    this.controller = new Controller(request, response);
  }

  getUsers() {
    const pathNameSplit = this.pathName.split("/");
    const isGetUsers = this.pathName === PATH_NAMES.users;
    const isGetUserById = pathNameSplit[0] === PATH_NAMES.usersById && pathNameSplit.length === 2;

    if (isGetUsers) {
      this.controller.getUsers();
      return;
    }

    if (isGetUserById) {
      const id = pathNameSplit[1];
      this.controller.getUserBuId(id);
      return;
    }

    this.res.statusCode = 404;
    this.res.end(JSON.stringify({ title: "Not Found", message: "Route not found" }));
  }
}
