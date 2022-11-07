const admin = require('firebase-admin');
const devServiceAccount = require('./havit-wesopt29-firebase-adminsdk-mgljp-478046b091');
const prodServiceAccount = require('./havit-production-firebase-adminsdk-bypl1-d081cc62e4');
const dotenv = require('dotenv');

let path;
let serviceAccount;
switch (process.env.NODE_ENV) {
  case "production":
    path = `${__dirname}/.env.prod`;
    break;
  case "development":
    path = `${__dirname}/.env.dev`;
    break;
  default:
    path = `${__dirname}/.env.dev`;
}
dotenv.config({ path: path });

let firebase;

if (admin.apps.length === 0) {
  if (process.env.NODE_ENV === 'production') {
    firebase = admin.initializeApp({
    credential: admin.credential.cert(prodServiceAccount),
  })} else {
    firebase = admin.initializeApp({
    credential: admin.credential.cert(devServiceAccount),
  })}
} else {
  firebase = admin.app();
}

module.exports = {
  api: require('./api'),
};
