import { exec, spawn, fork } from 'child_process';

// exec('ls -la', (error, stdout, stderr) => {
//     if (error) {
//         console.error(`Error: ${error.message}`);
//         return;
//     }
//     console.log(`Files:\n${stdout}`);
// });



// const process = spawn('ping', ['google.com']);

// process.stdout.on('data', (data) => {
//   console.log(`${data}`);
// });

// process.stderr.on('data', (data) => {
//   console.error(`${data}`);
// });

// process.on('close', (code) => {
//   console.log(`Process exited with code ${code}`);
// });




// const child = fork('temp.js');

// child.on('message', (msg) => {
//   console.log('From child:', msg);
// });

// child.send('hello from child');