import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlantIcon, PLANT_TINTS, type PlantType } from '@/components/PlantIcon'

export const metadata = { title: 'Design System — PlantCare' }

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-brand-bg px-5 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-12">

        <div>
          <h1 className="font-heading text-[28px] font-normal leading-none tracking-tight text-brand-fg">
            Design System
          </h1>
          <p className="mt-2 text-[13px] text-brand-fg-sub">
            PlantCare visual primitives — buttons, typography, spacing, and more.
          </p>
        </div>

        {/* ── BUTTONS ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionLabel>Buttons</SectionLabel>

          <Group label="Primary">
            <Button variant="default">Save changes</Button>
            <Button variant="default" disabled>Disabled</Button>
          </Group>

          <Group label="Secondary / Ghost">
            <Button variant="secondary">Cancel</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="link">Link</Button>
          </Group>

          <Group label="Danger">
            <Button variant="destructive">Delete plant</Button>
            <Button variant="destructive-solid">Confirm delete</Button>
          </Group>

          <Group label="Icon buttons (44 × 44 tap target)">
            <Button variant="ghost" size="icon" aria-label="Edit">
              <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M9 2L11 4L5 10L2 11L3 8L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Share">
              <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <circle cx="10" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="10" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4 5.8L8.6 3.2M4 7.2L8.6 9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </Button>
            <Button variant="destructive" size="icon" aria-label="Delete">
              <svg width="16" height="16" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2 3.5H11M4.5 3.5V2.5C4.5 2 5 1.5 5.5 1.5H7.5C8 1.5 8.5 2 8.5 2.5V3.5M5 5.5V10M8 5.5V10M3 3.5L3.5 11H9.5L10 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </Group>

          <Group label="Compact (sm)">
            <Button variant="default" size="sm">Save</Button>
            <Button variant="secondary" size="sm">Cancel</Button>
            <Button variant="destructive" size="sm">Delete</Button>
          </Group>
        </section>

        {/* ── BADGES & CHIPS ───────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionLabel>Badges &amp; Chips</SectionLabel>

          <Group label="Status — compact pill (uppercase)">
            <Badge variant="overdue">−2d</Badge>
            <Badge variant="due-today">Today</Badge>
            <Badge variant="ok">5d left</Badge>
          </Group>

          <Group label="Status — verbose pill">
            <Badge variant="overdue-verbose">2 days overdue</Badge>
            <Badge variant="due-today-verbose">due today</Badge>
          </Group>

          <Group label="Section dividers">
            <div className="flex w-full flex-col gap-3">
              {/* Overdue divider */}
              <div className="flex items-center gap-[10px]">
                <div className="h-px flex-1 bg-brand-alert/20" />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-alert">
                  Overdue
                </span>
                <div className="h-px flex-1 bg-brand-alert/20" />
              </div>
              {/* Due today divider */}
              <div className="flex items-center gap-[10px]">
                <div className="h-px flex-1 bg-brand-amber/[0.15]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-amber">
                  Due today
                </span>
                <div className="h-px flex-1 bg-brand-amber/[0.15]" />
              </div>
            </div>
          </Group>
        </section>

        {/* ── COLORS ───────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Colors</SectionLabel>

          <ColorGroup label="Backgrounds">
            <Swatch bg="bg-brand-bg" token="bg" hex="#191c15" border textDark={false} />
            <Swatch bg="bg-brand-surface" token="surface" hex="#222820" textDark={false} />
            <Swatch bg="bg-brand-surface2" token="surface-2" hex="#2b3026" textDark={false} />
          </ColorGroup>

          <ColorGroup label="Foregrounds">
            <Swatch bg="bg-brand-fg" token="fg" hex="#e5e9de" textDark />
            <Swatch bg="bg-brand-fg-sub" token="fg-sub" hex="#9ba090" textDark />
            <Swatch bg="bg-brand-fg-dim" token="fg-dim" hex="#8e9489" textDark />
          </ColorGroup>

          <ColorGroup label="Actions">
            <Swatch bg="bg-brand-cta" token="cta" hex="#CFEE9E" textDark />
            <Swatch bg="bg-brand-alert" token="alert" hex="#e05555" textDark={false} />
            <Swatch bg="bg-brand-amber" token="amber" hex="#E8C86A" textDark />
          </ColorGroup>
        </section>

        {/* ── ICONS ────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionLabel>Plant icons</SectionLabel>

          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">Original types</p>
            <IconGrid types={ICON_ORIGINALS} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">New leaf types</p>
            <IconGrid types={ICON_NEW_TYPES} />
          </div>
        </section>

        {/* ── NAVIGATION ───────────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionLabel>Navigation</SectionLabel>

          {/* Bottom tab bar */}
          <Group label="Bottom tab bar">
            <div className="w-full max-w-[390px] overflow-hidden rounded-[14px] border-t border-white/[0.07] bg-brand-bg">
              <div className="flex">
                {[
                  {
                    label: 'Today', active: true,
                    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="4" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.5"/><line x1="3" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1.5"/><line x1="7.5" y1="2" x2="7.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="14.5" y1="2" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  },
                  {
                    label: 'Plants', active: false,
                    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="12" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="12" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
                  },
                  {
                    label: 'Add', active: false,
                    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><line x1="11" y1="7" x2="11" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  },
                  {
                    label: 'Sign out', active: false,
                    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M8 11H18M18 11L15 8M18 11L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 7V5C13 4 12 3 11 3H5C4 3 3 4 3 5V17C3 18 4 19 5 19H11C12 19 13 18 13 17V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                  },
                ].map(({ label, active, icon }) => (
                  <div
                    key={label}
                    className={`-mt-px flex flex-1 flex-col items-center gap-1 border-t-2 pb-2 pt-[10px] ${active ? 'border-brand-cta text-brand-cta' : 'border-transparent text-brand-fg-dim'}`}
                  >
                    {icon}
                    <span className="text-[10px] font-medium tracking-[0.02em]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Group>

          {/* Garden header row */}
          <Group label="Garden header row">
            <div className="flex w-full max-w-[390px] items-center gap-2">
              {/* Garden picker */}
              <button className="flex h-[44px] items-center gap-1.5 rounded-[12px] border border-white/10 bg-white/[0.06] px-[14px] text-[13px] font-medium text-brand-fg-sub">
                <span className="size-1.5 shrink-0 rounded-full bg-brand-cta" />
                Living Room
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-45">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* Icon buttons */}
              <div className="ml-auto flex gap-2">
                <button className="flex size-[44px] items-center justify-center rounded-[12px] border border-white/[0.09] bg-white/[0.04] text-brand-fg-sub">
                  <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L5 10L2 11L3 8L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="flex size-[44px] items-center justify-center rounded-[12px] border border-white/[0.09] bg-white/[0.04] text-brand-fg-sub">
                  <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><circle cx="10" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 5.8L8.6 3.2M4 7.2L8.6 9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </button>
                <button className="flex size-[44px] items-center justify-center rounded-[12px] border border-white/[0.09] bg-white/[0.04] text-brand-alert">
                  <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><path d="M2 3.5H11M4.5 3.5V2.5C4.5 2 5 1.5 5.5 1.5H7.5C8 1.5 8.5 2 8.5 2.5V3.5M5 5.5V10M8 5.5V10M3 3.5L3.5 11H9.5L10 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </Group>
        </section>

        {/* ── ELEVATION ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Elevation</SectionLabel>

          {/* Darker wrapper so Level 0 (app-bg) is visible against the shell */}
          <div className="flex gap-3 rounded-[16px] p-4" style={{ background: '#0d0f0b' }}>

            {/* Left — depth levels */}
            <div className="flex flex-1 flex-col gap-3">
              {[
                {
                  label: 'Level 0 — App shell',
                  cls: 'bg-brand-bg border border-white/[0.06]',
                  shadow: undefined,
                  meta: '#191c15 · --color-bg',
                },
                {
                  label: 'Level 1 — Cards',
                  cls: 'bg-brand-surface border border-white/[0.07]',
                  shadow: '0 2px 12px rgba(0,0,0,0.2)',
                  meta: '#222820 · --color-surface · shadow-card',
                },
                {
                  label: 'Level 2 — Popovers',
                  cls: 'bg-brand-surface2 border border-white/[0.07]',
                  shadow: '0 12px 40px rgba(0,0,0,0.5)',
                  meta: '#2b3026 · --color-surface-2 · shadow-popover',
                },
              ].map(({ label, cls, shadow, meta }) => (
                <div key={label}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">{label}</p>
                  <div
                    className={`rounded-[14px] p-4 ${cls}`}
                    style={shadow ? { boxShadow: shadow } : undefined}
                  >
                    <p className="text-[11px] text-brand-fg-dim">{meta}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — shadow catalogue */}
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">Shadows</p>
              {[
                { label: 'card · resting', shadow: '0 2px 12px rgba(0,0,0,0.2)'         },
                { label: 'card · hover',   shadow: '0 6px 24px rgba(0,0,0,0.3)'          },
                { label: 'cta glow',       shadow: '0 4px 20px rgba(207,238,158,0.2)'    },
                { label: 'alert glow',     shadow: '0 2px 12px rgba(224,85,85,0.3)'      },
              ].map(({ label, shadow }) => (
                <div
                  key={label}
                  className="rounded-[12px] bg-brand-surface p-3"
                  style={{ boxShadow: shadow }}
                >
                  <p className="text-[10px] text-brand-fg-dim">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── SPACING & RADIUS ─────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionLabel>Spacing &amp; Radius</SectionLabel>

          {/* Border radius scale */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">Border radius scale</p>
            <div className="flex flex-wrap items-end gap-2">
              {[
                { name: 'sm',   px: '8px',   w: 48, h: 48  },
                { name: 'md',   px: '12px',  w: 56, h: 56  },
                { name: 'lg',   px: '14px',  w: 64, h: 64  },
                { name: 'xl',   px: '16px',  w: 72, h: 72  },
                { name: '2xl',  px: '22px',  w: 80, h: 80  },
                { name: 'pill', px: '100px', w: 64, h: 28  },
              ].map(({ name, px, w, h }) => (
                <div
                  key={name}
                  className="flex flex-col items-center justify-end gap-1 border border-white/[0.08] bg-brand-surface p-2"
                  style={{ width: w, height: h, borderRadius: px }}
                >
                  <p className="text-center text-[10px] text-brand-fg-dim">{name}</p>
                  <p className="text-center" style={{ fontSize: 9, color: '#5a6054' }}>{px}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spacing scale */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">Spacing scale</p>
            <div className="flex flex-col gap-[5px]">
              {[
                { px: '4px',  w: 4,  label: 'space-1 · micro gap'         },
                { px: '8px',  w: 8,  label: 'space-2 · component gap'      },
                { px: '12px', w: 12, label: 'space-3 · card gap'           },
                { px: '16px', w: 16, label: 'space-4 · card padding'       },
                { px: '20px', w: 20, label: 'space-5 · page padding'       },
                { px: '44px', w: 44, label: 'tap-min · interactive targets', tapLabel: 'min tap' },
              ].map(({ px, w, label, tapLabel }) => (
                <div key={px} className="flex items-center gap-[10px]">
                  <span className="w-[40px] shrink-0" style={{ fontSize: 9, color: '#5a6054' }}>{px}</span>
                  <div
                    className="flex h-5 shrink-0 items-center justify-center rounded-[4px] border border-brand-cta/[27%] bg-brand-cta/[13%]"
                    style={{ width: w }}
                  >
                    {tapLabel && <span className="text-[9px] font-semibold text-brand-cta">{tapLabel}</span>}
                  </div>
                  <span className="text-[10px] text-brand-fg-dim">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COLOR SEMANTICS ──────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Color semantics</SectionLabel>

          {/* Plant-type tints */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-brand-fg-dim">Plant-type tints</p>
            <div className="flex gap-2">
              {[
                { hex: '#CFEE9E', name: 'Monstera', type: 'monstera' },
                { hex: '#E5D08A', name: 'Cactus',   type: 'cactus'   },
                { hex: '#F0B8C4', name: 'Succulent', type: 'succulent'},
                { hex: '#A4E89A', name: 'Herb',      type: 'herb'     },
                { hex: '#B0D8C0', name: 'Vine',      type: 'vine'     },
              ].map(({ hex, name, type }) => (
                <div key={name} className="flex-1 overflow-hidden rounded-[12px]">
                  <div
                    className="flex h-[44px] items-center justify-center"
                    style={{ background: `${hex}22` }}
                  >
                    <PlantIcon type={type as Parameters<typeof PlantIcon>[0]['type']} color={hex} size={28} />
                  </div>
                  <div className="bg-brand-surface px-2 py-[5px]">
                    <b className="block text-[11px] font-medium text-brand-fg">{hex}</b>
                    <p className="text-[10px] text-brand-fg-dim">{name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert tints */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-brand-fg-dim">Alert tints</p>
            <div className="flex gap-2">
              <div className="flex h-14 flex-1 items-end rounded-[10px] border border-brand-alert/25 bg-brand-alert/10 px-2 pb-1.5">
                <span className="text-[10px] font-medium leading-tight text-brand-alert/90">
                  alert-bg<br />overdue surface
                </span>
              </div>
              <div className="flex h-14 flex-1 items-end rounded-[10px] border border-brand-amber/20 bg-brand-amber/[12%] px-2 pb-1.5">
                <span className="text-[10px] font-medium leading-tight text-brand-amber/90">
                  amber-bg<br />due-today surface
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TYPOGRAPHY ───────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Typography</SectionLabel>

          <div className="flex flex-col">
            <TypeRow role="Screen title" spec="Fraunces 28 / 400">
              <p className="font-heading text-[28px] leading-none tracking-[-0.025em] text-brand-fg" style={{ fontWeight: 400 }}>
                Today
              </p>
            </TypeRow>

            <TypeRow role="Plant name lg" spec="Fraunces 20 / 400">
              <p className="font-heading text-[20px] leading-none tracking-[-0.02em] text-brand-fg" style={{ fontWeight: 400 }}>
                Monstera
              </p>
            </TypeRow>

            <TypeRow role="Plant name" spec="Fraunces 16 / 400">
              <p className="font-heading text-[16px] leading-snug tracking-[-0.015em] text-brand-fg" style={{ fontWeight: 400 }}>
                Echeveria
              </p>
            </TypeRow>

            <TypeRow role="Body" spec="Jakarta Sans 14 / 400">
              <p className="text-[14px] leading-normal text-brand-fg">
                Water every 7 days · Feed every 14 days
              </p>
            </TypeRow>

            <TypeRow role="Body sm" spec="Jakarta Sans 13 / 400">
              <p className="text-[13px] leading-normal text-brand-fg-sub">
                Needs watering · 2 days overdue
              </p>
            </TypeRow>

            <TypeRow role="Button" spec="Jakarta Sans 14 / 700">
              <span className="inline-flex items-center rounded-[14px] bg-brand-cta px-5 py-2.5 text-[14px] font-bold leading-none text-brand-cta-fg">
                Save changes
              </span>
            </TypeRow>

            <TypeRow role="Label" spec="Jakarta Sans 12 / 500">
              <p className="text-[12px] font-medium tracking-[0.04em] text-brand-fg-sub">
                Plant name
              </p>
            </TypeRow>

            <TypeRow role="Section cap" spec="Jakarta Sans 10 / 700">
              <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-brand-alert">
                Overdue
              </p>
            </TypeRow>

            <TypeRow role="Micro" spec="Jakarta Sans 11 / 400">
              <p className="text-[11px] text-brand-fg-dim">
                W·7d &nbsp; F·14d
              </p>
            </TypeRow>
          </div>
        </section>

        {/* ── CARDS ────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <SectionLabel>Cards</SectionLabel>

          {/* Plant cards — grid */}
          <Group label="Plant card — grid">
            <div className="flex flex-wrap gap-3">

              {/* Overdue state */}
              <div className="relative w-[160px] overflow-hidden rounded-[22px] bg-brand-surface shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
                style={{ border: '1px solid rgba(224,85,85,0.22)' }}>
                <div className="grain-overlay" />
                <div className="relative flex h-[100px] items-center justify-center"
                  style={{ background: 'rgba(207,238,158,0.094)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="absolute size-[68px] rounded-full" style={{ background: 'rgba(207,238,158,0.071)' }} />
                  <PlantIcon type="monstera" color="#CFEE9E" size={50} />
                  <div className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand-alert"
                    style={{ boxShadow: '0 0 0 3px #222820' }} />
                </div>
                <div className="px-3 pb-[13px] pt-[10px]">
                  <p className="font-heading text-base leading-tight text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.015em' }}>
                    Monstera
                  </p>
                  <p className="mt-1.5 text-[11px] text-brand-fg-dim">W·7d &nbsp; F·14d</p>
                  <div className="mt-2">
                    <Badge variant="overdue-verbose">2d overdue</Badge>
                  </div>
                </div>
              </div>

              {/* OK state */}
              <div className="relative w-[160px] overflow-hidden rounded-[22px] bg-brand-surface shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grain-overlay" />
                <div className="relative flex h-[100px] items-center justify-center"
                  style={{ background: 'rgba(176,216,192,0.094)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="absolute size-[68px] rounded-full" style={{ background: 'rgba(176,216,192,0.071)' }} />
                  <PlantIcon type="vine" color="#B0D8C0" size={50} />
                </div>
                <div className="px-3 pb-[13px] pt-[10px]">
                  <p className="font-heading text-base leading-tight text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.015em' }}>
                    Pothos
                  </p>
                  <p className="mt-1.5 text-[11px] text-brand-fg-dim">W·10d &nbsp; F·21d</p>
                  <div className="mt-2">
                    <span className="text-[11px] text-brand-fg-dim">4d until next</span>
                  </div>
                </div>
              </div>

            </div>
          </Group>

          {/* Due cards */}
          <Group label="Due card — overdue">
            <div className="w-full max-w-sm">
              <div className="relative overflow-hidden rounded-[22px] bg-brand-surface shadow-[0_4px_24px_rgba(224,85,85,0.08)]"
                style={{ border: '1px solid rgba(224,85,85,0.22)' }}>
                <div className="grain-overlay" />
                <div className="flex items-center gap-3 px-4 py-3.5"
                  style={{ background: 'rgba(224,85,85,0.08)', borderBottom: '1px solid rgba(224,85,85,0.12)' }}>
                  <div className="flex size-[50px] flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(224,85,85,0.13)' }}>
                    <PlantIcon type="monstera" color="#dd8888" size={30} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-xl leading-none text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>
                      Monstera
                    </p>
                    <p className="mt-1 text-xs text-brand-fg-sub">Needs watering</p>
                  </div>
                  <Badge variant="overdue" className="flex-shrink-0">−2d</Badge>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-brand-fg-dim">Every 7 days</span>
                  <Button variant="destructive-solid" size="sm">Water now</Button>
                </div>
              </div>
            </div>
          </Group>

          <Group label="Due card — today">
            <div className="w-full max-w-sm">
              <div className="relative overflow-hidden rounded-[22px] bg-brand-surface shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grain-overlay" />
                <div className="flex items-center gap-3 px-4 py-3.5"
                  style={{ background: 'rgba(164,232,154,0.075)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex size-[50px] flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(164,232,154,0.118)' }}>
                    <PlantIcon type="herb" color="#A4E89A" size={30} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-xl leading-none text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>
                      Basil
                    </p>
                    <p className="mt-1 text-xs text-brand-fg-sub">Needs feeding</p>
                  </div>
                  <Badge variant="due-today" className="flex-shrink-0">Today</Badge>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-brand-fg-dim">Every 10 days</span>
                  <Button variant="default" size="sm">Feed now</Button>
                </div>
              </div>
            </div>
          </Group>

        </section>

      </div>
    </div>
  )
}

// ── Icon section data ──────────────────────────────────────────────────────
const ICON_ORIGINALS: PlantType[] = ['monstera', 'cactus', 'succulent', 'herb', 'vine']
const ICON_NEW_TYPES: PlantType[] = ['palm', 'banana', 'vegetable', 'olive', 'fern', 'strelitzia', 'orchid', 'aloe', 'bamboo', 'lavender', 'spider', 'flower']
const ICON_LABELS: Record<PlantType, string> = {
  monstera: 'Monstera',     cactus: 'Cactus',       succulent: 'Succulent',
  herb: 'Herb',             vine: 'Vine / Pothos',  palm: 'Palm',
  banana: 'Banana Plant',   vegetable: 'Vegetable', olive: 'Olive Branch',
  fern: 'Fern',             strelitzia: 'Strelitzia', orchid: 'Orchid',
  aloe: 'Aloe',             bamboo: 'Bamboo',       lavender: 'Lavender',
  spider: 'Spider Plant',   flower: 'Flower',
}

function IconGrid({ types }: { types: PlantType[] }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
      {types.map(type => {
        const hex = PLANT_TINTS[type]
        return (
          <div key={type} className="flex flex-col items-center gap-4 rounded-[14px] border border-white/[0.07] bg-brand-surface px-4 pb-[18px] pt-6 transition-colors hover:border-white/[0.14]">
            <div className="flex items-center gap-3">
              <PlantIcon type={type} color={hex} size={56} />
              <PlantIcon type={type} color={hex} size={32} />
              <PlantIcon type={type} color={hex} size={20} />
            </div>
            <div className="text-center">
              <p className="font-mono text-[11px]" style={{ color: `${hex}CC` }}>&apos;{type}&apos;</p>
              <p className="mt-1 text-[12px] font-medium text-brand-fg">{ICON_LABELS[type]}</p>
              <p className="mt-0.5 font-mono text-[10px] text-brand-fg-dim">{hex}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-white/[0.07] pb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-brand-fg-dim">
      {children}
    </h2>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  )
}

function ColorGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-brand-fg-dim">{label}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

function Swatch({ bg, token, hex, textDark, border }: {
  bg: string
  token: string
  hex: string
  textDark: boolean
  border?: boolean
}) {
  return (
    <div className={`relative flex flex-1 items-end rounded-[10px] px-2 pb-1.5 pt-0 h-14 ${bg} ${border ? 'border border-white/10' : ''}`}>
      <span className={`text-[10px] font-medium leading-tight tracking-[0.02em] ${textDark ? 'text-[#191c15]/70' : 'text-brand-fg/70'}`}>
        {token}<br />{hex}
      </span>
    </div>
  )
}

function TypeRow({ role, spec, children }: { role: string; spec: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-white/[0.06] py-[10px] last:border-0">
      <div className="w-[110px] flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim">{role}</p>
        <p className="mt-0.5 text-[9px]" style={{ color: '#5a6054' }}>{spec}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}
