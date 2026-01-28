import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Play, ClipboardList } from 'lucide-react';
import SEO from '@/components/SEO';

const STORAGE_KEY = 'hg_unitats_canvi_v1';

 function seedUnitats() {
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
				categoryId: 'infra',
				status: 'done',
				createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14
			},
			{
				id: 'seed-dev-clean-snapshot',
				title: 'DEV net: repo higginsgrafic-ecommerce-dev (snapshot net) amb project-logs + català/estil',
				categoryId: 'git',
				status: 'done',
				createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
			},
			{
				id: 'seed-dev-netlify-dns',
				title: 'DEV Netlify: site comfy-croquembouche + dev.higginsgrafic.com (DNS NETLIFY/NETLIFYv6)',
				categoryId: 'infra',
				status: 'done',
				createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6
			},
			{
				id: 'seed-dev-supabase-google',
				title: 'DEV Auth: Supabase Redirect URLs + login Google a dev.higginsgrafic.com/admin-login',
				categoryId: 'api',
				status: 'done',
				createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5
			},
			{
				id: 'seed-dev-publish-script',
				title: 'Workflow: script per publicar snapshots (1 commit, force push) del WIP al DEV net',
				categoryId: 'git',
				status: 'done',
				createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
			},
			{
				id: 'seed-localhost-favicon',
				title: 'Local dev: favicon vermell només a localhost',
				categoryId: 'ui',
				status: 'done',
				createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
			},
			{
				id: 'seed-decide-fullwide',
				title: 'Decidir si cal portar FullWideSlide (lab) a repo 4 o mantenir-ho només a DEV/LAB',
				categoryId: 'git',
				status: 'pending',
				createdAt: Date.now()
			},
			{
				id: 'seed-doc-dev-flow',
				title: 'Documentar el flux dev→snapshot→deploy (mini guia)',
				categoryId: 'ui',
				status: 'pending',
				createdAt: Date.now()
			}
		],
		lastActiveTaskId: null
	};
 }

function statusIcon(status) {
  if (status === 'done') return CheckCircle2;
  if (status === 'in_progress') return Play;
  return Circle;
}

function statusLabel(status) {
  if (status === 'done') return 'Fet';
  if (status === 'in_progress') return 'En curs';
  return 'Pendent';
}

function loadUnitats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
			const seeded = seedUnitats();
			localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
			return seeded;
		}
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
		if (tasks.length === 0) {
			const seeded = seedUnitats();
			const next = { ...seeded, ...parsed, tasks: seeded.tasks, categories: seeded.categories };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			return next;
		}
    return parsed;
  } catch {
    return null;
  }
}

function Section({ title, items }) {
  return (
    <div className="border-l border-border">
      <div className="pl-3 pr-[28px] text-xs font-semibold text-foreground uppercase tracking-wide">{title}</div>
      <div className="mt-2">
        {items.map((it) => (
          <Link
            key={it.path}
            to={it.path}
            title={it.path}
            className="flex items-start gap-3 pl-3 pr-[28px] py-2 text-sm font-light text-foreground hover:bg-muted/60"
          >
            <span className="min-w-0 flex-1 whitespace-normal break-words text-left">{it.label}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Region({ title, subtitle, children }) {
  return (
    <section>
      <div className="pl-0 pr-[28px]">
        <div className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function AdminStudioHomePage() {
  const [unitatsState, setUnitatsState] = useState({ tasks: [], categories: [] });

  useEffect(() => {
    const loaded = loadUnitats();
    if (loaded) setUnitatsState({ tasks: Array.isArray(loaded.tasks) ? loaded.tasks : [], categories: Array.isArray(loaded.categories) ? loaded.categories : [] });
  }, []);

  const pendingTasks = useMemo(() => {
    const list = Array.isArray(unitatsState.tasks) ? unitatsState.tasks : [];
    return list.filter((t) => t && t.status !== 'done');
  }, [unitatsState.tasks]);

  const tasksByUpdated = useMemo(() => {
    return [...pendingTasks].sort((a, b) => {
      const ta = Number(a?.updatedAt || a?.createdAt || 0);
      const tb = Number(b?.updatedAt || b?.createdAt || 0);
      return tb - ta;
    });
  }, [pendingTasks]);

  const tools = useMemo(() => {
    return {
      content: [
        { label: 'Editor de Textos', path: '/admin/index' },
        { label: 'Textos de Sistema', path: '/admin/system-messages' },
      ],
      templates: [
        { label: 'Plantilla catàleg components', path: '/plantilla-cataleg-components' },
      ],
      storefront: [
        { label: 'Promocions', path: '/admin/promotions' },
        { label: 'Hero', path: '/admin/hero' },
        { label: 'Col·leccions', path: '/admin/collections' },
      ],
      assets: [
        { label: 'Media', path: '/admin/media' },
        { label: 'Mockups', path: '/admin/mockups' },
        { label: 'Upload', path: '/admin/upload' },
      ],
      commerce: [
        { label: 'Fulfillment', path: '/admin/fulfillment' },
        { label: 'Fulfillment Settings', path: '/admin/fulfillment-settings' },
      ],
      gelato: [
        { label: 'Gelato Sync', path: '/admin/gelato-sync' },
        { label: 'Gelato Blank', path: '/admin/gelato-blank' },
        { label: 'Gelato Templates', path: '/admin/gelato-templates' },
        { label: 'Products Overview', path: '/admin/products-overview' },
      ],
      utils: [
        { label: 'Demos', path: '/admin/demos' },
        { label: <><div>EC Config</div><div className="text-[13px] leading-tight">(En Construcció)</div></>, path: '/admin/ec-config' },
      ],
      dev: [
        { label: 'Dev Links', path: '/dev-links' },
        { label: 'Adidas Stripe Zoom', path: '/adidas-stripe-zoom-dev' },
        { label: 'Adidas Demo', path: '/adidas-demo' },
        { label: 'Nike Hero Demo', path: '/nike-hero-demo' },
      ],
      wip: [
        { label: 'FullWideSlide', path: '/full-wide-slide' },
        { label: 'Fulfillment settings', path: '/admin/draft/fulfillment-settings' },
        { label: 'Mockup settings', path: '/admin/draft/mockup-settings' },
        { label: 'Ruleta', path: '/admin/draft/ruleta' },
      ],
    };
  }, []);

  return (
    <>
      <SEO
        title="Administració"
        description="Panell d'administració i gestió de contingut"
      />

      <div className="mx-auto max-w-[2000px] px-4 pt-16 pb-6 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-8">
          <div className="lg:col-span-3 bg-muted/60">
            <Region title="Control de Projecte" subtitle="Unitats de canvi pendents (to-do)">
              <div className="border-l border-border">
                <div className="pl-3 pr-[28px]">
                  <Link
                    to="/admin/unitats"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Obrir Unitats de Canvi
                  </Link>
                </div>

                <div className="mt-4">
                  {tasksByUpdated.length === 0 ? (
                    <div className="pl-3 pr-[28px] py-3 text-sm text-muted-foreground">No hi ha cap unitat pendent.</div>
                  ) : (
                    tasksByUpdated.slice(0, 12).map((t) => {
                      const Icon = statusIcon(t.status);
                      const when = t?.updatedAt || t?.createdAt ? new Date(Number(t.updatedAt || t.createdAt)).toLocaleDateString() : '';
                      return (
                        <div key={t.id} className="flex items-start gap-3 pl-3 pr-[28px] py-2">
                          <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground">{t.title}</div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                              {statusLabel(t.status)}{when ? ` · ${when}` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Region>
          </div>

          <div className="lg:col-span-2">
            <Region title="Operació" subtitle="Fulfillment · Gelato · Integracions">
              <div className="grid grid-cols-1 gap-8">
                <Section title="Comandes" items={tools.commerce} />
                <Section title="Gelato" items={tools.gelato} />
              </div>
            </Region>
          </div>

          <div className="lg:col-span-1">
            <Region title="Storefront" subtitle="El que veu el client">
              <Section title="Edició" items={tools.storefront} />
              <div className="mt-8">
                <Section title="Contingut" items={tools.content} />
              </div>
            </Region>
          </div>

          <div className="lg:col-span-1">
            <Region title="Catàleg" subtitle="Assets i estructura">
              <Section title="Assets" items={tools.assets} />
              <div className="mt-8">
                <Section
                  title={(
                    <Link to="/admin/plantilles" className="hover:underline">
                      Plantilles
                    </Link>
                  )}
                  items={tools.templates}
                />
              </div>
            </Region>
          </div>

          <div className="lg:col-span-1">
            <Region title="Utilitats" subtitle="Debug i suport">
              <Section title="Tools" items={tools.utils} />
              <div className="mt-10">
                <Section title="Demos" items={tools.dev} />
              </div>

              <div className="mt-10">
                <Section
                  title={(
                    <Link to="/admin/wip" className="hover:underline">
                      WIP
                    </Link>
                  )}
                  items={tools.wip}
                />
              </div>
            </Region>
          </div>
        </div>
      </div>
    </>
  );
}
