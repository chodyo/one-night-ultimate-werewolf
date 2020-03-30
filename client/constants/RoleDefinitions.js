export const roleDefinitions = {
  doppelganger: {
    description: "The Doppelganger is a fairly complicated card, because she takes on the role and team of whatever card she views. If you haven't played with most of the other roles yet, skip this role for now... it will make a lot more sense then. <br /> The Doppelganger wakes up before the other roles. She then looks at but does not switch one other player's card and does the following based on what she sees: <br /><em>Villager, Tanner, Hunter:</em> She is now that role and does nothing else at night. <br /><em>Werewolf or Mason:</em> She wakes up with the other Werewolves or Masons when they are called. She is on the werewolf team if she views a Werewolf, and is on the village team if she views a Mason.<br /><em>Seer, Robber, Troublemaker, Drunk:</em> She immediately does that role's action (she does not wake up again with the original role when it is called).<br /><em>Minion:</em> At the end of the Doppelganger phase, the Announcer tells the Doppelganger to close her eyes unless she is now the Minion, and that werewolves should put their thumbs up. She is on the werewolf team.<br /><em>Insomniac:</em> After the Insomniac, the Doppelganger-Insomniac is woken up to check her card to see if she is still the Doppelganger.<br />If a player receives the Doppelganger card during the night, she is the role the Doppelganger originally viewed. The Doppelganger's script at night is a little different than most, as she has to be told to look for werewolves if she is the Minion, and is woken up later at night if the Insomniac is present.",
    img: "../assets/images/doppelganger.jpg",
    imageCredit: "https://www.deviantart.com/kate-fox/art/Faceless-363889217",
    // imageToken: "../assets/images/werewolf.png",
    imageToken: "../assets/images/doppelganger-token.svg",
    maximum: 1,
    prompt: "Look at another player's card. You are now that role.",
    team: "village",
    wakeOrder: 1
  },
  drunk: {
    description: "The Drunk is so drunk that he doesn't remember his role. He must exchange his Drunk card for any card in the center, but he does not look at it. The Drunk is now the new role even though he doesn't know what that new role is, and is on that team.",
    img: "images/drunk.jpg",
    imageCredit: "https://www.deviantart.com/kangjason/art/Alien-Bar-564992738?d=153",
    imageToken: "../assets/images/drunk-token.svg",
    maximum: 1,
    prompt: "Exchange your card with a card in the center.",
    team: "village",
    wakeOrder: 8
  },
  hunter: {
    description: "If the Hunter dies, the player he voted for dies as well regardless of how many votes his target receives.",
    img: "../assets/images/hunter.jpg",
    imageCredit: "https://www.deviantart.com/vablo/art/Forest-Village-491260831",
    imageToken: "../assets/images/hunter-token.svg",
    maximum: 1,
    prompt: "The player you are pointing at will also die if you die.",
    team: "village",
    wakeOrder: -1
  },
  insomniac: {
    description: "The Insomniac wakes up and looks at their card at the end of the game to see if it has changed. Only use this role if the Robber and/or the Troublemaker are in the game.",
    img: "../assets/images/insomniac.jpg",
    imageCredit: "https://www.deviantart.com/shellz-art/art/Youtube-The-World-at-Night-645806552",
    imageToken: "../assets/images/insomniac-token.svg",
    maximum: 1,
    prompt: "Look at your card.",
    team: "village",
    wakeOrder: 9
  },
  mason: {
    description: "The Mason wakes up at night and looks for the other Mason. If the Mason doesn't see another Mason, it means the other Mason card is in the center.",
    img: "../assets/images/mason.jpg",
    imageCredit: "https://www.deviantart.com/miloslavvonranda/art/EPIC-handshake-by-Dillon-and-Dutch-325709082",
    imageToken: "../assets/images/mason-token.svg",
    maximum: 2,
    prompt: "See and remember which player is the other Mason. The other Mason may be in the center.",
    team: "village",
    wakeOrder: 4
  },
  minion: {
    description: "Immediately following the Werewolf phase at night, the Minion wakes up and sees who the Werewolves are. The Werewolves don't know who the Minion is. If the Minion dies and no Werewolves die, the Werewolf team wins.",
    img: "../assets/images/minion.jpg",
    imageCredit: "https://www.deviantart.com/real-sonkes/art/Mercenaries-367236286",
    imageToken: "../assets/images/minion-token.svg",
    maximum: 1,
    prompt: "See and remember which players are Werewolves. Protect them from being identified as Werewolves even at the cost of your own life.",
    team: "werewolf",
    wakeOrder: 3
  },
  robber: {
    description: "The Robber may choose to secretly rob a card from another player and give the Robber card to that player. Then the Robber looks at his new role. The player who receives the Robber card is on the village team. The Robber is on the team of the card he takes, however, he does not do the action of his new role at night. If the Robber chooses not to rob a card from another player, he remains the Robber and is on the village team.",
    img: "../assets/images/robber.jpg",
    imageCredit: "https://www.deviantart.com/joya-filomena/art/Thief-648208787",
    imageToken: "../assets/images/robber-token.svg",
    maximum: 1,
    prompt: "You may exchange your card with another player's card, and then view your new card.",
    team: "village",
    wakeOrder: 6
  },
  seer: {
    description: "The Seer may look either at one other player's card or at two of the cetner cards.",
    img: "../assets/images/seer.jpg",
    imageCredit: "https://www.deviantart.com/pin100/art/Seer-of-the-Dust-City-548571161",
    imageToken: "../assets/images/seer-token.svg",
    maximum: 1,
    prompt: "Look at another player's card or two of the center cards.",
    team: "village",
    wakeOrder: 5
  },
  tanner: {
    description: "The Tanner hates his job so much that he wants to die. The Tanner only wins if he dies. If the Tanner dies and no Werewolves die, the Werewolves do not win. If the Tanner dies and a Werewolf also dies, the village team wins too. The Tanner is considered a member of the village (but is not on their team), so if the Tanner dies when all werewolves are in the center, the village team loses.",
    img: "../assets/images/tanner.jpg",
    imageCredit: "https://www.deviantart.com/monikapalosz/art/Workshop-567841216",
    imageToken: "../assets/images/tanner-token.svg",
    maximum: 1,
    prompt: "You win if you die.",
    team: "neither",
    wakeOrder: -1
  },
  troublemaker: {
    description: "The Troublemaker may switch the cards of two other players without looking at those cards. The players who receive a different card are now the role and team of their new card, even though they don't know what role that is until the end of the game.",
    img: "../assets/images/troublemaker.jpg",
    imageCredit: "https://www.deviantart.com/seven-teenth/art/Mehiko-745509961",
    imageToken: "../assets/images/troublemaker-token.svg",
    maximum: 1,
    prompt: "You may exchange cards between two other players.",
    team: "village",
    wakeOrder: 7
  },
  villager: {
    description: "The Villager has no special abilities, but he is definitely not a werewolf.",
    img: "../assets/images/villager.png",
    imageCredit: "https://www.deviantart.com/chris-karbach/art/Mountain-Farm-Village-810341347",
    imageToken: "../assets/images/villager-token.svg",
    maximum: 3,
    prompt: "Discover who the werewolves are.",
    team: "village",
    wakeOrder: -1
  },
  werewolf: {
    description: "At night, all Werewolves open their eyes and look for other werewolves. If no one else opens their eyes, the other Werewolves are in the center. The Lone Werewolf may view one center card.",
    img: "../assets/images/werewolf.jpg",
    imageCredit: "https://www.deviantart.com/manzanedo/art/Werewolf-775404014",
    // imageToken: "../assets/images/werewolf.png",
    imageToken: "../assets/images/werewolf-token.svg",
    maximum: 2,
    prompt: "Look for other werewolves. If you are the only werewolf, look at a card in the center.",
    team: "werewolf",
    wakeOrder: 2
  }
};
