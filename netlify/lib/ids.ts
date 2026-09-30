// Strict formats for every identifier that reaches the Google API from the browser.
export const DEVICE_ID = /^[A-Za-z0-9_-]{1,100}$/;
export const POLICY_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

export function lastSegment(name: string | null | undefined): string {
  return name ? name.slice(name.lastIndexOf('/') + 1) : '';
}
