#!/bin/sh
# Confidentiality check: run before every push.
#   sh scripts/check-disclosure.sh
#
# Scans every file that would be published (tracked + untracked, minus
# .gitignore'd) for:
#   1. private terms listed one regex per line in .disclosure-terms
#      (git-ignored: it holds the very names that must not be published,
#      such as the employer, NDA codenames and the phone number);
#   2. generic patterns: phone numbers, IPv4 addresses, template leftovers.
# Exits 1 if anything matches.

cd "$(dirname "$0")/.." || exit 2
FILES=$(git ls-files -co --exclude-standard | grep -v -e '^scripts/check-disclosure.sh$')
status=0

scan() { # label, extended regex, [file to skip]
  hits=$(printf '%s\n' "$FILES" | grep -v -x -e "${3:-//none//}" | tr '\n' '\0' | xargs -0 grep -I -n -i -E -- "$2" 2>/dev/null)
  if [ -n "$hits" ]; then
    echo "✗ $1"; printf '%s\n' "$hits" | sed 's/^/    /' | cut -c1-200; status=1
  fi
}

if [ -f .disclosure-terms ]; then
  while IFS= read -r term; do
    case "$term" in ''|'#'*) continue;; esac
    scan "private term: $term" "$term"
  done < .disclosure-terms
else
  echo "! .disclosure-terms not found: private-term checks skipped (see README)"; status=1
fi

scan "phone number"        '(\+254|\b0)7[0-9]{2}[ -]?[0-9]{3}[ -]?[0-9]{3}\b'
# logos.js is SVG path data, whose decimals ("1.103.588.2") look like addresses
scan "IPv4 address"        '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' 'assets/js/logos.js'
scan "template leftover"   'takeda|yourstudio|yourhandle|lorem ipsum|hugo-profile'

[ $status -eq 0 ] && echo "✓ disclosure check passed"
exit $status
