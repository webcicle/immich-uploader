function joinPath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/'); // Remove duplicate slashes
}

function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function apiPath(endpoint: string): string {
  return joinPath(getBasePath(), 'api', endpoint);
}

export function assetPath(path: string): string {
  return joinPath(getBasePath(), path);
}

export function navPath(path: string = ''): string {
  return joinPath(getBasePath(), path);
}