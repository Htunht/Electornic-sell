import express from 'express';

const app = express();

const server = app.listen(8080, () => {
  console.log("TEST APP listening on 8080");
});
console.log("Is server unrefed?", (server as any)._unref === true);
