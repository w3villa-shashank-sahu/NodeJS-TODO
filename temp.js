// function* greet() {
//     yield '1';
//     yield '2';
//     yield '3';
//   }
  
//   for (const val of greet()) {
//     console.log(val);
//   }




  // process.on('message', (msg) => console.log('from parent', msg))

  // process.send('hello from parent')


// import async from 'async'

// async.waterfall([
//   function(callback) {
//     callback(null, 'Hello');
//   },
//   function(greeting, callback) {
//     callback(null, greeting + ' World');
//   },
//   function(result, callback) {
//     console.log(result); // Hello World
//     callback(null, 'Done');
//   }
// ], function(err, finalResult) {
//   if (err) console.error(err);
//   else console.log(finalResult); // Done
// });


