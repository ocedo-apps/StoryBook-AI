import { useEffect, useRef, useState } from "react";
import type { IllustrationStyle } from "@core/illustrationStyle";
import { IllustrationStyleRepository } from "@persistence/IllustrationStyleRepository";

export function useIllustrationStyles() {
  const [styles, setStyles] = useState<IllustrationStyle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const repoRef = useRef<IllustrationStyleRepository | null>(null);
  if (!repoRef.current) repoRef.current = new IllustrationStyleRepository();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const repo = repoRef.current!;
      await repo.ensureSeeded();
      const list = await repo.list();
      if (!cancelled) {
        setStyles(list);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setStyles(await repoRef.current!.list());
  }

  async function saveStyle(style: IllustrationStyle) {
    await repoRef.current!.save(style);
    await refresh();
  }

  async function deleteStyle(id: string) {
    await repoRef.current!.delete(id);
    await refresh();
  }

  return { styles, loaded, saveStyle, deleteStyle };
}
