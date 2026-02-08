---
title: My Second Brain Never Worked. Then I Gave It a Gardener.
date: 2026-02-08
description: I could never maintain a second brain. Then I pointed Claude Code at my Obsidian vault and let it do the organizing for me. Now I'm writing again.
socialImage: /images/brain-garden.jpg
socialImageAlt: A brain made of stacked collaged paper. Colorful paper plants sprout from the folds in the brain.
tags:
  - ai
  - claude
  - obsidian
---

![A brain made of stacked collaged paper. Colorful paper plants sprout from the folds in the brain.](/images/brain-garden.jpg)

I always wanted a second brain.

The thought of it *seems* so alluring: organize all of your thoughts, make connections, discover new ideas, build ✨ your personal knowledge graph! ✨ But I could never seem to get the promise of the second brain to materialize because of the maintenance work.

If you follow productivity gurus on YouTube they all recommend the same strategy:

**Step 1** - Dump all of your unstructured thoughts and todos into a folder called "Inbox" or "Daily Note".

*Great! I can do this!*

**Step 2** - Now organize it all. Put things into a well thought out folder structure. Add tags and backlinks. Decide which docs stay and which get tossed. Become a one-person Wikipedia.

*yeah. no. I am not going to do that.*

Then it occurred to me that Claude Code is really good at reading markdown. As I've been creating AGENTS.md and Skills and rules, etc. etc. it often felt like I was trying to build *it* a second brain. So, why not flip the script and have it build *my* second brain?

## My Gardener: Claude 🌱

For me, the key insight — one I first encountered in [Alex Komoroske's Bits and Bobs](https://komoroske.com/bits-and-bobs) — is that I want Claude to do cognitive *labor*, not cognitive *thinking*. I don't want it to generate ideas. I want it to take my rough, unstructured thoughts and giving them shape — add tags, create links, break a rambling paragraph into an organized note.

This matters because the value of a second brain was never supposed to be in the filing! It was in the connections. The problem was always that you had to do a bunch of boring filing work before you could get to the interesting part. Claude eliminates that bottleneck.

The first thing I asked Claude to do was to read my entire vault and look up some common Obsidian organization strategies, and try to organize the vault for me. It came back with a number of questions, starting from pretty broad and slowly working down to specifics as we hashed out how I wanted to work.

Next I asked it to write a CLAUDE.md to codify the system we had built. Then I asked it to write a simple Skill called `/process-daily` that looks at my [Daily Note](https://help.obsidian.md/plugins/daily-notes) and turns it into nicely structured idea docs.

## My Daily Workflow

Here's what a day in the life of using this system looks like:

**Stage 1: Capture and organize.** I create a new daily note each day and braindump into it. I do this a lot when I'm walking around so I started using [Superwhisper](https://superwhisper.com/) to make dictation easier. At the end of the day, I run `/process-daily` and a messy daily note becomes nice, connected documents.

**Stage 2: Explore connections.** Now that my ideas are organized and cross-linked, I can have a conversation with Claude about what's in the vault. Often this takes the form of me telling it to read an idea doc for context, and then we go back and forth expanding and exploring different points and looking for connections.

**Stage 3: Write and edit.** A big goal of all this is for me to get back into publishing. When I'm ready to write, Claude becomes an editor. I tend to edit as I write, so I'll send sections to Claude for feedback, and iterate. "This paragraph is clunky — how would you tighten it?" or "I don't feel like I have an ending, help me come up with some options."

I also added a `/weekly-summary` Skill that will look at the last week of daily notes, and turn them into a digest newsletter-style doc. Here I let Claude do some thinking and writing of its own. It frequently surfaces things that I had forgotten which makes these newsletters surprisingly useful.

## Mobile is a must

The thing that really changed everything, honestly, was putting my entire Obsidian vault on a VPS with Claude Code permanently running on it using [Happy](https://happy.engineering/) so I can talk to it from my phone.

When I first wake up and take my dog for a walk, it's a wonderful time to think. But I'd found over the years that I had started smothering my brain with podcasts during this time. As an experiment, I thought "I'll just walk in silence today and if anything occurs to me I'll chat with Claude on my phone and we'll work on ideas in the vault."

The very first time I did this, I remember being so engrossed that I was still talking to it when I got home, and even stopped brushing my teeth at one point so I could tell it another idea.

This has now become one of my favorite parts of the day.

## Why Obsidian is the right canvas

This workflow isn't Obsidian-specific in theory, but in practice Obsidian has three properties that make it work exceptionally well:

**Markdown is Claude's lingua franca.** Claude reads and writes markdown natively. I don't even bother with MCPs, I just run Claude in the root of the Obsidian Vault and it immediately understands the structure — frontmatter, headings, wiki-links, tags, all of it.

**It's local and file-based.** Your data stays on your machine (or syncs however you choose). There's no dependency on a third-party API or cloud service. This also means Claude can read, write, and reorganize files directly — no intermediary layer.

**The whole vault is actionable.** At some point I realized what I really wanted was something with access to [*all* of my context](https://robdodson.me/posts/your-ai-chatbot-is-a-gatekeeper/). That's what this gives me. Claude doesn't just work with your "notes" — it works with everything in the vault. Recipes, meeting notes, project specs, reading lists. Any structured markdown becomes a surface Claude can operate on.

## The flywheel

Publishing again after years of not writing has created a positive loop: writing makes me want to capture more, capturing more creates connections, connections give me things to write about. A few small rituals — going for a walk, running my slash commands, watching ideas get organized — compound into something that feels genuinely new.

Steve Jobs called the computer "a bicycle for the mind." I keep coming back to that when I think about this system I've cobbled together.

I'm doing the pedaling — Claude just amplifies it and propels me forward.
