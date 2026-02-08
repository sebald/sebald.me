---
title: Failing Forward at Design Systems version 5
description: Building a design system is not as straightforward as it seems. The obstacles along the way are chances to build something truly valuable.
topics: [design-systems]
date: 2026-02-07
draft: true
---

# **Failing Forward at Design Systems: The Map is Not the Territory**

This is a story about failure. Specifically, it is the story of how we failed to build a design system at Reservix.

We did everything right by the books. We built the components, we wrote the documentation, and we even got the adoption numbers to prove it. Yet, we still failed to solve the real problems our teams were facing. We learned the hard way that the obstacle is the way and that the map is rarely the territory. But before we get to the philosophy, we have to start with the struggle.

It began with a single sentence that we heard in almost every meeting.

## **The Problem: "We Can't Build That"**

"We can't build that."

It is a phrase that haunts product organizations. It becomes a reflex. A designer presents a vision that could change the trajectory of the user experience, and before the slide deck is even finished, the engineering leads are mentally calculating the technical debt, the legacy spaghetti code, and the tight deadlines. By the time the presentation ends, the answer is already no.

We were stuck in this cycle. We had a product that had grown over 15 years. The feature set was powerful, but the interface looked and felt dated. It did not display the actual competency behind the software. We wanted to innovate, but we were spending all our time extinguishing fires caused by decisions made a decade ago.

## **The First Attempt: The Shiny New Toy**

Our initial plan was logical. We would split the massive legacy software into multiple modern products. To bridge the gap between our design vision and development reality, we would introduce a design system.

We followed the standard playbook to the letter. We started bootstrapping a component library. We looked at previous explorations from our designers and began codifying them. We found a pilot project that was rebuilding one of the products from the ground up, which allowed us to choose a modern tech stack.

We built something beautiful.

We had a component library with buttons, inputs, and strict guidelines. It was modern. It was clean. We successfully launched it with that one pilot team. There were growing pains, of course, but that was expected. We patted ourselves on the back and prepared to roll this out to the rest of the company.

And then... nothing happened.

Even though we showed how our tools could help build a product faster, nobody else was interested. While we had solved the problem for one team, the majority of our colleagues were still stuck with the legacy software.

They were not interested because our solution ignored their reality. Even though the whole software department had committed themselves to moving away from the legacy monolith into standalone products, the reality on the ground was different. They were still invested in the legacy system because that was what paid the bills.

We walked up to them with a shiny new toolset and said "Look how fast you can build\!" and they looked at their backlog of legacy bugs and tight deadlines and said "I do not have time to learn this."

## **The Pivot: It Is a People Problem**

We realized that hard legacy modernization problems are people problems, not technical ones. This is a sentiment echoed by Marianne Bellotti in her book _Kill It With Fire_, and we were living it.

For the teams working on the legacy system, the cost of adoption seemed impossibly high. The business seemed more invested in keeping the legacy system alive than in creating the new standalone products we had built our system for. We had built a system for a future that hadn't arrived yet, while ignoring the present that everyone was living in.

So we pivoted. We decided to align ourselves with where the people and the business actually were.

We stopped trying to force them to come to our modern stack and instead brought the design system to them. We provided a modern and simple setup to use our design system _within_ the legacy system. We even matched the styling of the legacy system so that components built using the new system were visually indistinguishable from the old code, although they offered a much better user experience and developer ergonomics.

We shifted our focus entirely to onboarding and support. We basically became an internal sales and marketing team.

- We wrote a ton of internal articles.
- We prepared educational material and gave training sessions.
- We wrote comprehensive guides.
- Most importantly, we sat with them. We were there on their side, helping them every step of the way.

Everything we did was designed to make our colleagues' lives easier, more convenient, and more fun. We wanted to bring back the excitement of building user interfaces.

## **The False Summit: The Adoption Trap**

This investment yielded returns. We slowly transitioned the culture from "we can't build that" to "we can build that... most likely."

We got our colleagues' buy-in. Adoption within the company grew rapidly. One team after another started using the design system. It spread through word of mouth. Teams saw what their peers could build, and more importantly, how quickly they could build it. In our regular internal product demos, we saw more and more new features and refactoring efforts being built with our system.

High five\! We did it\! Right?

Actually, not really.

We had fallen into a common trap. We confused adoption with success. As Dan Mall notes, adoption is a lagging indicator of the goal, not the goal itself. High adoption numbers do not guarantee that you are actually solving the core problems of efficiency and consistency.

While the adoption metrics looked great on a slide deck, the reality in the product was different. The teams were still building inconsistent user interfaces. Building wasn't as efficient as we had promised.

We realized that while we had given them the bricks, we hadn't given them the blueprints.

## **The Second Pivot: Patterns over Components**

We had provided unopinionated, flexible components. A button is just a button. It doesn't tell you _where_ to put it or _when_ to use it. Because the teams and designers had the bricks but no blueprints, they had to come up with UIs from the ground up every time. They were reinventing the wheel, just with nicer spokes.

The true goal of a design system is not just to be used. It is to empower teams to deliver better experiences faster and more consistently. If everyone uses your library but builds a different user flow for the same task, you have failed at consistency.

So we pivoted again. We started building the "next" generation of our design system. This time, we didn't touch the visual design or the individual components. Instead, we overhauled our documentation and guidance. We shifted from "this is what the component can do" to "this is WHY the component exists and this is HOW it should be used."

We focused obsessively on patterns. We documented how to best combine components to create a great user experience. We moved from providing raw materials to providing solutions.

## **The Mental Model: The Map vs. The Territory**

Looking back at this journey, I am reminded of a concept from general semantics coined by Alfred Korzybski: **The map is not the territory.**

It is a reminder that the description of the thing is not the thing itself. The menu is not the meal. The user manual is not the device. In the world of design systems, we suffer from a severe case of confusing the two.

Your design system documentation, your beautifully organized Figma files, and your pristine Storybook environment are the **Map**. It represents how the UI should look and behave in a perfect, vacuum sealed environment. It is clean, organized, and theoretical.

The **Territory** is the reality. It is the messy CSS overrides, the legacy code clashes, the browser specific rendering quirks, and the network latency. The Territory is the political capital required to get a refactor approved, the tight deadlines that force shortcuts, and the actual habits of the product teams.

The most common failure mode in building design systems is spending too much time polishing the Map while ignoring the Territory.

When we built our first version, we were obsessed with the Map. We thought that if we made the documentation perfect and the code clean, people would use it. But the Territory—the reality of legacy deadlines and fear of failure—was impassable.

The Map is how you _think_ work gets done. The Territory is the path of least resistance that people _actually_ take. If you force a process that ignores the reality of product deadlines and how teams actually work, the teams will simply walk across the grass and ignore your paved sidewalk.

### **Failing Forward**

This brings us to the concept of "failing forward."

Building a design system is not a linear path from A to B. It is an exploration of the Territory. Every time we failed—when teams ignored us, when adoption didn't lead to consistency—we weren't hitting a dead end. We were discovering the shape of the land.

We learned that the obstacles _were_ the way. The resistance from the legacy teams wasn't just stubbornness; it was a signal that our product didn't fit their needs. The inconsistency despite high adoption wasn't user error; it was a signal that our documentation lacked opinion.

If you are building a design system today, do not get lost in your Map. Do not confuse your Figma components with your product's reality.

Go into the Territory. Sit with the developers who are struggling with legacy code. Understand the political pressures on the product managers. Watch how designers actually make decisions when the deadline is looming.

Your job is not to build a perfect library. Your job is to make the Territory navigable for your team. Sometimes that means building a button. Sometimes it means holding a training session. Sometimes it means admitting your beautiful system doesn't work for the problem at hand and pivoting to something that does.

The Map is useful, but the Territory is where we live. Build for the Territory.
