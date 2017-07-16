#! /bin/sh

npm install
mkdir action
nodejs node_modules/clojurescript-nodejs/bin/runcljs action.cljs -c -o action/core.js
zip -r action.zip package.json main.js node_modules action
wsk action delete article_3_compile
wsk action create article_3_compile action.zip --kind nodejs:6
