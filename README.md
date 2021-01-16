
# L-EAF.org Test app

## Project setup

```
git clone https://github.com/L-EAF-org/test-app.git

cd test-app
npm install
```
## Setup MongoDB

https://zellwk.com/blog/install-mongodb/

## Run Mongo

(Will be different for Windows - will find the command...)

```
mongod --config /usr/local/etc/mongod.conf
```

# Run the app

From the test-app dir, in one cmd window...

```
npm run serve
```

In another...

```
node src/server.js
```

App will then be served at:

```
http://localhost:8097
```

"Real" app currently at:

```
http://agilesimulations.co.uk/test-app?host
```
