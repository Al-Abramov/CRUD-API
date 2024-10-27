import { store } from "./database/database";
import http from "http";
import fs from "fs";
import path from "path";
import { config } from 'dotenv';
import { parse } from 'url';
import { StringDecoder } from "string_decoder";
import { METHODS, PATH_NAMES } from "./constant";
import { UsersService } from "./service/service";

config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const userService = new UsersService(req, res);

  res.setHeader('Content-Type', 'application/json');

  switch(req.method) {
    case "GET": userService.getUsers();
      break;
    default:
      res.statusCode = 404;
      res.setHeader("Content-Type", 'application/json');
      res.end(JSON.stringify({ title: "Not Found", message: "Incorrect method" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server on port ${PORT}`)
})
