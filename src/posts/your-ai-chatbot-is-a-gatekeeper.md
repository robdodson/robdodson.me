---
title: Your AI Chatbot Is a Gatekeeper
date: 2026-01-29
description: AI chatbots limit users to a fraction of their data's potential. Instead of building a chatbot, make your data accessible and let users bring their own AI.
tags:
  - ai
  - security
---

I really love the personal finance app [Monarch](https://www.monarch.com/). I used Mint for years but always felt vaguely icky about how their business model required trying to get me to sign up for credit cards. With Monarch, I pay them an annual fee, and they keep track of all of my finances in one place—perfect!

Recently they launched an AI chatbot. On the surface this seems like a cool feature, like my own little personal CPA, but in practice I could never seem to get excited by it. Mainly because **it's like talking to my financial data through a mail slot**.

The chatbot only knows what Monarch knows. But my financial life connects to *everything*—my goals in Obsidian, that spreadsheet where I'm modeling whether we can afford to remodel the kitchen. The chatbot can't see any of that. It's working with a fraction of the context I have.

And there's no memory. Each conversation starts fresh. Instead of feeling like a CPA who's known me for years, it's a new employee on their first day, every time.

I can't *do* anything with the conversation either. There's no place to save it. No way to build up plans over time that the AI and I can refer back to as things evolve.

I realized what I wanted was the full power of Claude Code along with my financial data so I could construct whatever interpretation of it I wanted.

## So I Built My Own

I found an unofficial SDK for Monarch's API and had Claude port it to TypeScript. Now I'm able to pull my financial data into a local SQLite database whenever I want. I built a little web UI to trigger snapshots, or I can just ask Claude to do it.

Suddenly the experience feels *bigger* than Monarch.

When I talk to Claude about my finances, it has all of the context—my Obsidian notes, other data sources I've connected, the financial plans we've generated together in previous conversations. I can say "remember that plan we made in October?" and it does!

This transforms it from a chat window into a workspace.

One tradeoff: I'm now responsible for my own data privacy. I handle this by stripping names and account numbers from each snapshot before saving. It's not fancy, but it works.

## The Chatbot Is a Ceiling

Here's what I realized: an AI chatbot feature is inherently limiting. You're giving users the full power of an LLM and then... capping it. They can only access their data through your interface. They can only ask the questions your chatbot is designed to handle with the context you provide.

This turns the chatbot into a gatekeeper.

Until the advent of something like Claude Code, there was very little value in giving users direct access to their data. A very small subset of technically minded customers *might* choose to build something with it, but the majority would not, so why invest time in building a public API?

But now that software is cheap and bespoke, giving users access to their data might actually be a selling point.

## What I'd Do Instead

If I were building a product like Monarch, I'd focus on two things:

**1. Own the drudgery.**

Monarch is great at the stuff I don't want to deal with: fiddly Plaid connectors, keeping transaction history up to date, auto-categorizing everything. Sure, I could try to vibe code my own version of this—but it would almost certainly bitrot and break as soon as I walked away. This is where Monarch earns the $100/year I pay them.

**2. Make the data accessible.**

Provide read-only API access so users can pull their data into whatever context they want. *Maybe* provide an API or CLI so agents can perform actions on the user's behalf. We're not there yet—[there's infrastructure to build first](/posts/clawdbots-missing-layers/)—but it's where things are heading.

The point is: stop being a gatekeeper. Be infrastructure. Let users bring their data into their own AI workflows, with their own context, their own memory, and their own tools.

Don't wall users in with your AI, let them bring their own.