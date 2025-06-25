# Git Setup Commands

Git configuration commands to run on host:

```bash
git config --local core.hooksPath .git/hooks
git config --local advice.pushNonFastForward false
git config --local receive.denyCurrentBranch refuse
```