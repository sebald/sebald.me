---
title: outline
description: Building a design system is not as straightforward as it seems. The obstacles along the way are chances to build something truly valuable.
topics: [design-systems]
date: 2026-02-07
draft: true
---

# Failing forward at Design Systems

# Key talking points and  overall theme:

- a design system is more than it's parts, it's not (only) the components, it's about the services and tools it provides for its users and the processes and support for it
- the map is not the territory: your documentation, UI kit and component library is not your product. It represents how the UI should look and behave in a perfect, vacuum sealed environment. It is clean, organized, and theoretical. messy CSS overrides, the legacy code clashes, the browser specific rendering quirks, and the network latency. This is the reality (the territory).
- The most common failure mode in building design systems is spending too much time polishing the Map while ignoring the Territory.
- Map is your governance model, your contribution guidelines, and your adoption metrics. The Territory is the political capital, the tight deadlines, and the actual habits of the product teams.
- the Map is how you think work gets done, while the Territory is the path of least resistance that people actually take. If you force a process that ignores the reality of product deadlines and how teams actually work, the teams will simply walk across the grass and ignore your paved sidewalk.
- falling forward: building a design system is not as straight forward as it seems, it comes with many obstacles (the obstacle is the way) but these obstacles are chances to build something valuable for your company and your colleagues. In our case it was bringing back the fun and excitement that is building user interfaces. All while building better products that actually display the quality of the product
- understand your users (of the design system) their issues, fears and desires

<aside>
💡

These principles should be explained and shown based on the following experience I had when building our design system at Reservix:

</aside>

## Context

Context: 15+ year one grown product, the features were great. But it looks, behaves and feels dated. That didn't display the actual competency and power behind the software. The plan was to split the software in multiple products, with the hope for technical and organizational benefits.

## Story

Teams often spend their time extinguishing fires caused by poor initial decisions made years earlier. The answer "We can't build that" becomes a reflex, holding back product innovation. While the designers came up with complex prototype, the developers didn’t have the tools to build their vision in a feasible time. the design and user flows were all over the place.

the solution:

- started bootstrapping a component library with common components like a button, different types of unit fields etc. The design was based on a previous exploration from one of our designer
- found a project that basically rebuild one of the products from the ground up. so a modern tech stack was chosen
- successful first attempt, some growing pains but that was expected

Even though we showed how our tools can help build a product, nobody was interested in what we had to offer. while we solve problem that ONE team can now implement the vision of a designer. the majority of our colleagues were still stuck with the legacy software and stack.

They were not interested what we had to offer. even though the whole software department has committed themself to move away from the legacy monolith into stand alone products, the reality was different. They were still invested in the legacy system. They were stuck in their way, how they always did it. One reason for that was the feature of failure. As with all products that have real use, there is a lot of pressure on the product teams. especially to get stuff done.

and even though we showed that we can help get stuff done faster and with a better more modern result. they were not interested.

Turns out

> "Hard legacy modernization problems are people problems, not technical ones." — Marianne Bellotti, Kill it with fire

We needed to pivot. Modernization requires collaboration, decision-making alignment, and expectation management across organizational silos.

for the teams working on the legacy system, the cost of adoption seems high and basically impossible. and the business seemed more invested invested into modernizing the legacy system than to create new standalone products

so we pivoted, aligned us with were the people and the business are. were there was the value.

- we provided a modern and simple setup to use our design system in the legacy system. and we did so by providing the same style as the legacy system so stuff that was build using the design system was basically invisible / indistinguishable from the rest (although with some much better user experience)
- focus on onboarding: we wrote a ton of internal articles, prepared education material, gave training, wrote guides. and most importantly we were there on their side, and helped them on every step on their way. helping and supporting our colleagues was our number one priority. we basically did internal marketing and sales
- we did very simply things, like give them a dev environment where they did not need to manually refresh the browser when they updated the UI
- everything we did and provided was designed to make our colleagues life easier, more convenient and more fund

all this invested soon showed some return. we got from “we can’t build that” to “we can build that … most likely”

we got our colleagues buy-in

and so the adoption within in the company, grew rapidly. one team after each other was using the design system. it spread through word of mouth, to finally seeing what (and especially what short time) they can build. this also showed in the regular internal product demos. more and more new features and also refactoring was build with the design system

so, high five! right? we did it?

actually, not really. we didn't really live up our original promise. while the adoption grew and was great, the teams still build inconsistent user interfaces. and building wasn’t as efficient as we hoped, because a lot of times the teams and the desigerns had to the bricks, but need to build the without a blueprint (pattern) and so they had to come up with UIs from the ground up.

> **_"Adoption is a lagging indicator of the goal, not the goal itself. [...] Design system adoption doesn't indicate success."_
>  \*\***- Dan Mall, In Search of a Better Design System Metric than Adoption

while Components work best when flexible, not overly opinionated. it turns out UI Patterns are the operating system of your product and design systems. they are a very crucial part.

Actually, while we usually hear the goal of a design system is to make product development more efficient, consistent, and scalable. the true goal should be to empower teams to deliver better experiences faster and more consistently.

And so we kind of pivoted again. And started building the “next” generation of our design system, which in this case didn’t touch the design or the components. but enhanced our documentation from “this is what the component can do” to “this is WHY the component exist and this is HOW it should be used” and also pattern pattern pattern. how to best combine them to create a great user experience

and this story continues very simliar, but I think you get the point.

- obstacles are necessary for growth ("failing forward") of a design system
- working on a design system required shifting your focus to solve your users (colleagues) problems
- aligning closely with business value
- Design systems address and solve specific company needs

---

- **The Problem:** The team was stuck "fighting fires" caused by poor legacy decisions, leaving no room for innovation.
- **The Initial Solution:** They built a modern tech stack (React, Tailwind, Storybook) to provide reusable "building blocks."
- **The Reality Check:** Simply building it didn't mean anyone used it. They faced resistance ("We've always done it this way"), misalignment with business goals, and the high cost of refactoring legacy code.
- **The "Success" (and the Trap):** Through better documentation, tutorials, and internal marketing, they achieved high adoption rates (measured by downloads and usage). However, the author realized this was a **"lagging indicator."**
- **The Core Insight:** Despite using the system, teams were still building inconsistent, inefficient products. The design system team had provided **Components** (unopinionated bricks) when they should have provided **Patterns** (opinionated blueprints).
- **The Lesson:** The author concludes that obstacles are necessary for growth ("failing forward"). Success requires shifting focus from technical adoption to solving holistic design problems ("Patterns are the OS") and aligning closely with business value ("Follow the money").

---

```markdown
# Failing Forward at Design Systems

A talk about building and scaling a design system — the real challenges, lessons learned, and what success actually looks like.

## The Problem

> "You can't innovate on products without first innovating how you build them." — Alex Schleifer

Teams often spend their time extinguishing fires caused by poor initial decisions made years earlier. The answer "We can't build that" becomes a reflex, holding back product innovation.

## What is a Design System?

A toolbox of reusable building blocks — buttons, colors, guidelines — ensuring consistency, quality, and brand alignment while saving time. The core goal: make product development more efficient, consistent, and scalable.

Tech stack: React, React Aria, Tailwind CSS, Next.js, Storybook, Jest.

## The First Customer Challenge

Expectation met reality quickly:

- **Goal alignment?** No — teams were invested in legacy systems.
- **User adoption?** No — "We've always done it this way."
- **The real challenge:** Changing work culture and overcoming the fear of failure.

> "Hard legacy modernization problems are people problems, not technical ones." — Marianne Bellotti

Modernization requires collaboration, decision-making alignment, and expectation management across organizational silos.

## The Path to Success

1. **Alignment** — Focus on a core theme.
2. **React for core** — Establish a technical foundation.
3. **Buy-in** — Multiple product showcases (UI Kit, layouts, blog posts).
4. **Onboarding** — Documentation, tutorials, support channels.

### Results

The narrative shifted from "We can't build that" to "We can build that... most likely."

- NPM download trends showed growth.
- Bi-weekly reviews: teams consistently showcased features built with Marigold.
- Quarterly demos: nearly all new features used the design system.

## The Adoption Myth

> "Adoption is a lagging indicator, not the goal itself." — Dan Mall

High adoption numbers (90–100%) don't guarantee efficiency or consistency improvements. The true goal is to help the organization achieve its objectives efficiently with minimal burden — not to maximize usage numbers.

## What Actually Matters

The real question: **Do we empower teams to deliver better experiences faster and more consistently?**

The answer lies in prioritizing **patterns over components**:

- Patterns are the operating system of design systems.
- Components work best when flexible, not overly opinionated.

> "Stop building components, start building patterns." — Luke Murphy

## So, What is a Design System?

It depends. Each organization has unique needs.

> "Design systems address specific company needs." — Pedro Hernandez

## How to Build One

1. **Follow the money** — Identify high-impact projects and features.
2. **Emphasize patterns** — Address design challenges holistically, not just individual components.
3. **Community-driven** — Build by and for your people.
4. **Communicate constantly** — Early, frequent, and transparent messaging.
5. **The obstacle is the way** — View challenges as growth opportunities; trust adaptability over rigid planning.

Let's fail forward at design systems.
```
