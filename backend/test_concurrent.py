"""
System Testing: Stable under concurrent operations
===================================================
This script simulates multiple users hitting the API simultaneously
to prove the system remains stable and responsive under load.
"""

import asyncio
import aiohttp
import time
import statistics

API_BASE = "http://localhost:8000"

# Endpoints to test concurrently
ENDPOINTS = [
    "/stocks",
    "/stocks/AMZN",
    "/stocks/AMZN/history",
    "/stocks/AMZN/prediction",
    "/stocks/AMZN/technicals",
    "/stocks/AMZN/metrics",
    "/stocks/AMZN/sentiment",
    "/stocks/MSFT",
    "/stocks/MSFT/prediction",
    "/stocks/GOOGL",
    "/stocks/GOOGL/prediction",
    "/stocks/NVDA/history",
    "/stocks/META/prediction",
]

# ── Colors for terminal output ──
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


async def fetch(session: aiohttp.ClientSession, url: str):
    """Send a single request and return (status, response_time, url)."""
    start = time.perf_counter()
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
            await resp.read()
            elapsed = time.perf_counter() - start
            return resp.status, elapsed, url
    except Exception as e:
        elapsed = time.perf_counter() - start
        return 0, elapsed, url  # 0 = failed


async def run_concurrent_test(n_concurrent: int = 50):
    """Fire n_concurrent requests at the same time."""
    # Build a list of URLs by cycling through endpoints
    urls = [f"{API_BASE}{ENDPOINTS[i % len(ENDPOINTS)]}" for i in range(n_concurrent)]

    print(f"\n{BOLD}{CYAN}╔══════════════════════════════════════════════════════╗{RESET}")
    print(f"{BOLD}{CYAN}║   System Testing: Concurrent Operations Stability    ║{RESET}")
    print(f"{BOLD}{CYAN}╚══════════════════════════════════════════════════════╝{RESET}\n")

    async with aiohttp.ClientSession() as session:
        # ── Test 1: Burst of concurrent requests ──
        print(f"{BOLD}Test 1: Burst – {n_concurrent} simultaneous requests{RESET}")
        print(f"  Sending {n_concurrent} requests to {len(ENDPOINTS)} different endpoints...\n")

        start_all = time.perf_counter()
        results = await asyncio.gather(*[fetch(session, url) for url in urls])
        total_time = time.perf_counter() - start_all

        # Analyze results
        statuses   = [r[0] for r in results]
        times      = [r[1] for r in results]
        success    = sum(1 for s in statuses if 200 <= s < 300)
        failed     = n_concurrent - success

        avg_time   = statistics.mean(times)
        median     = statistics.median(times)
        p95        = sorted(times)[int(0.95 * len(times))]
        max_time   = max(times)
        min_time   = min(times)

        # Print per-request status
        for status, elapsed, url in results:
            path = url.replace(API_BASE, "")
            if 200 <= status < 300:
                print(f"  {GREEN}✓{RESET} {status}  {elapsed:.3f}s  {path}")
            else:
                print(f"  {RED}✗{RESET} {status}  {elapsed:.3f}s  {path}")

        # Summary
        print(f"\n{BOLD}{'─' * 55}{RESET}")
        print(f"{BOLD}  Results Summary{RESET}")
        print(f"{'─' * 55}")
        print(f"  Total Requests   : {n_concurrent}")
        print(f"  Successful       : {GREEN}{success}{RESET}")
        print(f"  Failed           : {RED if failed else GREEN}{failed}{RESET}")
        print(f"  Success Rate     : {GREEN if success == n_concurrent else RED}{(success/n_concurrent)*100:.1f}%{RESET}")
        print(f"  Total Wall Time  : {total_time:.3f}s")
        print(f"{'─' * 55}")
        print(f"  Avg Response     : {avg_time:.3f}s")
        print(f"  Median Response  : {median:.3f}s")
        print(f"  P95 Response     : {p95:.3f}s")
        print(f"  Min Response     : {min_time:.3f}s")
        print(f"  Max Response     : {max_time:.3f}s")
        print(f"{'─' * 55}")

        # ── Test 2: Sustained rapid-fire (3 waves) ──
        print(f"\n{BOLD}Test 2: Sustained Load – 3 consecutive waves of {n_concurrent} requests{RESET}\n")
        wave_results = []
        for wave in range(1, 4):
            w_start = time.perf_counter()
            w_res = await asyncio.gather(*[fetch(session, url) for url in urls])
            w_time = time.perf_counter() - w_start
            w_success = sum(1 for s, _, _ in w_res if 200 <= s < 300)
            w_times = [t for _, t, _ in w_res]
            wave_results.append((w_success, n_concurrent, w_time, statistics.mean(w_times)))

            status_icon = f"{GREEN}PASS{RESET}" if w_success == n_concurrent else f"{RED}FAIL{RESET}"
            print(f"  Wave {wave}: {status_icon}  |  {w_success}/{n_concurrent} OK  |  Wall: {w_time:.3f}s  |  Avg: {statistics.mean(w_times):.3f}s")

        # ── Final Verdict ──
        all_passed = all(s == t for s, t, _, _ in wave_results) and failed == 0
        print(f"\n{'═' * 55}")
        if all_passed:
            print(f"{BOLD}{GREEN}  ✅ SYSTEM STABLE: All concurrent operations succeeded!{RESET}")
            if p95 < 2.0:
                print(f"{GREEN}  ✅ PERFORMANCE: P95 response time < 2 seconds ({p95:.3f}s){RESET}")
            else:
                print(f"{YELLOW}  ⚠  PERFORMANCE: P95 response time ≥ 2 seconds ({p95:.3f}s){RESET}")
        else:
            print(f"{BOLD}{RED}  ❌ SYSTEM UNSTABLE: Some requests failed under load.{RESET}")
        print(f"{'═' * 55}\n")


if __name__ == "__main__":
    asyncio.run(run_concurrent_test(50))
