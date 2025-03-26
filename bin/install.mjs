#!/usr/bin/env node

import axios from "axios"
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .usage('Usage: npx @nocd/n <src> [options]')
  .command('$0 <src>', 't', (yargs) => {
    yargs.positional('src', {
      describe: 'Url or path of input',
      type: 'string'
    })
  })
  .options({
    b: {
      describe: 'Base URL',
      type: 'string'
    }
  })
  .help('h')
  .demandCommand(1)
  .parse();

const parseUrl = (url, burl) => {
  let nurl, pth, typ, raw;
  if (burl && url.indexOf("/") === 0) {
    url = burl + url;
  }
  if (url.indexOf("http") === 0) {
    nurl = url;
    typ = "url";
  } else if (url.indexOf("@") === 0) {
    const cmp = url.substring(1).split("/");
    typ = cmp[2];
    cmp.splice(2, 0, "main");
    nurl = `https://raw.githubusercontent.com/` + cmp.join("/");
  } else if (Buffer.from(url, 'base64').toString('base64') === url) {
    raw = Buffer.from(url, 'base64').toString('ascii');
    typ = "base64";
  } else {
    pth = url
    typ = "path";
  }
  return { nurl, pth, typ, raw }
}

(async () => {

  const url = argv.src;
  const burl = argv.b;
  let output;
  const { nurl, pth, raw } = parseUrl(url, burl);

  if (nurl) {
    try {
      const response = await axios.get(nurl, {
        responseType: "text", responseEncoding: "base64", headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      output = response.data;
    } catch (error) {}
  } else if (pth) {
    try {
      output = fs.readFileSync(path.resolve(pth), { encoding: "base64" });
    } catch (err) {}
  } else if (raw) {
    output = raw;
  }

  output && console.log(output);

})();
