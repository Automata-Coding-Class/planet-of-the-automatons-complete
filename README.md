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

## The Road Ahead
This is very much WIP. Future goals, from those within immediate reach all the way to aspirational goals intended to define overall direction, include:

- improve and streamline the system based on findings from the workshops
- get other developers involved, as planners, contributors, and workshop leaders
- continue to modularize all aspects of the system so that more advanced topics can be covered in additional workshops (e.g., creating entirely new game logic, solving game problems using machine learning instead of explicit algorithms) and/or other areas of interest (building web clients or desktop clients, adding a database to enable long-term persistence or more sophisticated functionality)
- improving the code, documentation, and setup logistics of this system so that it can be a convenient off-the-shelf resource that others can use for their own teaching… and hopefully improve through feedback or even direct contributions
- developing the game itself for better esthetics and game play (to make it more compelling) and possibly opening up hooks for 'mods' to reskin the game, add functionality, etc.
- creating an online edition of the game such that players can test their code against other players' code or game bots

## More to Come

System overview, setup instructions, and classroom observations and suggestions will all be added here as things develop and time allows.
