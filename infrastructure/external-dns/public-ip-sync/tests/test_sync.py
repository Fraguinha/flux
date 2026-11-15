import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "sync.sh"


class PublicIpSyncTest(unittest.TestCase):
    def run_sync(self, rows, initial=None):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            capture = root / "applied.json"
            if initial is not None:
                capture.write_text(json.dumps(initial))
            kubectl = root / "kubectl"
            kubectl.write_text(
                f"#!{sys.executable}\n"
                "import json, os, pathlib, sys\n"
                "args = sys.argv[1:]\n"
                "if args[:2] == ['get', 'nodes']:\n"
                "    sys.stdout.write(os.environ['SYNC_NODE_ROWS'])\n"
                "elif args[:2] == ['create', 'configmap']:\n"
                "    values = dict(arg[len('--from-literal='):].split('=', 1) for arg in args if arg.startswith('--from-literal='))\n"
                "    print(json.dumps({'data': values}))\n"
                "elif args and args[0] == 'apply':\n"
                "    value = json.load(sys.stdin)\n"
                "    pathlib.Path(os.environ['SYNC_CAPTURE']).write_text(json.dumps(value))\n"
                "    print('captured')\n"
                "else:\n"
                "    raise SystemExit('Unexpected kubectl operation')\n"
            )
            kubectl.chmod(0o755)
            environment = os.environ.copy()
            environment.update(
                PATH=str(root) + os.pathsep + environment.get("PATH", ""),
                SYNC_NODE_ROWS=rows,
                SYNC_CAPTURE=str(capture),
            )
            result = subprocess.run(
                ["/bin/sh", str(SCRIPT)],
                env=environment,
                capture_output=True,
                text=True,
                timeout=10,
            )
            applied = json.loads(capture.read_text()) if capture.exists() else None
            return result, applied

    def test_ready_aggregate_preserves_offline_inventory_and_deduplicates(self):
        rows = (
            "sitea|192.0.2.10|True\n"
            "siteb|192.0.2.20|True\n"
            "duplicate|192.0.2.20|True\n"
            "offline|192.0.2.30|Unknown\n"
            "notready|192.0.2.40|False\n"
            "conditionless|192.0.2.50|\n"
            "addressless||True\n"
        )
        result, applied = self.run_sync(rows)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            applied["data"],
            {
                "PUBLIC_IPS": "192.0.2.10,192.0.2.20",
                "PUBLIC_IP_SITEA": "192.0.2.10",
                "PUBLIC_IP_SITEB": "192.0.2.20",
                "PUBLIC_IP_DUPLICATE": "192.0.2.20",
                "PUBLIC_IP_OFFLINE": "192.0.2.30",
                "PUBLIC_IP_NOTREADY": "192.0.2.40",
                "PUBLIC_IP_CONDITIONLESS": "192.0.2.50",
            },
        )

    def test_node_punctuation_produces_legal_unused_substitution_keys(self):
        rows = (
            "livinvicta|192.0.2.10|True\n"
            "cloud-1|192.0.2.20|True\n"
            "cloud-2|192.0.2.30|False\n"
            "node.example.com|192.0.2.40|Unknown\n"
        )
        result, applied = self.run_sync(rows)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            applied["data"],
            {
                "PUBLIC_IPS": "192.0.2.10,192.0.2.20",
                "PUBLIC_IP_LIVINVICTA": "192.0.2.10",
                "PUBLIC_IP_CLOUD_1": "192.0.2.20",
                "PUBLIC_IP_CLOUD_2": "192.0.2.30",
                "PUBLIC_IP_NODE_EXAMPLE_COM": "192.0.2.40",
            },
        )
        for key in applied["data"]:
            self.assertRegex(key, r"\A[_A-Za-z][_A-Za-z0-9]*\Z")

    def test_no_ready_public_address_preserves_existing_configmap(self):
        initial = {"data": {"PUBLIC_IPS": "203.0.113.10", "PUBLIC_IP_SITEA": "203.0.113.10"}}
        rows = "offline|192.0.2.30|Unknown\nnotready|192.0.2.40|False\nconditionless|192.0.2.50|\naddressless||True\n"
        result, applied = self.run_sync(rows, initial)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(applied, initial)


if __name__ == "__main__":
    unittest.main()
