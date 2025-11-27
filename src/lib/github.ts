/**
 * GitHub operations wrapper using Octokit
 * Handles committing details.json to the repository
 */

import { Octokit } from '@octokit/rest';

// Environment configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'azizbekdevuz/dr-niaraki-website';
const BRANCH = process.env.BRANCH || 'main';

interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
}

function getConfig(): GitHubConfig {
  const [owner, repo] = GITHUB_REPO.split('/');
  return { owner: owner ?? '', repo: repo ?? '', branch: BRANCH ?? 'main' } as GitHubConfig;
}

function getOctokit(): Octokit | null {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not configured - GitHub operations disabled');
    return null;
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

/**
 * Gets the SHA of an existing file in the repository
 */
export async function getFileSha(path: string): Promise<string | null> {
  const octokit = getOctokit();
  if (!octokit) return null;
  
  const config = getConfig();
  
  try {
    const response = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
      ref: config.branch,
    });
    
    if ('sha' in response.data) {
      return response.data.sha;
    }
    return null;
  } catch (error) {
    // File doesn't exist yet
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Commits a file to the repository
 */
export async function commitFile(
  path: string,
  content: string,
  message: string
): Promise<{ sha: string; url: string } | null> {
  const octokit = getOctokit();
  if (!octokit) {
    console.warn('GitHub token not available - cannot commit');
    return null;
  }
  
  const config = getConfig();
  
  // Get existing file SHA if it exists
  const existingSha = await getFileSha(path);
  
  // Create or update file
  const response = await octokit.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch: config.branch,
    ...(existingSha && { sha: existingSha }),
  });
  
  return {
    sha: response.data.commit.sha ?? '',
    url: response.data.commit.html_url ?? '',
  };
}

/**
 * Commits details.json to the repository
 */
export async function commitDetailsJson(
  data: object,
  uploader: string
): Promise<{ sha: string; url: string } | null> {
  const content = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString();
  const message = `auto-update: details.json — parsed by ${uploader} — ${timestamp}`;
  
  return commitFile('src/datasets/details.json', content, message);
}

/**
 * Checks if GitHub integration is configured
 */
export function isGitHubConfigured(): boolean {
  return Boolean(GITHUB_TOKEN && GITHUB_REPO);
}

/**
 * Gets the GitHub repository URL
 */
export function getRepositoryUrl(): string {
  const config = getConfig();
  return `https://github.com/${config.owner}/${config.repo}`;
}

/**
 * Gets the URL for a specific commit
 */
export function getCommitUrl(sha: string): string {
  const config = getConfig();
  return `https://github.com/${config.owner}/${config.repo}/commit/${sha}`;
}

/**
 * Gets manual revert instructions for a commit
 */
export function getRevertInstructions(sha: string): string {
  const config = getConfig();
  return `
## Manual Revert Instructions

To revert the commit with SHA: ${sha}

### Option 1: GitHub Web UI
1. Go to: ${getCommitUrl(sha)}
2. Click the "..." menu
3. Select "Revert" and follow the prompts

### Option 2: Git CLI
\`\`\`bash
git fetch origin ${config.branch}
git checkout ${config.branch}
git revert ${sha}
git push origin ${config.branch}
\`\`\`

### Option 3: Reset (destructive)
\`\`\`bash
git fetch origin ${config.branch}
git checkout ${config.branch}
git reset --hard ${sha}^
git push origin ${config.branch} --force
\`\`\`

**Note**: Reset is destructive and should only be used if you're sure about discarding changes.
`;
}

