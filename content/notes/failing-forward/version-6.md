# **Failing Forward at Design Systems: Why the Map is Not the Territory**

If you have ever tried to build a design system, you probably started with a feeling of immense optimism. You likely pictured a pristine library of components. You imagined a world where designers and developers held hands, skipping through fields of perfectly aligned pixels and reusable code. You visualized the "Map."

But then you launched it. And you met the "Territory."

The most common failure mode in building design systems is spending too much time polishing the Map while ignoring the Territory.

I want to take you through a journey of building a design system. It is a story about a 15-year-old product, a few pivots, and the realization that the obstacles we faced were actually the way forward. It is about how we failed, how we fixed it, and why adoption is actually a terrible metric for success.

## **The Map vs. The Territory**

Let’s start with a concept that framed our entire experience. "The map is not the territory."

In the context of a design system, the **Map** is your documentation. It is your UI kit in Figma. It is your component library running in a vacuum-sealed Storybook environment. It is clean. It is organized. It represents how the UI *should* look and behave in a perfect theoretical world.

The **Territory** is reality.

The Territory is the messy CSS overrides in the legacy codebase. It is the browser-specific rendering quirks that keep you up at night. It is the network latency. It is the tight deadlines that product managers are pushing for. It is the political capital you have (or lack) within the organization.

The Map is how you think work gets done. The Territory is the path of least resistance that people actually take.

If you force a process that ignores the reality of product deadlines and how teams actually work, the teams will simply walk across the grass and ignore your paved sidewalk. This is exactly what happened to us.

## **The Context: Fighting Fires with a Garden Hose**

Let me set the scene. We were working with a product at Reservix that was over 15 years old. The features were great, and the engine was powerful, but it looked and felt dated. It didn't display the actual competency behind the software.

The plan was ambitious. We wanted to split the software into multiple products to gain technical and organizational benefits.

But the reality on the ground was different. Teams were spending their time extinguishing fires caused by poor decisions made years earlier. The answer "We can't build that" had become a reflex. It was holding back product innovation. Designers would come up with complex, beautiful prototypes, but the developers didn't have the tools to build that vision in a feasible timeframe.

So we did what any enthusiastic design system team would do. We built a solution.

We bootstrapped a component library. We used a modern tech stack with React and Tailwind. We based the design on fresh explorations. We found a pilot project that was rebuilding a product from the ground up, which meant we had a greenfield environment.

It was a successful first attempt. We had some growing pains, but that was expected. We high-fived each other. We had built the Map.

## **The Cold Shoulder**

Even though we showed how our tools could help build a product, nobody was interested in what we had to offer.

While we solved the problem for that *one* team, the majority of our colleagues were still stuck with the legacy software and the legacy stack. They were not interested. Even though the whole software department had committed themselves to moving away from the monolith, the reality was that they were still heavily invested in it.

They were stuck in their ways. Not because they were stubborn, but because they were afraid.

As with all products that have real use, there is a lot of pressure on product teams to get stuff done. Even though we showed that we could help them move faster and achieve a more modern result, they viewed the cost of adoption as impossibly high.

We realized something profound, echoed by Marianne Bellotti in her book *Kill It with Fire*:

"Hard legacy modernization problems are people problems, not technical ones."

We had built a technical solution for a people problem. We needed to pivot.

## **Pivot 1: Internal Sales and Marketing**

We stopped trying to force them to use our "perfect" new system and instead aligned ourselves with where the people and the business actually were. We looked for the value.

We provided a modern and simple setup to use our design system *inside* the legacy system. We made sure it provided the same style as the legacy system so that anything built with the new components was visually indistinguishable from the rest.

We shifted our focus entirely to onboarding. We wrote a ton of internal articles. We prepared educational material. We gave training sessions. We wrote guides.

Most importantly, we were there by their side. We helped them with every step along the way. Our number one priority became supporting our colleagues. We essentially became an internal marketing and sales team.

We did simple things to improve their quality of life, like giving them a dev environment where they didn't need to manually refresh the browser when they updated the UI. Everything we provided was designed to make our colleagues' lives easier, more convenient, and more fun.

This investment yielded returns. We went from "We can't build that" to "We can build that... most likely."

We got the buy-in. Adoption grew rapidly. One team after another started using the design system. It spread through word of mouth. In our regular internal product demos, more and more new features were being built with our system.

So, high five, right? We did it?

Actually, not really.

## **The Adoption Trap**

We fell into a common trap. We looked at adoption metrics and thought we were winning.

"Adoption is a lagging indicator of the goal, not the goal itself. \[...\] Design system adoption doesn't indicate success."

— Dan Mall

We had not lived up to our original promise. While the adoption was great, the teams were still building inconsistent user interfaces. Building wasn't as efficient as we had hoped.

We realized we had given the teams and the designers the **bricks**, but they were trying to build a house without a **blueprint**. They had to come up with UIs from the ground up every single time.

This brings us to the difference between Components and Patterns.

Components are unopinionated. They are flexible. A button is just a button. An input field is just an input field.

Patterns are the operating system of your product. They are opinionated. They tell you how to combine those components to solve a specific user problem.

We had provided components. We should have provided patterns.

## **Pivot 2: From "What" to "Why"**

So we pivoted again. We started building the "next" generation of our design system.

This time, we didn't touch the design or the components themselves. Instead, we enhanced our documentation. We moved from "this is *what* the component can do" to "this is *why* the component exists and this is *how* it should be used."

We focused heavily on patterns. We documented how to best combine components to create a great user experience. We shifted from being librarians of assets to being architects of experience (in the software sense).

## **The Obstacle is the Way**

Building a design system is not a straight line. It is a series of failures, pivots, and realizations.

If we hadn't faced the rejection from the legacy teams, we never would have focused so hard on developer experience and support. If we hadn't seen the inconsistent UIs despite high adoption, we never would have realized the importance of patterns over components.

The obstacles were necessary for the growth of the system.

If you are building a design system right now, remember these three things:

1. **Understand your users.** Your users are your colleagues. Understand their fears, their deadlines, and their legacy constraints. Solve *their* problems, not just your own desire for clean code.  
2. **Align with business value.** If the business is invested in the legacy system, find a way to bring value there. Don't fight the current; steer the boat.  
3. **Don't trust the map.** The map is just a drawing. The territory is where the work happens.

Failing forward isn't just a catchy phrase. It is the only way to build a system that actually survives in the wild.