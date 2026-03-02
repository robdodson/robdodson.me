---
title: How I Built My Mobile Second Brain
date: 2026-02-16
description: A step-by-step guide to running Obsidian, Claude Code, and Happy CLI on a DigitalOcean droplet so you can access your AI-powered second brain from your phone.
socialImage: /images/mobile-brain.jpg
socialImageAlt: A paper collage hand holding a cell phone. On the cell phone screen is a paper collage brain.
tags:
  - ai
  - claude
  - obsidian
---

<figure>
  <img src="/images/mobile-brain.jpg" alt="A paper collage hand holding a cell phone. On the cell phone screen is a paper collage brain.">
</figure>

In my last post, [My Second Brain Never Worked. Then I Gave It a Gardener](https://robdodson.me/posts/i-gave-my-second-brain-a-gardener/), I mentioned that putting my Obsidian vault on a VPS with Claude Code permanently running on it, and being able to access it from my phone, was the real "ah ha" moment for me. A few people asked how I set that up, so here's the full walkthrough.

The idea is simple: rent a cheap DigitalOcean droplet, sync your vault using `obsidian-headless` (a lightweight CLI — no Electron needed), install Claude Code so it can read and write your notes, and use [Happy](https://happy.engineering/) to control the whole thing from your phone. Total cost is about $24/month.

**Update (March 2026):** This post originally required running the full Obsidian Electron app headlessly via Xvfb — a real pain to set up. Obsidian has since released [`obsidian-headless`](https://www.npmjs.com/package/obsidian-headless), an official lightweight CLI that handles [Obsidian Sync](https://obsidian.md/sync) without the desktop app. It uses ~35MB of RAM instead of ~400MB+, and eliminates the need for Xvfb, VNC, a window manager, and all the Electron library dependencies. I've updated this guide accordingly — Phase 2 is now much simpler.

With all that out of the way, here is essentially the plan I followed with Claude Code.
Before starting, I'd recommend firing up your own Claude Code instance and pointing it at this post so it can help you out if you hit any snags!

---

## Phase 0: Create the Droplet

### Step 1: Sign Up / Log In to DigitalOcean

Go to [https://cloud.digitalocean.com](https://cloud.digitalocean.com) — create an account if you don't have one.

### Step 2: Create a Droplet

1. Click **Create → Droplets**
2. **Region:** Choose the closest to you (reduces latency for Happy sessions)
3. **Image:** Ubuntu 24.04 (LTS) x64
4. **Size:** Regular (shared CPU) → **$24/mo (4GB RAM, 2 vCPUs, 80GB SSD)**
   - The 2GB tier might work now that we use `obsidian-headless` (~35MB) instead of Electron (~400MB+), but 4GB gives comfortable headroom for Claude Code sessions
1. **Authentication:** Choose **SSH Keys** (recommended)
   - If you don't have one: on your Mac, run `cat ~/.ssh/id_ed25519.pub` (or `id_rsa.pub`)
   - Copy the output and paste it into DigitalOcean's "New SSH Key" dialog
   - If you have no SSH key at all: `ssh-keygen -t ed25519` on your Mac first
6. **Hostname:** `vault-server` (or whatever you want)
7. **Click Create Droplet**

It'll be ready in about 60 seconds. Copy the IP address it shows you.

### Step 3: First Login

```bash
# From your Mac:
ssh root@YOUR_DROPLET_IP

# Example:
ssh root@143.198.123.45
```

Accept the fingerprint. You're in!

### Step 4: Create a Non-Root User

Don't run everything as root. Create your own user:

```bash
# Create user (replace 'YOUR_USER' with your name)
adduser YOUR_USER
# Set a password when prompted, skip the rest with Enter

# Give sudo access
usermod -aG sudo YOUR_USER

# Copy your SSH key to the new user
mkdir -p /home/YOUR_USER/.ssh
cp /root/.ssh/authorized_keys /home/YOUR_USER/.ssh/
chown -R YOUR_USER:YOUR_USER /home/YOUR_USER/.ssh
chmod 700 /home/YOUR_USER/.ssh
chmod 600 /home/YOUR_USER/.ssh/authorized_keys

# Log out and log back in as your user
exit
```

```bash
ssh YOUR_USER@YOUR_DROPLET_IP
```

From here on, everything is done as your non-root user.

---

## Phase 1: System Setup

### Step 5: Update Everything

```bash
sudo apt update && sudo apt upgrade -y
```

> **Note:** If prompted about a modified `sshd_config`, choose **"keep the local version currently installed"** — DigitalOcean customizes this file and you don't want to overwrite it. After the upgrade finishes, you may see "System restart required" on your next login. If so, run `sudo reboot` and SSH back in after ~30 seconds.

### Step 6: Install Core Dependencies

```bash
# Misc tools
sudo apt install -y git curl tmux htop wget

# Fix for Ghostty terminal users — tmux won't work without this
echo 'export TERM=xterm-256color' >> ~/.bashrc
source ~/.bashrc
```

### Step 7: Install Node.js via nvm

Claude Code and Happy CLI both need Node.js. Use nvm so you control the version.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Load nvm into current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 22 (LTS)
nvm install 22
nvm use 22
nvm alias default 22

# Verify
node --version  # should show v22.x.x
npm --version
```

---

## Phase 2: Install Obsidian Headless Sync

Obsidian offers an official lightweight CLI (`obsidian-headless`) that syncs vaults without the desktop Electron app. It uses ~35MB of RAM instead of ~400MB+, and you don't need Xvfb, a window manager, VNC, or any Electron library dependencies.

### Step 8: Install obsidian-headless

```bash
sudo npm install -g obsidian-headless

# Verify
ob --version
```

### Step 9: Authenticate and Set Up Sync

```bash
# Log in to your Obsidian account
ob login
# Enter your email, password, and MFA code when prompted

# List your remote vaults
ob sync-list-remote
# Note the vault name you want to sync

# Create the local vault directory
mkdir -p ~/obsidian-vault

# Link the local directory to your remote vault
ob sync-setup --vault "YOUR_VAULT_NAME" --path ~/obsidian-vault --device-name "vps-headless"
# Enter your end-to-end encryption password when prompted

# Do an initial sync to pull down all files
ob sync --path ~/obsidian-vault
# Wait for it to finish
```

### Step 10: Create the Obsidian systemd Service

This makes headless sync start automatically on boot.

```bash
mkdir -p ~/.config/systemd/user

cat > ~/.config/systemd/user/obsidian-headless.service << EOF
[Unit]
Description=Obsidian Headless Sync
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=%h/obsidian-vault
ExecStart=/usr/bin/ob sync --continuous --path %h/obsidian-vault
Restart=on-failure
RestartSec=10
Environment=HOME=%h

[Install]
WantedBy=default.target
EOF

# Enable lingering (so user services run without being logged in)
sudo loginctl enable-linger $USER

# Enable and start the service
systemctl --user daemon-reload
systemctl --user enable obsidian-headless.service
systemctl --user start obsidian-headless.service

# Check it's running
systemctl --user status obsidian-headless.service
```

**Verify sync is working:**

```bash
# Check the service — should show a single node process (~35MB)
systemctl --user status obsidian-headless.service

# Check memory usage
free -h
# Without the Electron app, expect much lower memory usage
```

---

## Phase 3: Install Claude Code

### Step 11: Install Claude Code

```bash
# Native installer
curl -fsSL https://claude.ai/install.sh | bash

# Verify
claude --version
```

### Step 12: Authenticate Claude Code

```bash
claude
# This will give you a URL to paste into a browser on your Mac/phone
# Open the URL, enter the code shown, and follow the prompts
# to connect your Claude account.
```

After auth, test that it works:

```bash
cd ~/obsidian-vault
claude "list the files in this directory"
# Should see your vault files
```

Exit with `/exit` or Ctrl+C.

---

## Phase 4: Install Happy CLI

### Step 13: Install Happy

```bash
npm install -g happy-coder

# Verify
happy --version
```

### Step 14: Connect Your Phone

```bash
happy --auth
# This displays a QR code in your terminal
```

1. **Download the Happy app** on your phone (iOS App Store / Google Play)
2. **Scan the QR code** with the Happy app
3. You're paired. The connection is end-to-end encrypted.

### Step 15: Test Happy

```bash
cd ~/obsidian-vault
happy
# This starts Claude Code wrapped in Happy's relay
```

Now open the Happy app on your phone — you should see the Claude Code session. Type a message from your phone and watch it appear. Type in the terminal and watch it appear on your phone.

**This is the magic moment.** You can now control Claude Code from your phone, working on your Obsidian vault files, from anywhere!

---

## Phase 5: Make It Persistent

You want `happy` (wrapping Claude Code) to be running whenever you want to connect from your phone. Happy needs a real terminal (TTY) to work, so running it as a plain systemd service fails. The solution: systemd launches a tmux session with Happy inside it — auto-starts on boot, survives SSH disconnects, and gives Happy the terminal it needs.

### Step 16: Create the Happy systemd Service

```bash
# First, find your happy path (we need the full path for systemd)
which happy
# Example output: /home/YOUR_USER/.nvm/versions/node/v22.x.x/bin/happy
# Use YOUR path in the ExecStart line below

cat > ~/.config/systemd/user/happy-claude.service << 'EOF'
[Unit]
Description=Happy CLI (Claude Code mobile access)
After=network-online.target obsidian-headless.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=%h/obsidian-vault
ExecStart=/usr/bin/tmux new-session -d -s claude %h/.nvm/versions/node/v22.14.0/bin/happy
ExecStop=/usr/bin/tmux kill-session -t claude
Environment=HOME=%h
Environment=PATH=%h/.nvm/versions/node/v22.14.0/bin:%h/.local/bin:/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable happy-claude.service
systemctl --user start happy-claude.service
```

> **Note:** Adjust the node version path (`v22.14.0`) to match your actual install. Check with `which happy`.

### Verify It's Running

```bash
# Check the service status (should show "active (exited)" — that's correct for oneshot)
systemctl --user status happy-claude.service

# Confirm the tmux session exists
tmux list-sessions
# Should show: claude: ...

# If you want to peek inside (optional):
tmux attach -t claude
# Detach with: Ctrl+B, release, then D
# DO NOT use Ctrl+C — that kills the Happy process
```

### If Happy Dies or You Need to Restart

```bash
systemctl --user restart happy-claude.service
```

---

## Phase 6: Verify Everything Works

### Checklist

```bash
# 1. Obsidian headless sync is running
systemctl --user status obsidian-headless.service
# Should show "active (running)" with a single node process

# 2. Sync is connected
ob sync-status --path ~/obsidian-vault

# 3. Vault files are present and syncing
ls ~/obsidian-vault/
# Should show your vault's files/folders

# 4. Claude Code can access the vault
cd ~/obsidian-vault && claude "what markdown files are in this vault?"

# 5. Happy is running in tmux via systemd
systemctl --user status happy-claude.service
# Should show "active (exited)"
tmux list-sessions
# Should show "claude" session

# 6. Happy works from phone
# Open Happy app on phone, verify connection

# 7. Memory looks healthy
free -h
# Should show well under 2GB used — headless sync uses ~35MB vs ~400MB+ for Electron

# 8. After a reboot, everything restarts automatically
sudo reboot
# Wait 30 seconds, SSH back in
systemctl --user status obsidian-headless.service
# Should show "active (running)"
systemctl --user status happy-claude.service
# Should show "active (exited)"
tmux list-sessions
# Should show "claude" session
```

---

## Maintenance & Troubleshooting

### Updating Components

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# obsidian-headless
sudo npm update -g obsidian-headless

# Claude Code (auto-updates, but to force)
claude update

# Happy CLI
npm update -g happy-coder

# Node.js
nvm install 22  # installs latest 22.x
```

### Common Issues

**Obsidian Sync stops working:**
```bash
# Restart the headless sync service
systemctl --user restart obsidian-headless.service

# Check sync status
ob sync-status --path ~/obsidian-vault
```

**Can't connect to Happy from phone:**
- Check that the service is running: `systemctl --user status happy-claude.service`
- Check that the tmux session exists: `tmux list-sessions`
- If the session died, restart: `systemctl --user restart happy-claude.service`
- The Happy relay (app.happy.engineering) needs to be reachable from both the droplet and your phone
- Unlike a home Pi, the droplet's internet is rock solid — so this is almost always a process issue

**Obsidian Sync conflict:**
If you edit the same file on your phone/desktop AND Claude Code edits it on the droplet simultaneously, Obsidian Sync will create a conflict file. Rare in practice.

**"Killed" or process disappears:**
This is the OOM killer. Your droplet is running out of RAM. Check with `dmesg | tail` — if you see "Out of memory", you need to either add swap or upgrade to a bigger droplet:

```bash
# Add 2GB swap (quick fix)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Monitoring

```bash
# Quick health check
echo "=== Memory ===" && free -h && echo "=== Obsidian ===" && systemctl --user status obsidian-headless.service --no-pager -l | head -5 && echo "=== Vault files ===" && ls ~/obsidian-vault/ | head -10
```

### Backups

Your vault is synced to:
1. Obsidian Sync (cloud) — with 12 months version history on Plus
2. Your phone (Obsidian mobile)
3. Your desktop (Obsidian desktop)
4. The droplet (this setup)

That's 4 copies. For extra paranoia:

```bash
# Weekly local backup
crontab -e
# Add this line:
0 3 * * 0 tar -czf ~/vault-backups/vault-$(date +\%Y\%m\%d).tar.gz ~/obsidian-vault/
```

---

## Quick Reference

| What | Command |
|------|---------|
| SSH into droplet | `ssh YOUR_USER@YOUR_DROPLET_IP` |
| Check Obsidian sync | `systemctl --user status obsidian-headless.service` |
| Restart Obsidian sync | `systemctl --user restart obsidian-headless.service` |
| Check sync status | `ob sync-status --path ~/obsidian-vault` |
| Check Happy | `systemctl --user status happy-claude.service` |
| Restart Happy | `systemctl --user restart happy-claude.service` |
| Peek at Happy session | `tmux attach -t claude` (detach: Ctrl+B then D) |
| Check memory | `free -h` |
| Check running processes | `htop` |
| Update everything | `sudo apt update && sudo apt upgrade -y && claude update && sudo npm update -g obsidian-headless && npm update -g happy-coder` |

---

## When to Upgrade to a Raspberry Pi

I was initially debating between setting this up on DigitalOcean or buying a Raspberry Pi to run everything. I figured spending $24/mo to test if I liked this setup would be a good way to validate things before sinking money into a Pi.

If you find yourself using this daily and the $24/mo feels wasteful, that's a
good signal to switch. A Pi 5 8GB (~$180) pays for itself in ~8 months vs the
droplet. The setup process is nearly identical — same systemd services, same
tools, just on local hardware. You can reuse this guide almost verbatim.
