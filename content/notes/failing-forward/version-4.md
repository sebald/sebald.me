---
title: Failing Forward at Design Systems version 4
description: Building a design system is not as straightforward as it seems. The obstacles along the way are chances to build something truly valuable.
topics: [design-systems]
date: 2026-02-07
draft: true
---

# Failing Forward: Why Your Map Is Not the Territory

We often convince ourselves that a design system is a collection of components. We think it is a tidy library of buttons and inputs and colors that sit nicely in a repository. It feels good to organize these things. It feels like control. But that feeling is an illusion.

The reality is that a design system is not just its parts. It is the services and tools provided to users. It is the process. It is the support network. Most of all it is a political instrument used to navigate the messy reality of product deadlines and legacy code.

We spend too much time polishing the map while ignoring the territory. We build for a perfect world that does not exist.

## The Reflex of "No"

Let’s look at a situation many of us have seen before. Consider a product at Reservix that had been growing for over fifteen years. The features were powerful and the logic was sound. But the interface looked and behaved like it was from a different era. It did not display the actual competency behind the software.

The plan was simple on paper. We wanted to split the software into multiple products for technical and organizational benefits. But plans on paper rarely survive contact with reality.

Teams were spending their time extinguishing fires caused by poor decisions made years prior. When designers came to them with complex prototypes and modern visions the developers had a reflex. They said "We can't build that." It wasn't because they didn't want to. It was because they didn't have the tools to build that vision in a feasible timeframe.

So we did what any diligent systems team would do. We bootstrapped a component library. We picked a modern tech stack. We built the buttons and the unit fields based on previous design explorations. We found a project that was rebuilding a product from the ground up and we used that as our pilot. It was a successful first attempt. We proved it could work.

And nobody cared.

The majority of our colleagues were still stuck with the legacy software. They were not interested in what we had to offer. They were invested in the legacy system because that is where the pressure was. They had tight deadlines. They had a fear of failure. Even though we showed we could help them get stuff done faster they just kept doing things the way they always had.

We learned a hard lesson that Marianne Bellotti describes perfectly. Hard legacy modernization problems are people problems. They are not technical ones.

## Pivot to the People

We had to pivot. We stopped trying to force a new world on them and aligned ourselves with where the business actually was. We realized that for the teams working on the legacy system the cost of adoption seemed impossible.

So we changed our approach:

- We provided a modern setup to use our design system within the legacy system.
- We matched the style of the legacy system so the new components were indistinguishable from the old ones.
- We focused entirely on onboarding and internal marketing.

We didn't just write docs. We gave training. We wrote guides. We sat with them. We gave them a dev environment where they didn't need to manually refresh the browser to see UI updates. Everything we did was designed to make our colleagues' lives easier and more convenient.

It worked. The narrative shifted from "We can't build that" to "We can build that... most likely." We got buy in. Adoption grew rapidly and soon one team after another was using the system.

But here is the absurd part. We high fived each other. We thought we won.

We hadn't.

## The Map is Not the Territory

We soon realized that adoption is a lagging indicator of the goal. It is not the goal itself. High adoption does not indicate success.

Teams were using our components but they were still building inconsistent user interfaces. Building wasn't as efficient as we hoped because we had given them bricks without a blueprint. They had to come up with UIs from the ground up every time. We gave them flexible components when they actually needed opinionated patterns.

This brings us to the core problem of many design systems. We confuse the Map for the Territory.

The Map is your documentation. It is your UI kit. It represents how the UI should look in a perfect vacuum sealed environment. It is clean and organized and theoretical.

The Territory is reality. It is messy CSS overrides. It is legacy code clashes. It is browser specific rendering quirks and network latency. It is the political capital required to get a refactor approved. It is the tight deadline that forces a developer to hack a solution together.

The most common failure mode in building design systems is spending too much time polishing the Map while ignoring the Territory. The Map is how you _think_ work gets done. The Territory is the path of least resistance that people _actually_ take. If you force a process that ignores the reality of how teams work they will simply walk across the grass and ignore your paved sidewalk.

## The Obstacle Is the Way

Building a design system is never as straightforward as it seems. You will face obstacles. You will face rejection.

But this is not a sign of failure. This is "failing forward." The obstacles are the way. These obstacles are chances to build something valuable for your company and your colleagues.

We had to pivot again. We started building the "next" generation of our system. This time we didn't touch the design or the components. We enhanced the documentation to explain _why_ a component exists and _how_ it should be used. We focused on patterns. We focused on how to combine these elements to create a great user experience.

The true goal should be to empower teams to deliver better experiences faster and more consistently. You have to understand your users. You have to understand their issues and fears and desires. You have to stop building for the Map and start building for the Territory.
