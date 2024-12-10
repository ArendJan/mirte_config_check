const check = require('./check');
// console.log(check);


const fs = require("fs");


const files = fs.readdirSync('./config');

for(file of files) {
    console.log(file);
    const config = fs.readFileSync(`./config/${file}`, {encoding:'utf8'});
    const c = check(config)
    if(!c.ok) {
        console.log("err");
        console.log(c.errors)
    }
}