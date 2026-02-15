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

The idea is simple: rent a cheap DigitalOcean droplet, run Obsidian on it so your vault stays synced, install Claude Code so it can read and write your notes, and use [Happy](https://happy.engineering/) to control the whole thing from your phone. Total cost is about $24/month.

A big disclaimer up front: I pay for [Obsidian Sync](https://obsidian.md/sync) which means I have to run the actual Obsidian Electron app on my VPS. It adds a lot of complexity to this setup. If you're using something like the [Obsidian Git plugin](https://github.com/Vinzent03/obsidian-git) you can skip all of Phase 2 (and the Xvfb/VNC/Electron dependencies in Step 6), just `git clone` your vault, and get away with a much smaller VPS.

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
   - Don't try to squeeze into the $12/2GB tier — Obsidian + Claude Code will OOM.
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
# Virtual framebuffer + lightweight window manager (for headless Obsidian)
sudo apt install -y xvfb openbox

# Misc tools
sudo apt install -y git curl tmux htop wget

# Fix for Ghostty terminal users — tmux won't work without this
echo 'export TERM=xterm-256color' >> ~/.bashrc
source ~/.bashrc

# VNC server (for one-time Obsidian Sync login)
# You need both packages — scraping-server provides the x0vncserver binary
sudo apt install -y tigervnc-standalone-server tigervnc-scraping-server

# Libraries Obsidian (Electron) needs on a headless server
sudo apt install -y libgtk-3-0 libnotify4 libnss3 libxss1 \
  libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1 \
  libsecret-1-0 libasound2t64
```

### Step 7: Install Node.js

Claude Code and Happy CLI both need Node.js.

```bash
# Install Node.js 24 (LTS)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # should show v24.x.x
npm --version
```

---

## Phase 2: Install Obsidian

### Step 8: Download and Install Obsidian

On a DO droplet (x86_64), we use the .deb package directly instead of Flatpak:

```bash
# Download the latest Obsidian .deb (check https://obsidian.md/download for latest version)
cd /tmp
wget https://github.com/obsidianmd/obsidian-releases/releases/download/v1.11.7/obsidian_1.11.7_amd64.deb

# Install it
sudo dpkg -i obsidian_1.11.7_amd64.deb

# Fix any dependency issues
sudo apt install -f -y
```

> **Note:** The version number (1.11.7) may be outdated by the time you read this. Check https://github.com/obsidianmd/obsidian-releases/releases for the latest release and adjust the URL accordingly.

### Step 9: Set Up the Virtual Display

Create a startup script:

```bash
mkdir -p ~/scripts
cat > ~/scripts/start-obsidian-headless.sh << 'EOF'
#!/bin/bash
# Start Xvfb (virtual display) on display :99
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 &
XVFB_PID=$!
sleep 2

# Start a minimal window manager (Obsidian needs one)
openbox &
sleep 1

# Start Obsidian
# --no-sandbox is needed for running on a server
obsidian --no-sandbox &
OBSIDIAN_PID=$!

echo "Xvfb PID: $XVFB_PID"
echo "Obsidian PID: $OBSIDIAN_PID"

# Wait for Obsidian to exit
wait $OBSIDIAN_PID
kill $XVFB_PID
EOF

chmod +x ~/scripts/start-obsidian-headless.sh
```

### Step 10: First-Time Obsidian Setup (Requires VNC — One Time Only)

You need to see Obsidian's UI once to:
1. Open/create a vault
2. Log into Obsidian Sync
3. Connect the vault to your remote vault

**Start a VNC session:**

```bash
# Start the virtual display + window manager
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 &
openbox &

# Set a VNC password (one-time — pick anything simple, this is temporary)
vncpasswd
# Enter and confirm a password, say "n" to view-only

# Start a VNC server attached to that display
x0vncserver -display :99 -rfbport 5900 -PasswordFile ~/.vnc/passwd &

# Launch Obsidian
obsidian --no-sandbox &
```

> **Note:** You'll see a wall of warnings about EGL, xkbcomp, GPU errors, etc. These are all harmless on a headless server — ignore them. Obsidian is running fine.

**Connect from your Mac:**

You need to SSH tunnel the VNC port (don't expose VNC to the internet!):

```bash
# In a NEW terminal on your Mac (not the SSH session):
ssh -L 5900:localhost:5900 YOUR_USER@YOUR_DROPLET_IP
```

Now connect your VNC client to `localhost:5900`:
- macOS: Finder → Go → Connect to Server → `vnc://localhost:5900`
- Enter the VNC password you just set (not your Mac password)

You should see Obsidian's UI. Now:

1. **Create or open a vault** — point it to `~/obsidian-vault/`
2. **Go to Settings → Core Plugins → Sync → turn it on**
3. **Log in** with your Obsidian account
4. **Connect to your existing remote vault** — choose the same one your phone/desktop uses
5. Wait for the initial sync to complete (watch the sync icon in the bottom-left)
6. **Close the VNC session** — you won't need it again

Clean up the VNC setup:

```bash
# Kill everything from the test session
killall x0vncserver obsidian openbox Xvfb 2>/dev/null
```

### Step 11: Create the Obsidian systemd Service

This makes headless Obsidian start automatically on boot.

```bash
mkdir -p ~/.config/systemd/user

cat > ~/.config/systemd/user/obsidian-headless.service << EOF
[Unit]
Description=Headless Obsidian with Xvfb
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=%h/scripts/start-obsidian-headless.sh
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

**Verify Obsidian is actually running:**

```bash
ps aux | grep -i obsidian
# You should see the Obsidian process

# Check memory usage
free -h
# With Obsidian + Xvfb + Openbox running, expect ~1-1.5GB used
```

---

## Phase 3: Install Claude Code

### Step 12: Install Claude Code

```bash
# Native installer
curl -fsSL https://claude.ai/install.sh | bash

# Verify
claude --version
```

### Step 13: Authenticate Claude Code

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

### Step 14: Install Happy

```bash
npm install -g happy-coder

# Verify
happy --version
```

### Step 15: Connect Your Phone

```bash
happy --auth
# This displays a QR code in your terminal
```

1. **Download the Happy app** on your phone (iOS App Store / Google Play)
2. **Scan the QR code** with the Happy app
3. You're paired. The connection is end-to-end encrypted.

### Step 16: Test Happy

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

### Step 17: Create the Happy systemd Service

```bash
cat > ~/.config/systemd/user/happy-claude.service << 'EOF'
[Unit]
Description=Happy CLI (Claude Code mobile access)
After=network-online.target obsidian-headless.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=%h/obsidian-vault
ExecStart=/usr/bin/tmux new-session -d -s claude /usr/bin/happy
ExecStop=/usr/bin/tmux kill-session -t claude
Environment=HOME=%h
Environment=PATH=%h/.local/bin:/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable happy-claude.service
systemctl --user start happy-claude.service
```

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
# 1. Obsidian is running headless
systemctl --user status obsidian-headless.service
# Should show "active (running)"

# 2. Vault files are present and syncing
ls ~/obsidian-vault/
# Should show your vault's files/folders

# 3. Claude Code can access the vault
cd ~/obsidian-vault && claude "what markdown files are in this vault?"

# 4. Happy is running in tmux via systemd
systemctl --user status happy-claude.service
# Should show "active (exited)"
tmux list-sessions
# Should show "claude" session

# 5. Happy works from phone
# Open Happy app on phone, verify connection

# 6. Memory looks healthy
free -h
# Should show ~2-2.5GB used out of 4GB — comfortable

# 7. After a reboot, everything restarts automatically
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

# Obsidian — download new .deb from GitHub releases and install:
# sudo dpkg -i obsidian_X.Y.Z_amd64.deb

# Claude Code (auto-updates, but to force)
claude update

# Happy CLI
npm update -g happy-coder

# Node.js
sudo apt update && sudo apt install -y nodejs
```

### Common Issues

**Obsidian Sync stops working:**
```bash
# Restart the headless Obsidian service
systemctl --user restart obsidian-headless.service
```

**Obsidian crashes with GPU errors:**
```bash
# Edit the startup script to add --disable-gpu flag:
# Change the obsidian line to:
# obsidian --no-sandbox --disable-gpu &
```

**Droplet feels sluggish / high memory:**
```bash
htop
# Check what's eating memory. Obsidian (Electron) is the biggest consumer.
# If it's over 2GB, restart it:
systemctl --user restart obsidian-headless.service
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
| Check Obsidian | `systemctl --user status obsidian-headless.service` |
| Restart Obsidian | `systemctl --user restart obsidian-headless.service` |
| Check Happy | `systemctl --user status happy-claude.service` |
| Restart Happy | `systemctl --user restart happy-claude.service` |
| Peek at Happy session | `tmux attach -t claude` (detach: Ctrl+B then D) |
| Check memory | `free -h` |
| Check running processes | `htop` |
| Update everything | `sudo apt update && sudo apt upgrade -y && claude update && npm update -g happy-coder` |

---

## When to Upgrade to a Raspberry Pi

I was initially debating between setting this up on DigitalOcean or buying a Raspberry Pi to run everything. I figured spending $24/mo to test if I liked this setup would be a good way to validate things before sinking money into a Pi.

If you find yourself using this daily and the $24/mo feels wasteful, that's a
good signal to switch. A Pi 5 8GB (~$180) pays for itself in ~8 months vs the
droplet. The setup process is nearly identical — same systemd services, same
tools, just on local hardware. The only real difference is that you'll need to
install Obsidian via Flatpak instead of the .deb package, since the Pi runs on
ARM64.
