# Planet of the Automatons (a working title)

This README lives on the 'master' branch. Check out the 'develop' branch for a version of the code that's much further along (if perpetually unstable.)

## Intent of the project

### The Challenge

Having been approached more than a few times to teach coding to beginner-to-intermediate hopefuls, and having attempted it more than once, I have always been frustrated by the essential bootstrapping problem:

- coding structures and techniques that are easy for a beginner to grasp produce trivial results, meaning that the practice of coding takes a *long* time to become intrinsically rewarding, meaning that a lot of people start, but then fizzle out on the assumption that coding is really 'not for them'
- producing compelling, non-trivial output requires a certain level of coding mastery or, more often, a working grasp of multiple different concepts, where any one of these may in itself be a daunting challenge

A second conflict is this:

- to be able to effectively translate problem solutions into code, it's very important that a programmer understand programming concepts; both technical (branching, looping, events, etc.) and conceptual (scope, cohesion and loose coupling, testability, etc.)
- as any serious amateur or professional programmer knows, the vast majority of the lines in any application we build (with some special exceptions) are not written by us, but instead are provided by frameworks, external modules, etc. — many of which we have the luxury of treating as black boxes

Lastly, while coding itself is a solitary pursuit, our highest achievements are pretty much always the result of collaboration.

### The Current Effort
I'm currently exploring a different approach, through this code and some related coding workshops. The core concept is that participants will begin by coding a component of a larger system. They will have to develop and use a ground-level understanding of some basic problem-solving and coding concepts and approaches, but will be allowed to call on core language libraries, code from other parts of the solution, and even external libraries to increase the power of their solutions or bridge functional gaps.

More specifically, in this first iteration, they will be working in the context of a multiplayer 'online' game (working over the local network.) Each player will start with an identical copy of a skeletal 'bot' that is able to communicate with the game server, and they must gradually flesh out the bot's logic to improve its performance in the game. All bots created by the participants will be on the same team, striving for a collective high score, so it is in the best interests of everyone in the class to collaboratively problem-solve, identify roles based on relative strengths, and share discoveries and solutions with one another (and even, if they get that far, find ways for their bots themselves to cooperate in the game space.)

## Installation

### Prerequisites

#### Node.js
This system is built and tested against the latest LTS of Node.js (v10.14.1 as of this writing, but that may change, of course) and so it's safest to have that version available on your system, or at least a reasonably close version. If you're not already using it, I can't recommend nvm strongly enough as a way to flexibly configure Node.js, particularly on a development machine.

##### nvm
Nvm can be installed on any Linux or Mac system, by following the instructions on the [nvm GitHub page](https://github.com/creationix/nvm). Currently the installer script looks like this:

  ``curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash``

There's also a wget script on that page, and Mac users can install nvm via Homebrew, according to your preference. And I haven't tested this, but for Windows systems, there is a similar but separately maintained utility called, of all things, [nvm-windows](https://github.com/coreybutler/nvm-windows). Once nvm is installed you can install / switch to the latest Node LTS using:

  `nvm install --lts`
  
Nvm has plenty of other useful tricks up its sleeve. Check the documentation.

#### A package manager
Installation is going to require a Node package manager. The current favourites seem to be npm (the default) and Yarn. Npm should already be installed with Node (certainly if you've used nvm) and Yarn can be installed using [a variety of methods](https://yarnpkg.com/en/docs/install). My personal favourite is to use npm, but only because of the irony.

### Installing the system
- Clone this repository into a local directory
- Navigate to the root directory
- (for now) switch to the 'develop' branch using git (`git checkout develop`)
- navigate to each of the subproject roots and run `npm install` (or `yarn install` if you're using Yarn). These directories are:
  - automaton-cli-client
  - automaton-world-server
  - game-portal-site
  
[TODO: add instructions on configuring required Node environment variables for the server]
  
## Running the Game
To get the game up and running:

### Server / admin
- navigate to the `/automaton-world-server` folder and type `npm start`
- on the same machine, navigate to the `/game-portal-site` folder and type `npm run serve`
- open a browser and go to the root URL of the game-portal-site server (by default, `localhost:8080`)
- log in as 'admin/admin'. Players/observers who want to have their own local view of the game browse this site as well. They'll log in a guest, and will be able to see the game board but not control the game.
- navigate to the Portal page, using the main nav menu on the page
- you can create new games at will
- once one or more players has connected to the system, you can use the game's transport controls to start, (un/)pause, and stop the game

### Players
Each player who wants to participate in the game must:
- navigate to the `/automaton-cli-client` folder
- type `npm start`
- follow the onscreen prompts, entering the correct information for the server host and port
Players will appear on the admin web page as they join. You can add as many instances of the player client as the board will allow, whether on your local machine (primarily for dev and testing, one assumes) or on machines connected to the same network.


## The Road Ahead
This is very much WIP. Future goals, from those within immediate reach all the way to aspirational goals intended to define overall direction, include:

- improve and streamline the system based on findings from the workshops
- get other developers involved, as planners, contributors, and workshop leaders
- continue to modularize all aspects of the system so that more advanced topics can be covered in additional workshops (e.g., creating entirely new game logic, solving game problems using machine learning instead of explicit algorithms) and/or other areas of interest (building web clients or desktop clients, adding a database to enable long-term persistence or more sophisticated functionality)
- improving the code, documentation, and setup logistics of this system so that it can be a convenient off-the-shelf resource that others can use for their own teaching… and hopefully improve through feedback or even direct contributions
- developing the game itself for better esthetics and game play (to make it more compelling) and possibly opening up hooks for 'mods' to reskin the game, add functionality, etc.
- creating an online edition of the game such that players can test their code against other players' code or game bots

## More to Come

System overview, and classroom observations and suggestions will all be added here as things develop and time allows. Will also add a 'manifesto' (aka guiding principles) for this project (e.g., open-source/always-free, language agnosticism), key architectural principles (e.g., statelessness, testability everywhere, etc.) and key teaching points (things like the kinds of problems+solutions we're trying to illustrate, core concepts like loose coupling, and specifically for Javascript things like dynamic typing, scope, and gotchas like 'this' and 'undefined/null'.)
