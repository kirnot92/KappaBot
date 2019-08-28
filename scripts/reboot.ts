 export function Reboot()
 {
     var cmd = require('node-cmd');
     cmd.run("cd /home/Bot/Kappabot");
     cmd.run("git pull")
     cmd.run("tsc -p tsconfig.json")
     cmd.run("forever restartall")
     // dummy
 }