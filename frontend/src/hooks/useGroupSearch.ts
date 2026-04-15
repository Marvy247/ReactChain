import { useState } from 'react';

export function useGroupSearch(totalGroups: number) {
  const [query, setQuery] = useState('');

  const filter = (name: string) =>
    !query || name.toLowerCase().includes(query.toLowerCase());

  return { query, setQuery, filter };
}
