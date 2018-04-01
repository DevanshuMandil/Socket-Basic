var moment = require('moment');

var now = moment();

// 

var timestamp = now.valueOf();
var timestampMoment = moment.utc(timestamp);
console.log(timestampMoment.format());
console.log(timestampMoment.local().format('h:mm a'));
//console.log(now.format('MMM Do YYYY h:mma'));