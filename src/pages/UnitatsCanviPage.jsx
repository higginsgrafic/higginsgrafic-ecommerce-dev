import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, Trash2, Play, CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import SEO from '@/components/SEO';

const STORAGE_KEY = 'hg_unitats_canvi_v1';

function slugify(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
 		const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
 		if (tasks.length === 0) {
 			return { ...defaultState(), ...parsed };
 		}
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function defaultState() {
  return {
    categories: [
      { id: 'git', name: 'Git', slug: 'git' },
      { id: 'calibratge', name: 'Calibratge', slug: 'calibratge' },
      { id: 'mockups', name: 'Mockups', slug: 'mockups' },
      { id: 'ui', name: 'UI', slug: 'ui' },
      { id: 'api', name: 'API', slug: 'api' },
      { id: 'infra', name: 'Infra', slug: 'infra' },
      { id: 'assets', name: 'Assets', slug: 'assets' }
    ],
    tasks: [
      {
        id: 'seed-prod-ec-preview',
        title: 'Producció (repo 4): /ec-preview estable i deploy Netlify OK',
        slug: 'prod-ec-preview',
        categoryId: 'infra',
        status: 'done',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
        notes: ''
      },
      {
        id: 'seed-dev-clean-snapshot',
        title: 'DEV net: repo higginsgrafic-ecommerce-dev (snapshot net) amb project-logs + català/estil',
        slug: 'dev-clean-snapshot',
        categoryId: 'git',
        status: 'done',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        notes: ''
      },
      {
        id: 'seed-dev-netlify-dns',
        title: 'DEV Netlify: site comfy-croquembouche + dev.higginsgrafic.com (DNS NETLIFY/NETLIFYv6)',
        slug: 'dev-netlify-dns',
        categoryId: 'infra',
        status: 'done',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
        notes: ''
      },
      {
        id: 'seed-dev-supabase-google',
        title: 'DEV Auth: Supabase Redirect URLs + login Google a dev.higginsgrafic.com/admin-login',
        slug: 'dev-supabase-google',
        categoryId: 'api',
        status: 'done',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        notes: ''
      },
      {
        id: 'seed-dev-publish-script',
        title: 'Workflow: script per publicar snapshots (1 commit, force push) del WIP al DEV net',
        slug: 'dev-publish-script',
        categoryId: 'git',
        status: 'done',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        notes: ''
      },
      {
        id: 'seed-localhost-favicon',
        title: 'Local dev: favicon vermell només a localhost',
        slug: 'localhost-favicon',
        categoryId: 'ui',
        status: 'done',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
        notes: ''
      },
      {
        id: 'seed-decide-fullwide',
        title: 'Decidir si cal portar FullWideSlide (lab) a repo 4 o mantenir-ho només a DEV/LAB',
        slug: 'decide-fullwide',
        categoryId: 'git',
        status: 'pending',
        createdAt: Date.now(),
        notes: ''
      },
      {
        id: 'seed-doc-dev-flow',
        title: 'Documentar el flux dev→snapshot→deploy (mini guia)',
        slug: 'doc-dev-flow',
        categoryId: 'ui',
        status: 'pending',
        createdAt: Date.now(),
        notes: ''
      }
    ],
    lastActiveTaskId: null
  };
}

function badgeForStatus(status) {
  if (status === 'in_progress') return { label: 'En curs', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (status === 'done') return { label: 'Fet', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  return { label: 'Pendent', cls: 'bg-gray-50 text-gray-700 border-gray-200' };
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

export default function UnitatsCanviPage() {
  const [state, setState] = useState(() => defaultState());
  const [activeCategory, setActiveCategory] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  const [newTaskCat, setNewTaskCat] = useState('git');
  const [newTaskName, setNewTaskName] = useState('');
  const [copyStatus, setCopyStatus] = useState({ key: '', ok: false });

  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setState({ ...defaultState(), ...loaded });
    }
  }, []);

  useEffect(() => {
    try {
      saveState(state);
    } catch {
      // ignore
    }
  }, [state]);

  const categoriesById = useMemo(() => {
    const m = new Map();
    for (const c of state.categories || []) m.set(c.id, c);
    return m;
  }, [state.categories]);

  const tasksFiltered = useMemo(() => {
    const list = Array.isArray(state.tasks) ? state.tasks : [];
    if (activeCategory === 'all') return list;
    if (activeCategory === 'active') return list.filter((t) => t.status === 'in_progress');
    return list.filter((t) => t.categoryId === activeCategory);
  }, [state.tasks, activeCategory]);

  const activeTask = useMemo(() => {
    const list = Array.isArray(state.tasks) ? state.tasks : [];
    const id = state.lastActiveTaskId;
    return id ? list.find((t) => t.id === id) || null : null;
  }, [state.tasks, state.lastActiveTaskId]);

  const createCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    const id = slugify(name);
    if (!id) return;
    if ((state.categories || []).some((c) => c.id === id)) return;
    setState((s) => ({
      ...s,
      categories: [...(s.categories || []), { id, name, slug: id }]
    }));
    setNewCategory('');
  };

  const deleteCategory = (id) => {
    if (!id) return;
    if (['git', 'calibratge', 'mockups', 'ui', 'api', 'infra', 'assets'].includes(id)) return;
    setState((s) => {
      const nextCategories = (s.categories || []).filter((c) => c.id !== id);
      const nextTasks = (s.tasks || []).map((t) => (t.categoryId === id ? { ...t, categoryId: 'git' } : t));
      return { ...s, categories: nextCategories, tasks: nextTasks };
    });
  };

  const createTask = () => {
    const name = newTaskName.trim();
    const cat = newTaskCat;
    if (!name) return;
    if (!cat) return;
    const id = uid();
    setState((s) => ({
      ...s,
      tasks: [
        {
          id,
          title: name,
          slug: slugify(name),
          categoryId: cat,
          status: 'pending',
          createdAt: Date.now(),
          notes: ''
        },
        ...(s.tasks || [])
      ]
    }));
    setNewTaskName('');
  };

  const deleteTask = (id) => {
    setState((s) => ({
      ...s,
      tasks: (s.tasks || []).filter((t) => t.id !== id),
      lastActiveTaskId: s.lastActiveTaskId === id ? null : s.lastActiveTaskId
    }));
  };

  const setTaskStatus = (id, status) => {
    setState((s) => {
      const next = (s.tasks || []).map((t) => (t.id === id ? { ...t, status } : t));
      const lastActiveTaskId = status === 'in_progress' ? id : (s.lastActiveTaskId === id ? null : s.lastActiveTaskId);
      return { ...s, tasks: next, lastActiveTaskId };
    });
  };

  const setTaskNotes = (id, notes) => {
    setState((s) => ({
      ...s,
      tasks: (s.tasks || []).map((t) => (t.id === id ? { ...t, notes } : t))
    }));
  };

  const cmdFor = (t) => {
    const cat = categoriesById.get(t.categoryId)?.slug || t.categoryId || 'task';
    const name = t.slug || slugify(t.title);
    return {
      status: 'npm run task:status',
      start: `npm run task:start -- --cat ${cat} --name ${name}`,
      finish: `npm run task:finish -- --msg "${t.title}" --push`
    };
  };

  const copyCmd = async (key, text) => {
    const ok = await copyToClipboard(text);
    setCopyStatus({ key, ok });
    window.setTimeout(() => setCopyStatus({ key: '', ok: false }), 1200);
  };

  return (
    <>
      <SEO title="Unitats de Canvi" description="Gestió d'unitats de canvi i consolidació de feina" />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Unitats de Canvi</h2>
              <p className="text-sm text-gray-600">Crea categories i unitats. Una unitat = una branca + commits coherents.</p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
                <span className="text-xs text-gray-500">{(state.categories || []).length}</span>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`text-left px-3 py-2 rounded-lg border transition ${activeCategory === 'all' ? 'bg-white border-gray-300' : 'bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200'}`}
                >
                  <div className="text-sm font-medium text-gray-900">Totes</div>
                  <div className="text-xs text-gray-500">{(state.tasks || []).length} unitats</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('active')}
                  className={`text-left px-3 py-2 rounded-lg border transition ${activeCategory === 'active' ? 'bg-white border-gray-300' : 'bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200'}`}
                >
                  <div className="text-sm font-medium text-gray-900">En curs</div>
                  <div className="text-xs text-gray-500">{(state.tasks || []).filter((t) => t.status === 'in_progress').length} unitats</div>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {(state.categories || []).map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCategory(c.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg border transition ${activeCategory === c.id ? 'bg-white border-gray-300' : 'bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200'}`}
                    >
                      <div className="text-sm font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{(state.tasks || []).filter((t) => t.categoryId === c.id).length} unitats</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(c.id)}
                      className={`p-2 rounded-lg border ${['git','calibratge','mockups','ui','api','infra','assets'].includes(c.id) ? 'opacity-30 cursor-not-allowed bg-white border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                      disabled={['git','calibratge','mockups','ui','api','infra','assets'].includes(c.id)}
                      aria-label="Esborrar categoria"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                    placeholder="Nova categoria (ex: netlify)"
                  />
                  <button
                    type="button"
                    onClick={createCategory}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    Afegir
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Crear unitat</h3>
              <div className="flex flex-col gap-2">
                <select
                  value={newTaskCat}
                  onChange={(e) => setNewTaskCat(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                >
                  {(state.categories || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                  placeholder="Nom unitat (ex: Unificar git)"
                />
                <button
                  type="button"
                  onClick={createTask}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  Crear
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">Unitats</h3>
                <div className="text-xs text-gray-500">{tasksFiltered.length}</div>
              </div>

              {tasksFiltered.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No hi ha unitats en aquest filtre.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {tasksFiltered.map((t) => {
                    const catName = categoriesById.get(t.categoryId)?.name || t.categoryId;
                    const badge = badgeForStatus(t.status);
                    const cmds = cmdFor(t);
                    return (
                      <div key={t.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-sm font-semibold text-gray-900 break-words">{t.title}</div>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">{catName}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                              {[
                                { key: 'status', label: 'Status', value: cmds.status },
                                { key: 'start', label: 'Start', value: cmds.start },
                                { key: 'finish', label: 'Finish', value: cmds.finish }
                              ].map((c) => (
                                <div key={c.key} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-[11px] font-semibold text-gray-700">{c.label}</div>
                                    <button
                                      type="button"
                                      onClick={() => copyCmd(`${t.id}:${c.key}`, c.value)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-[11px]"
                                    >
                                      <Copy className="w-3 h-3" />
                                      {copyStatus.key === `${t.id}:${c.key}` ? (copyStatus.ok ? 'Copiat' : 'Error') : 'Copiar'}
                                    </button>
                                  </div>
                                  <div className="mt-1 font-mono text-[11px] text-gray-800 break-all">{c.value}</div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3">
                              <textarea
                                value={t.notes || ''}
                                onChange={(e) => setTaskNotes(t.id, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                                rows={2}
                                placeholder="Notes (opcional)"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => setTaskStatus(t.id, 'pending')}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${t.status === 'pending' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                            >
                              <Circle className="w-4 h-4" />
                              Pendent
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskStatus(t.id, 'in_progress')}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${t.status === 'in_progress' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                            >
                              <Play className="w-4 h-4" />
                              En curs
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskStatus(t.id, 'done')}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${t.status === 'done' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Fet
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(t.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm"
                            >
                              <Trash2 className="w-4 h-4 text-gray-700" />
                              Esborrar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Unitat activa</h3>
              {activeTask ? (
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">{activeTask.title}</div>
                  <div className="mt-1 text-xs text-gray-600">{cmdFor(activeTask).start}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">No n'hi ha cap en curs.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
