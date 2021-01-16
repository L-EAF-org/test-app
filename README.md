
# L-EAF.org Test app

An online, real-time, multiplayer version of the No Estimates game. See
<a href="https://noestimates.wordpress.com/">No Estimates</a> for detailed
descriptions of the game and how to play.

## Project setup

```
git clone https://github.com/L-EAF-org/test-app.git

cd test-app
npm install
```
## Setup MongoDB

https://zellwk.com/blog/install-mongodb/

## Run Mongo

```mongod --config /usr/local/etc/mongod.conf
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
