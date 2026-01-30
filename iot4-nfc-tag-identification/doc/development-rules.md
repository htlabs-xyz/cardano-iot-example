# Development Rules

**CRITICAL:** This codebase ONLY works with `iot4-nfc-tag-identification` folder. Do NOT modify files outside this project scope.

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.
**IMPORTANT:** You ALWAYS follow these principles: **YAGNI (You Aren't Gonna Need It) - KISS (Keep It Simple, Stupid) - DRY (Don't Repeat Yourself)**

## Remote Workspace

**CRITICAL:** Project synced between local and remote Raspberry Pi 5 via Git.

- **Host:** `tid@192.168.1.16` (hostname: `pi2`)
- **OS:** Ubuntu aarch64 (Raspberry Pi)
- **SSH Key:** Configured (passwordless)
- **Local Path:** `/home/tid/project/iot/rpi5`
- **Remote Repo:** `/home/tid/cardano-iot-example` (git root)
- **Remote Project:** `/home/tid/cardano-iot-example/iot4-nfc-tag-identification`

### Git Sync Workflow

**ALWAYS sync via git** - do NOT use scp for code files.

```bash
# After local changes: push to remote
git add . && git commit -m "message" && git push

# Then pull on remote
ssh tid@192.168.1.16 'cd ~/cardano-iot-example && git pull'

# After remote changes: pull to local
ssh tid@192.168.1.16 'cd ~/cardano-iot-example && git add . && git commit -m "message" && git push'
git pull
```

### Remote Commands
```bash
# Execute command on remote project (iot1)
ssh tid@192.168.1.16 'cd ~/cardano-iot-example/iot1-sensor-data-store && <command>'

# Check remote git status
ssh tid@192.168.1.16 'cd ~/cardano-iot-example && git status'
```

## General
- **File Naming**: Use kebab-case for file names with a meaningful name that describes the purpose of the file, doesn't matter if the file name is long, just make sure when LLMs read the file names while using Grep or other tools, they can understand the purpose of the file right away without reading the file content.
- **File Size Management**: Keep individual code files under 200 lines for optimal context management
  - Split large files into smaller, focused components/modules
  - Use composition over inheritance for complex widgets
  - Extract utility functions into separate modules
  - Create dedicated service classes for business logic
- When looking for docs, activate `docs-seeker` skill (`context7` reference) for exploring latest docs.
- Use `gh` bash command to interact with Github features if needed
- Use `psql` bash command to query Postgres database for debugging if needed
- Use `ai-multimodal` skill for describing details of images, videos, documents, etc. if needed
- Use `ai-multimodal` skill and `imagemagick` skill for generating and editing images, videos, documents, etc. if needed
- Use `sequential-thinking` and `debug` skills for sequential thinking, analyzing code, debugging, etc. if needed
- **[IMPORTANT]** Follow the codebase structure and code standards in `./docs` during implementation.
- **[IMPORTANT]** Do not just simulate the implementation or mocking them, always implement the real code.

## Code Quality Guidelines
- Read and follow codebase structure and code standards in `./docs`
- Don't be too harsh on code linting, but **make sure there are no syntax errors and code are compilable**
- Prioritize functionality and readability over strict style enforcement and code formatting
- Use reasonable code quality standards that enhance developer productivity
- Use try catch error handling & cover security standards
- Use `code-reviewer` agent to review code after every implementation

## Pre-commit/Push Rules
- Run linting before commit
- Run tests before push (DO NOT ignore failed tests just to pass the build or github actions)
- Keep commits focused on the actual code changes
- **DO NOT** commit and push any confidential information (such as dotenv files, API keys, database credentials, etc.) to git repository!
- Create clean, professional commit messages without AI references. Use conventional commit format.

## Code Implementation
- Write clean, readable, and maintainable code
- Follow established architectural patterns
- Implement features according to specifications
- Handle edge cases and error scenarios
- **DO NOT** create new enhanced files, update to the existing files directly.