# OPEN democracy

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/vencax/opendemocracy.svg?branch=master)](https://travis-ci.org/vencax/opendemocracy)

Modern application for democratic process. It is (in constrast to existing solutions):
- __modular__ - JS client or Mobile app and simple yet robust and well tested JSON API server
- __made by modern, fast performing technologies__ like [node.js](https://nodejs.org), [react.js](https://facebook.github.io/react/), [MobX](https://mobxjs.github.io/mobx/)
- __user friendly__ - build with modern CSS framework (subject to choose) to make participation on democratic process fun and enjoyable

## main features

- [stackoverflow](http://stackoverflow.com/) like dicussions to proposed ideas
- collecting support for proposed materials to allow voting on it
- actual voting, easy voting setup
- automatic notifications of users about new votings, or voting results, ..

![nakres](doc/nakres.jpg)

### backend

Build with [express.js](http://expressjs.com/) and secured by [JSON webtokens](https://jwt.io/), uses SQL DB for data storing.
*Note on modularity*: It can call 3rd party processors of voting result written in different languages.
It is perfectly ok and allows you to test different exeperimental of voting processing without hassle to collect data.

interresting materials (research):
- [DomSchiener/liquid-democracy](https://medium.com/@DomSchiener/liquid-democracy-true-democracy-for-the-21st-century-7c66f5e53b6f#.yap5x7bdv) - interresting article about democratic process in 21st cent.
- [agoravoting](https://github.com/agoravoting/)
- [heliosvoting](https://vote.heliosvoting.org/) - promissing, but not modular 'i-know-everything' solution, hard to maintain

### web client

React/mobX based web application for this API on [https://github.com/vencax/opendemocracy-webclient](https://github.com/vencax/opendemocracy-webclient)
