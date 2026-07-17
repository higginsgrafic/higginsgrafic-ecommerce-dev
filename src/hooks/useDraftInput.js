import { useEffect, useRef, useState } from 'react';

export default function useDraftInput(value) {
  const focusedRef = useRef(false);
  const [draft, setDraft] = useState(() => String(value));

  useEffect(() => {
    if (focusedRef.current) return;
    setDraft(String(value));
  }, [value]);

  return { focusedRef, draft, setDraft };
}
