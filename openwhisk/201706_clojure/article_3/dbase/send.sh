#! /bin/sh

npm install
zip -r action.zip package.json main.js action.cljs node_modules
wsk action delete inventory_dbase
wsk action create inventory_dbase action.zip --kind nodejs:6
