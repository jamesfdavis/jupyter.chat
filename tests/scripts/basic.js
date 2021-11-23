let basic = (robot) => {

  robot.respond(/open the pod bay doors/i, function (res) {
    return res.reply("I'm afraid I can't let you do that.");
  });
  robot.hear(/badger/i, function (res) {
    return res.send("Badgers? BADGERS? WE DON'T NEED NO STINKIN BADGERS\n");
  });

  return robot;

};

export { basic };
