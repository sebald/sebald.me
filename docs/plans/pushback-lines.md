# Pushback: Lines Review

Every line in the game `for the pushback-spec branch`, grouped by role, so we can go through one role at a time. Source files: `src/lib/lab/pushback/lines.ts` (pairs, boss, barks) and `characters.ts` (intros). The Note column holds my suggestion; empty means keep as is. All lines are under the 70-character limit (longest is 63).

Two things across all pools to keep in mind while reading: counters that share an opening or a punchline are hard to tell apart as decoys, and "Then …" opens five counters (pm-5, dev-1, dev-2, dev-9, dev-15).

## How the lines should sound

The reference is the insult swordfight from The Secret of Monkey Island (1990) and the voice of Simon the Sorcerer (1993). Monkey Island took its cue from the witty barbs in old Errol Flynn swashbucklers; Simon was written to be more British than Monkey Island on purpose, with a hero who is far snarkier than Guybrush and has a habit of saying the true thing at the worst moment. Pushback borrows from both: the duel structure from the first, the deadpan from the second.

What that means for a pair:

- **The phrase is a real phrase.** Something people in software and product actually say, recognisable within the first three words. It can be puffed up a little, like a pirate's boast, but it is never invented jargon.
- **The counter turns the phrase's own words.** The best Monkey Island retorts take the insult's image and twist it back (accept the premise, then flip it). So a counter picks up a word or idea from its phrase: the machine, the roadmap, the pixel. That is also what makes the matching fair; a player can find the answer by listening.
- **One beat, no lecture.** Setup, twist, done. If a counter needs a second sentence to explain the first, it is too long.
- **Mock the cliché, not the person.** The joke is on the phrase and the habit behind it, never on a role being bad at their job. Every role gets roasted, every role gets the last word somewhere, and the speaker of a line is allowed to be likeable.
- **Dry beats loud.** Simon's register: deadpan, a little weary, never cruel. Understatement over exclamation marks; a specific detail (Tuesday, 11:40) over a generic one.
- **House rules.** One topic per pair: two pairs on the same joke get merged or one is replaced, and no two counters open the same way. Under 70 characters, no names, no em dashes, typographic quotes, and a counter has to make sense as a reply even when it shows up as a decoy next to the wrong phrase.

## PM

Opponent intros (three per opponent, picked in turn on each encounter; Dev and Designer get the same treatment)

| Opponent            | Intro                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Intern          | (1) Hi! Is this the meeting? I was told there'd be a meeting. (2) Is this the stand-up? Do I stand up? (3) Hi! I made a deck. It's mostly stock photos.  |
| The Roadmap Owner   | (1) I have a slot for you. It's now. Make it count. (2) I've got five minutes between two syncs. Go. (3) You're on my roadmap. Right now. Enjoy it.      |
| The Head of Product | (1) I've heard about you. None of it was in the OKRs. (2) Let's keep this strategic. No details, please. (3) I've read your Slack messages. All of them. |

Pairs (thrown by PM opponents)

| ID    | Phrase                                                    | Counter                                                     | Note                 |
| ----- | --------------------------------------------------------- | ----------------------------------------------------------- | -------------------- |
| pm-1  | Great idea! I've put it on the roadmap. Q4. Of next year. | That's not a roadmap, that's a horoscope.                   |                      |
| pm-2  | Trust me, no customer has ever asked for that.            | Asked, no. Complained about, every Monday.                  | Done                 |
| pm-3  | We don't have time to do it right.                        | Funny how there's always time to do it again.               | Boss answer (boss-1) |
| pm-4  | Let's ship the MVP and iterate.                           | Iterate is a big word for “leave it like that”.             |                      |
| pm-5  | It's low-hanging fruit.                                   | If it's that low, why has nobody picked it in three years?  |                      |
| pm-6  | The competition already has this. We're falling behind!   | They also have a support forum. Have a read.                | Boss answer (boss-2) |
| pm-7  | I need a quick win for the steering meeting.              | Quick wins are why the backlog is full of slow losses.      |                      |
| pm-8  | It's all in the ticket.                                   | The ticket is one line long. And a screenshot.              |                      |
| pm-9  | Let's park that in the backlog.                           | The backlog is where ideas go to die. With a ticket number. |                      |
| pm-10 | Just a ballpark. I won't hold you to it.                  | The last ballpark is in a customer contract.                |                      |
| pm-11 | Management wants to know when it goes live.               | It's been live since March. Nobody noticed.                 |                      |
| pm-12 | This is a must-have for the launch.                       | So were the last nine. The launch moved. Twice.             | Boss answer (boss-8) |
| pm-13 | Let's set up a sync to align on this.                     | We're so aligned we all agree nobody knows.                 |                      |
| pm-14 | Don't shoot the messenger.                                | You're a very creative messenger.                           |                      |
| pm-15 | We need to be more agile here.                            | Any more agile and we'll need a physio.                     |                      |
| pm-16 | It's a small change, how hard can it be?                  | Small changes are how big outages introduce themselves.     | Boss answer (boss-7) |

New PM pairs (pools grow to 18 each; Dev and Designer get two new pairs each when we review them)

| ID    | Phrase                     | Counter                                           | Note |
| ----- | -------------------------- | ------------------------------------------------- | ---- |
| pm-17 | Let's circle back on that. | We've circled it so often it's a roundabout.      | Done |
| pm-18 | Quick question, got a sec? | Your last quick question had a follow-up meeting. | Done |

| ID    | Phrase                            | Counter                                                   | Note |
| ----- | --------------------------------- | --------------------------------------------------------- | ---- |
| pm-19 | We need to think outside the box. | We can't even find the box. It's somewhere in Confluence. | Done |
| pm-20 | Let's put a pin in that.          | That idea has more pins than a voodoo doll.               | Done |

Player barks (PM)

| When                | Line                                                                                                                                                             | Note                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Win                 | (1) I'll add that to the release notes. (2) Great sync, everyone. I'll send a summary. (3) Marking that one as shipped. (4) That's going in my quarterly review. | Done (picked in turn) |
| Lose                | (1) Noted. Parking it for now. (2) Good feedback. I'll circle back. (3) Fine. I'll update the roadmap. (4) Let's take the learnings and move on.                 | Same                  |
| Ending (boss loses) | Fine. Put it in the next steering deck. I used to write those.                                                                                                   |                       |
| Role blurb          | Has a roadmap and is not afraid to use it.                                                                                                                       |                       |

## Dev

Opponent intros

| Opponent      | Intro                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Junior    | (1) Give me a sec, the build's almost green. (2) Is this a pairing session? I brought snacks. (3) I watched three tutorials about you.                            |
| The Senior    | (1) I've seen this pattern before. It didn't end well then either. (2) I was here before the monolith. I built the monolith. (3) Let me guess. Another framework? |
| The Architect | (1) Before we start: is this scalable? (2) I've drawn a diagram of this conversation. (3) Let's think about this in layers.                                       |

Pairs (thrown by Dev opponents)

| ID     | Phrase                                          | Counter                                                    | Note                 |
| ------ | ----------------------------------------------- | ---------------------------------------------------------- | -------------------- |
| dev-1  | Works on my machine.                            | Then we'll ship your machine.                              |                      |
| dev-2  | That's not a bug. That's a feature.             | Lovely. Put it on the pricing page.                        | Boss answer (boss-3) |
| dev-3  | Honestly, it'd be faster to start from scratch. | That's what you said about the current version.            |                      |
| dev-4  | Have you tried turning it off and on again?     | Twice. Now it's off for good.                              | Boss answer (boss-4) |
| dev-5  | Whoever wrote this legacy code should be fired. | Legacy? You wrote it last sprint.                          |                      |
| dev-6  | We'd need a migration for that.                 | Last time you migrated, the data emigrated.                |                      |
| dev-7  | Well, it meets the acceptance criteria.         | The criteria were met. The users weren't.                  | Done                 |
| dev-8  | I'll leave a TODO and come back to it.          | Your TODOs are old enough to have TODOs.                   | Boss answer (boss-5) |
| dev-9  | The code is self-documenting.                   | So is a ransom note.                                       | Done                 |
| dev-10 | Looks like an infrastructure problem to me.     | Infrastructure is just someone else's code you can't read. | Done                 |
| dev-11 | Let's split that out into a microservice.       | Great. Now the bug is distributed too.                     |                      |
| dev-12 | The tests pass.                                 | The tests test that the tests pass.                        | Boss answer (boss-9) |
| dev-13 | It's a known issue.                             | Known? It has a fan club by now.                           |                      |
| dev-14 | That's not how the framework wants it.          | Give it a week. It'll change its mind.                     |                      |
| dev-15 | Sorry, that's out of scope.                     | Out of scope, into production.                             |                      |
| dev-16 | I haven't changed anything.                     | Git says otherwise. Tuesday, 11:40.                        |                      |

New Dev pairs

| ID     | Phrase                                  | Counter                                         | Note |
| ------ | --------------------------------------- | ----------------------------------------------- | ---- |
| dev-17 | Ignore that red test. It's just flaky.  | It's been flaky so long it's load-bearing.      | Done |
| dev-18 | Don't worry, it's only a temporary fix. | Nothing is more permanent than a temporary fix. | Done |

| ID     | Phrase                        | Counter                                       | Note                                       |
| ------ | ----------------------------- | --------------------------------------------- | ------------------------------------------ |
| dev-19 | Just google it.               | I did. The top answer is your post from 2019. | Done                                       |
| dev-20 | Easy fix. I'll do it tonight. | Easy fixes always come with a sequel.         | Done (“Your” dropped, dev-8 opens with it) |

Player barks (Dev)

| When                | Line                                                                                                                                               | Note                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Win                 | (1) Closed as fixed. (2) Merged. Nobody reviewed it. (3) Deployed on a Friday. Feeling lucky. (4) LGTM.                                            | Done (picked in turn) |
| Lose                | (1) Rolling back my dignity. (2) That was a breaking change. For me. (3) Error 418. I'm a teapot. (4) I'll blame the cache. It's always the cache. | Done (picked in turn) |
| Ending (boss loses) | Fine. Put it in the next steering deck. I used to review those.                                                                                    |                       |
| Role blurb          | Will fix it in the next sprint. Which sprint is a detail.                                                                                          |                       |

## Designer

Opponent intros

| Opponent           | Intro                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| The Freelancer     | (1) I'm only here until Thursday, so let's be quick. (2) My day rate starts now. (3) I've given this feedback at three agencies already. |
| The Brand Designer | (1) That's not our blue. (2) Is that font even licensed? (3) I brought the brand book. All 140 pages.                                    |
| The Design Lead    | (1) Let me stop you right there. (2) Let's take a step back. (3) Have you considered the bigger picture?                                 |

Pairs (thrown by Designer opponents)

| ID     | Phrase                                        | Counter                                              | Note                  |
| ------ | --------------------------------------------- | ---------------------------------------------------- | --------------------- |
| des-1  | This is off-brand.                            | The brand changed twice while you were saying that.  | Boss answer (boss-6)  |
| des-2  | It looked perfect in Figma.                   | Figma never met a German product name.               |                       |
| des-3  | Did you check the latest version of the file? | Final, final\_v2 or final\_REALLY\_this\_one?        |                       |
| des-4  | It's one pixel off.                           | And the deadline is one week off. Pick one.          |                       |
| des-5  | That's way too complicated for our users.     | Our users run their business in Excel. They'll cope. | Done                  |
| des-6  | Let's do a round of user research first.      | We did. The users asked us to stop asking.           |                       |
| des-7  | The spacing is inconsistent.                  | So is the design system. I'm matching it.            |                       |
| des-8  | This needs more whitespace.                   | Any more whitespace and it's a loading screen.       | Done                  |
| des-9  | Something's off, but I can't say what.        | Noted. One vague feeling, no steps to reproduce.     | Boss answer (boss-11) |
| des-10 | Can we make it pop more?                      | Bigger, bolder, and slightly on fire?                | Boss answer (boss-10) |
| des-11 | It really needs a dark mode.                  | Great. The bugs will be harder to see.               |                       |
| des-12 | Just build it like the prototype.             | Sure. Clicking anywhere goes to the next screen?     |                       |
| des-13 | It needs a nice loading animation.            | Or the page could just load.                         |                       |
| des-14 | Let's map the user journey first.             | The journey map is longer than the journey.          |                       |
| des-15 | Users don't read. They scan.                  | They read it when it says “Delete account”.          | Boss answer (boss-12) |
| des-16 | I liked the first version better.             | The first version is the one you rejected.           |                       |

New Designer pairs

| ID     | Phrase                                  | Counter                                  | Note |
| ------ | --------------------------------------- | ---------------------------------------- | ---- |
| des-17 | We need a design system for that.       | We have three. That's the problem.       | Done |
| des-18 | Let's use an icon instead of the label. | Perfect. A button that plays charades.   | Done |
| des-19 | We should A/B test that first.          | Users already picked C: closing the tab. | Done |

| ID     | Phrase                        | Counter                                 | Note                                                   |
| ------ | ----------------------------- | --------------------------------------- | ------------------------------------------------------ |
| des-20 | The confetti really sells it. | Confetti for a password reset is a lot. | Done. Designer is at 20; PM and Dev need two more each |

Player barks (Designer)

| When                | Line                                                                                                                                                                                       | Note         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Win                 | (1) Shipped. Pixel-perfect. (2) That's going in my portfolio. (3) Nailed it. On the grid. (4) Design review: approved. By me.                                                              | Add variants |
| Lose                | (1) I'll take it back to the moodboard. (2) I'll go stare at some kerning. (3) Fine. Make the logo bigger. (4) I'll be in the corner, adjusting a shadow. (5) Fine. Ship it in Comic Sans. | Add variants |
| Ending (boss loses) | Fine. Put it in the next steering deck. I used to draw those.                                                                                                                              |              |
| Role blurb          | Has opinions about your line height.                                                                                                                                                       |              |

## Stakeholder

Intro: (1) Keep it short, I've got a call in five. (2) I've read the summary of the summary. (3) Walk me through it. Quickly. Without slides.

The mapping is now balanced (four answers from each pool), so no role gets an easier boss.

| ID      | Boss phrase                                              | Answered by                                                    | Note |
| ------- | -------------------------------------------------------- | -------------------------------------------------------------- | ---- |
| boss-1  | I don't see why this can't be done by Friday.            | pm-3: Funny how there's always time to do it again.            |      |
| boss-2  | The competitor's demo looked much slicker.               | pm-6: They also have a support forum. Have a read.             |      |
| boss-3  | Can't we just call it a feature?                         | dev-2: Lovely. Put it on the pricing page.                     | Done |
| boss-4  | Have you tried unplugging it? That always works at home. | dev-4: Twice. Now it's off for good.                           |      |
| boss-5  | Put it on my to-do list. I'll get to it.                 | dev-8: Your TODOs are old enough to have TODOs.                |      |
| boss-6  | My nephew says the whole app looks dated.                | des-1: The brand changed twice while you were saying that.     |      |
| boss-7  | I was told this was a small change.                      | pm-16: Small changes are how big outages introduce themselves. |      |
| boss-8  | This is non-negotiable for the launch.                   | pm-12: So were the last nine. The launch moved. Twice.         |      |
| boss-9  | I was told all the tests pass.                           | dev-12: The tests test that the tests pass.                    |      |
| boss-10 | Make the logo bigger.                                    | des-10: Bigger, bolder, and slightly on fire?                  |      |
| boss-11 | I showed it to my partner and they didn't get it.        | des-9: Noted. One vague feeling, no steps to reproduce.        | Done |
| boss-12 | Can we lose all that text?                               | des-15: They read it when it says “Delete account”.            |      |

## Mic drops (closers)

Three per role, outside every pool: offered in gold at full momentum, worth two steps. The player knows their own role's three from the start and collects the other six on defence. Rule: no closer may repeat a pool topic, since the point is a line the player has never heard in a normal exchange.

| ID        | Phrase                                            | Counter                                      | Note |
| --------- | ------------------------------------------------- | -------------------------------------------- | ---- |
| pm-mic-1  | I haven't said no since 2015.                     | We can tell. It's all in the product.        | Done |
| pm-mic-2  | My Gantt chart goes all the way to 2031.          | So does our technical debt.                  | Done |
| pm-mic-3  | I've written more user stories than Tolkien.      | And not one of them has a happy ending.      | Done |
| dev-mic-1 | I code in vim. Without syntax highlighting.       | That explains the bugs. They're camouflaged. | Done |
| dev-mic-2 | I once dropped the production database. Calmly.   | The users were less calm.                    | Done |
| dev-mic-3 | Eleven years, zero tests, zero incidents.         | Zero incidents reported. That's different.   | Done |
| des-mic-1 | I've done fifty user interviews this month.       | And quoted the one who agreed with you.      | Done |
| des-mic-2 | I named every colour in this palette. Personally. | “Slightly sadder grey” is not a token.       | Done |
| des-mic-3 | My empathy is so strong I cried at a form.        | So did the users. At the same form.          | Done |

Boss barks

| When                                        | Line                                                                          | Note |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ---- |
| Boss wins, last missed counter was PM       | (1) Have you aligned this with product? (2) Did product sign off on this?     |      |
| Boss wins, last missed counter was Dev      | (1) Have you talked to engineering about this? (2) What does engineering say? |      |
| Boss wins, last missed counter was Designer | (1) Has design seen this? (2) Did design approve this?                        |      |
| Player interrupts with a mic drop           | Let's take this offline.                                                      |      |

## Shared

| Where                                  | Line                                                         | Note                                         |
| -------------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Fallback (silence bar runs out)        | Uh… that's a good point.                                     |                                              |
| Hint, first exchange                   | Pick the reply that answers it.                              | Missing full stop; the menu prompts have one |
| Menu prompt, attack                    | Your turn. Pick a phrase to throw.                           |                                              |
| Menu prompt, defend                    | Pick your counter.                                           |                                              |
| Buddy 1                                | Let me help you, new hire.                                   |                                              |
| Buddy 2                                | I had this one on my second day.                             |                                              |
| Buddy 3                                | Read it again. Slowly. I have time. I have nothing but time. |                                              |
| Buddy 4                                | I'm not haunting you. I'm onboarding you.                    |                                              |
| Buddy, player misses after the whisper | I dimmed them. I literally dimmed them.                      |                                              |
