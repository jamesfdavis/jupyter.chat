export default function (robot) {

  robot.hear(/badger/i, function (res) {
    return res.send("Badgers? BADGERS? WE DON'T NEED NO STINKIN BADGERS\n");
  });

  robot.respond(/open the pod bay doors/i, function (res) {
    return res.reply("I'm afraid I can't let you do that.");
  });

  return robot;

  // return robot.hear(/I like pie/i, function (res) {
  //   return res.send("makes a freshly baked pie");
  // });

}
