#! /bin/sh

npm install
zip -r action.zip package.json main.js action.cljs node_modules
wsk action delete article_3_echo
wsk action create article_3_echo action.zip --kind nodejs:6
