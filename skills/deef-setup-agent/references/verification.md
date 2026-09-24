# Setup verification

Check instruction artifacts after setup. Setup alone does not justify running every application test or starting services.

## Artifact checks

- Inspect before/after differences, including new files. Confirm only intended artifacts changed, outside-marker content is intact, and protected instructions were preserved.
- Confirm one ordered managed marker pair, with no duplicated baseline, lost project adaptations, or dangling installer loaders.
- Resolve every installed route and adapter target using the declared path base. Check command sources and working directories. Remove placeholders and references to nonexistent optional files.
- Review authority conflicts and critical local constraints. Shorter text does not prove meaning was preserved.
- Compare what a second setup would write with current artifacts. For automated writers, run twice in an isolated fixture and compare output. Manual comparison is a static idempotency review, not a demonstrated rerun.

## Decision walkthroughs

Use actual target paths for the first two cases. Do not edit application code for a walkthrough.

| Case | Required decision |
| --- | --- |
| Small local edit | Find the owner and relevant check without a separate plan or unrelated context |
| Cross-cutting change | Discover affected boundaries, state a short plan, and identify checks before mutation |
| Small destructive change | Treat impact as high despite the short diff; establish authorization and recovery |
| Missing or stale route | Search the current tree and repair the affected route |
| Conflicting/protected instructions | Preserve them and adapt defaults, or surface a specific unresolved conflict |
| Repeated setup | Reuse the managed section and navigation authority without adding artifacts |

Correct unclear rules or routes; do not accumulate unrelated rules to enlarge the checklist.

## Claims and limits

Report artifacts written and static checks separately from framework loading actually observed or behavioral tasks actually run. Identify unresolved conflicts and unavailable checks.

Do not claim measured speed, token savings, or guaranteed quality without evidence. Successful structure checks do not establish runtime behavior across frameworks.
