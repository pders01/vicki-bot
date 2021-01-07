# vicki-bot

Initializing new node project.

```
npm init -y
```

Install dev dependencies.

```
npm i -D nodemon typescript ts-node ts-lint
```

Install project dependencies.

```
npm i -S express dotenv dialogflow @overnightjs/core @overnightjs/logger body-parser cors
```

Install types for modules. 

```
npm i -D @types/node @types/express @types/uuid @types/dialogflow @types/body-parser @types/cors
```

*Add credentials.json to project root.*

*Add __DIALOGFLOW_PROJECT_ID__ to .env*

For development use `<npm run dev:watch>`

## Approaching production

I'd recommend this tool for daemonizing our node application. 
    
* [PM2](https://github.com/Unitech/pm2)

Set NODE_ENV to production. 

Setting NODE_ENV to “production” makes Express:

* Cache view templates.
* Cache CSS files generated from CSS extensions.
* Generate less verbose error messages.

Additionaly we'll need to route the requests via a reverse proxy, either using:

* [Hiawatha](https://www.hiawatha-webserver.org/)

which i'd personally prefer, or

* [nginx](https://www.nginx.com/)

Maybe we'll also want to pick an LTS version of Node.js.
Another point that I had is to also store the credentials.json file within the dotenv.


