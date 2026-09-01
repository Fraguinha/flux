#!/bin/sh
set -u

log() { echo "$(date -Iseconds) [annotator] $*"; }

log "started (node=$NODE_NAME, source=cloudflare/cdn-cgi/trace, interval=${INTERVAL}s)"
sleep $((RANDOM % 30))

while true; do
  ip=$(curl -4 -fsS --max-time 10 https://cloudflare.com/cdn-cgi/trace 2>/dev/null | sed -n 's/^ip=//p' | tr -d '[:space:]')
  case "$ip" in
    *.*.*.*)
      current=$(kubectl get node "$NODE_NAME" \
        -o jsonpath="{.metadata.annotations['public-ip-sync/public-ip']}" 2>/dev/null)
      if [ "$ip" != "$current" ]; then
        if kubectl annotate node "$NODE_NAME" --overwrite "public-ip-sync/public-ip=$ip" >/dev/null 2>&1; then
          log "public IP changed: ${current:-<none>} -> $ip"
        else
          log "WARN failed to annotate node with $ip"
        fi
      fi
      ;;
    *)
      log "WARN could not resolve public IP (got: '${ip:-<empty>}')"
      ;;
  esac
  sleep "$INTERVAL"
done
