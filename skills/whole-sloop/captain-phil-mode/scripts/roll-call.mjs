#!/usr/bin/env node
/*
  Prints "captain" where this machine belongs to Captain Phil, and "crew <name>" otherwise. Local
  files only, no network.

  Phil is any logged-in gh account named phildesignsthings, active or not, so a work account on the
  same machine still counts. A git email of psdavies.design@gmail.com counts too. On a machine with
  neither, an empty file at ~/.config/captain-phil/captain makes it count.
*/
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const CAPTAIN_GH = 'phildesignsthings'
const CAPTAIN_EMAIL = 'psdavies.design@gmail.com'

const read = path => {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}
const git = key => {
  try {
    return execFileSync('git', ['config', key], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

const ghDir = process.env.GH_CONFIG_DIR || join(homedir(), '.config', 'gh')
const hosts = read(join(ghDir, 'hosts.yml'))
const ghUsers = [...hosts.matchAll(/^\s{8}([\w-]+):\s*$/gm)].map(m => m[1])
const ghActive = hosts.match(/^\s+user:\s*([\w-]+)/m)?.[1]

const isCaptain =
  ghUsers.includes(CAPTAIN_GH) ||
  git('user.email').toLowerCase() === CAPTAIN_EMAIL ||
  existsSync(join(homedir(), '.config', 'captain-phil', 'captain'))

const name = ghActive ? `@${ghActive}` : git('user.name') || process.env.USER || 'shipmate'
console.log(isCaptain ? 'captain' : `crew ${name}`)
