// Every "Save my place" / "Sign up now" / "Tell me when it opens" / status
// action across the site opens the connect form with its topic (and, where
// relevant, a more specific detail) already chosen via query params.
export type ConnectTopic =
  | 'visiting'
  | 'group'
  | 'serving'
  | 'prayer'
  | 'opening'
  | 'question'
  | 'hello';

export function connectHref(topic: ConnectTopic, detail?: string): string {
  const params = new URLSearchParams({ topic });
  if (detail) params.set('detail', detail);
  return `/connect?${params.toString()}`;
}
