import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { user, logout } = useAuth();
  const [reflections, setReflections] = useState([]);
  const [stages, setStages] = useState([]);
  const [content, setContent] = useState('');
  const [stageId, setStageId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [reflectionList, stageList] = await Promise.all([
      base44.entities.reflections.list('-created_date', 50),
      base44.entities.stages.list('order', 50),
    ]);
    setReflections(reflectionList);
    setStages(stageList);
    if (stageList.length) setStageId(stageList[0].id);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !stageId) return;
    setSaving(true);
    const created = await base44.entities.reflections.create({
      content: content.trim(),
      currentStageId: stageId,
      timestamp: new Date().toISOString(),
    });
    setReflections((prev) => [created, ...prev]);
    setContent('');
    setSaving(false);
  };

  const stageTitle = (id) => stages.find((s) => s.id === id)?.title || '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reflections</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{user?.full_name || user?.email}</span>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mb-10 space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            value={stageId}
            onChange={(e) => setStageId(e.target.value)}
            disabled={!stages.length}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stages.length ? (
              stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))
            ) : (
              <option value="">No stages available</option>
            )}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Reflection</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your reflection..."
            rows={4}
          />
        </div>

        <Button type="submit" disabled={saving || !content.trim() || !stageId}>
          {saving ? 'Saving...' : 'Add reflection'}
        </Button>
      </form>

      <section className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading reflections...</p>
        ) : reflections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reflections yet.</p>
        ) : (
          reflections.map((r) => (
            <article key={r.id} className="rounded-lg border p-4">
              <p className="whitespace-pre-wrap">{r.content}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {stageTitle(r.currentStageId)}
                {r.timestamp ? ` · ${new Date(r.timestamp).toLocaleString()}` : ''}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}