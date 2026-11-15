#!/bin/sh
set -u

log() { echo "$(date -Iseconds) [sync] $*"; }

set --
IPS=""
n=0
while IFS='|' read -r name ip ready; do
  [ -n "$ip" ] || continue
  set -- "$@" --from-literal="PUBLIC_IP_$(echo "$name" | tr '[:lower:].-' '[:upper:]__')=$ip"
  [ "$ready" = "True" ] || continue
  IPS="${IPS:+$IPS,}$ip"
  n=$((n + 1))
done <<EOF
$(kubectl get nodes -o go-template='{{range .items}}{{.metadata.name}}|{{with index .metadata.annotations "public-ip-sync/public-ip"}}{{.}}{{end}}|{{range .status.conditions}}{{if eq .type "Ready"}}{{.status}}{{end}}{{end}}{{"\n"}}{{end}}')
EOF

if [ -z "$IPS" ]; then
  log "no Ready node public IPs found; leaving ConfigMap unchanged"
  exit 0
fi

IPS=$(printf '%s' "$IPS" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')
log "collected $n Ready node IP(s); PUBLIC_IPS=$IPS"

if out=$(kubectl create configmap external-dns-targets -n flux-system \
      --from-literal="PUBLIC_IPS=$IPS" "$@" --dry-run=client -o yaml \
      | kubectl apply --server-side --force-conflicts --field-manager=public-ip-sync -f - 2>&1); then
  log "$out"
else
  log "WARN apply failed: $out"
  exit 1
fi
