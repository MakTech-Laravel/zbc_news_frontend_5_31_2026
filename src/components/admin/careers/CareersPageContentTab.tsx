import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { CareersPerkIconField } from '@/components/admin/careers/CareersPerkIconField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePermission } from '@/hooks/usePermission'
import {
  fetchAdminCareersPage,
  updateAdminCareersPage,
  type CareersPageContent,
} from '@/services/admin/careers'
import { PERMISSIONS } from '@/types/permissions'

function emptyPage(): CareersPageContent {
  return {
    hero: {
      badge: '',
      headline: '',
      subheadline: '',
      primary_cta: '',
      secondary_cta: '',
    },
    stats: [],
    perks_section: { eyebrow: '', heading: '' },
    perks: [],
    positions_section: { eyebrow: '', heading: '', search_placeholder: '' },
    hiring_section: { eyebrow: '', heading: '' },
    hiring_steps: [],
    testimonials_section: { eyebrow: '', heading: '' },
    testimonials: [],
    faq_section: { eyebrow: '', heading: '' },
    faqs: [],
    cta: { heading: '', description: '', button: '', button_url: '/contact' },
  }
}

export function CareersPageContentTab() {
  const { can, isSuperAdmin } = usePermission()
  const canUpdate = isSuperAdmin || can(PERMISSIONS.CAREERS_PAGE.UPDATE)
  const [page, setPage] = useState<CareersPageContent>(emptyPage())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        setPage(await fetchAdminCareersPage())
      } catch {
        toast.error('Failed to load careers page content.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function handleSave() {
    if (!canUpdate) return
    setSaving(true)
    try {
      setPage(await updateAdminCareersPage(page))
      toast.success('Careers page content saved.')
    } catch {
      toast.error('Failed to save careers page content.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-admin-label">Loading page content…</p>
  }

  return (
    <div className="space-y-6">
      <Section title="Hero">
        <Field
          label="Badge"
          value={page.hero.badge}
          disabled={!canUpdate}
          onChange={(value) =>
            setPage((p) => ({ ...p, hero: { ...p.hero, badge: value } }))
          }
        />
        <Field
          label="Headline"
          value={page.hero.headline}
          disabled={!canUpdate}
          onChange={(value) =>
            setPage((p) => ({ ...p, hero: { ...p.hero, headline: value } }))
          }
        />
        <TextArea
          label="Subheadline"
          value={page.hero.subheadline}
          disabled={!canUpdate}
          onChange={(value) =>
            setPage((p) => ({ ...p, hero: { ...p.hero, subheadline: value } }))
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Primary CTA"
            value={page.hero.primary_cta}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({ ...p, hero: { ...p.hero, primary_cta: value } }))
            }
          />
          <Field
            label="Secondary CTA"
            value={page.hero.secondary_cta}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                hero: { ...p.hero, secondary_cta: value },
              }))
            }
          />
        </div>
      </Section>

      <Section
        title="Stats"
        action={
          canUpdate && page.stats.length < 8 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => ({
                  ...p,
                  stats: [...p.stats, { value: '', label: '' }],
                }))
              }
            >
              Add stat
            </Button>
          ) : null
        }
      >
        {page.stats.map((stat, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Field
              label="Value"
              value={stat.value}
              disabled={!canUpdate}
              onChange={(value) =>
                setPage((p) => {
                  const stats = [...p.stats]
                  stats[index] = { ...stats[index], value }
                  return { ...p, stats }
                })
              }
            />
            <Field
              label="Label"
              value={stat.label}
              disabled={!canUpdate}
              onChange={(value) =>
                setPage((p) => {
                  const stats = [...p.stats]
                  stats[index] = { ...stats[index], label: value }
                  return { ...p, stats }
                })
              }
            />
            {canUpdate ? (
              <Button
                type="button"
                variant="outline"
                className="self-end"
                onClick={() =>
                  setPage((p) => ({
                    ...p,
                    stats: p.stats.filter((_, i) => i !== index),
                  }))
                }
              >
                Remove
              </Button>
            ) : null}
          </div>
        ))}
      </Section>

      <Section title="Perks section">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={page.perks_section.eyebrow}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                perks_section: { ...p.perks_section, eyebrow: value },
              }))
            }
          />
          <Field
            label="Heading"
            value={page.perks_section.heading}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                perks_section: { ...p.perks_section, heading: value },
              }))
            }
          />
        </div>
        <ListEditor
          title="Perks"
          canEdit={canUpdate}
          max={12}
          items={page.perks}
          onAdd={() =>
            setPage((p) => ({
              ...p,
              perks: [...p.perks, { icon: '', title: '', description: '' }],
            }))
          }
          onRemove={(index) =>
            setPage((p) => ({
              ...p,
              perks: p.perks.filter((_, i) => i !== index),
            }))
          }
          renderItem={(item, index) => (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <span className="mb-1.5 block text-xs font-medium text-admin-label">
                  Icon
                </span>
                <CareersPerkIconField
                  value={item.icon || null}
                  disabled={!canUpdate}
                  alt={`${item.title || 'Perk'} icon`}
                  onChange={(url) =>
                    setPage((p) => {
                      const perks = [...p.perks]
                      perks[index] = {
                        ...perks[index],
                        icon: url || '',
                        emoji: undefined,
                      }
                      return { ...p, perks }
                    })
                  }
                />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <Field
                  label="Title"
                  value={item.title}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setPage((p) => {
                      const perks = [...p.perks]
                      perks[index] = { ...perks[index], title: value }
                      return { ...p, perks }
                    })
                  }
                />
                <TextArea
                  label="Description"
                  value={item.description}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setPage((p) => {
                      const perks = [...p.perks]
                      perks[index] = { ...perks[index], description: value }
                      return { ...p, perks }
                    })
                  }
                />
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Positions section labels">
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Eyebrow"
            value={page.positions_section.eyebrow}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                positions_section: { ...p.positions_section, eyebrow: value },
              }))
            }
          />
          <Field
            label="Heading"
            value={page.positions_section.heading}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                positions_section: { ...p.positions_section, heading: value },
              }))
            }
          />
          <Field
            label="Search placeholder"
            value={page.positions_section.search_placeholder}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                positions_section: {
                  ...p.positions_section,
                  search_placeholder: value,
                },
              }))
            }
          />
        </div>
      </Section>

      <Section title="Hiring process">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={page.hiring_section.eyebrow}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                hiring_section: { ...p.hiring_section, eyebrow: value },
              }))
            }
          />
          <Field
            label="Heading"
            value={page.hiring_section.heading}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                hiring_section: { ...p.hiring_section, heading: value },
              }))
            }
          />
        </div>
        <ListEditor
          title="Steps"
          canEdit={canUpdate}
          max={8}
          items={page.hiring_steps}
          onAdd={() =>
            setPage((p) => ({
              ...p,
              hiring_steps: [
                ...p.hiring_steps,
                {
                  number: String(p.hiring_steps.length + 1).padStart(2, '0'),
                  title: '',
                  description: '',
                },
              ],
            }))
          }
          onRemove={(index) =>
            setPage((p) => ({
              ...p,
              hiring_steps: p.hiring_steps.filter((_, i) => i !== index),
            }))
          }
          renderItem={(item, index) => (
            <div className="grid gap-3 md:grid-cols-3">
              <Field
                label="Number"
                value={item.number}
                disabled={!canUpdate}
                onChange={(value) =>
                  setPage((p) => {
                    const hiring_steps = [...p.hiring_steps]
                    hiring_steps[index] = { ...hiring_steps[index], number: value }
                    return { ...p, hiring_steps }
                  })
                }
              />
              <Field
                label="Title"
                value={item.title}
                disabled={!canUpdate}
                onChange={(value) =>
                  setPage((p) => {
                    const hiring_steps = [...p.hiring_steps]
                    hiring_steps[index] = { ...hiring_steps[index], title: value }
                    return { ...p, hiring_steps }
                  })
                }
              />
              <TextArea
                label="Description"
                value={item.description}
                disabled={!canUpdate}
                onChange={(value) =>
                  setPage((p) => {
                    const hiring_steps = [...p.hiring_steps]
                    hiring_steps[index] = {
                      ...hiring_steps[index],
                      description: value,
                    }
                    return { ...p, hiring_steps }
                  })
                }
              />
            </div>
          )}
        />
      </Section>

      <Section title="Testimonials">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={page.testimonials_section.eyebrow}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                testimonials_section: {
                  ...p.testimonials_section,
                  eyebrow: value,
                },
              }))
            }
          />
          <Field
            label="Heading"
            value={page.testimonials_section.heading}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                testimonials_section: {
                  ...p.testimonials_section,
                  heading: value,
                },
              }))
            }
          />
        </div>
        <ListEditor
          title="Items"
          canEdit={canUpdate}
          max={10}
          items={page.testimonials}
          onAdd={() =>
            setPage((p) => ({
              ...p,
              testimonials: [
                ...p.testimonials,
                { quote: '', initials: '', name: '', role: '', rating: 5 },
              ],
            }))
          }
          onRemove={(index) =>
            setPage((p) => ({
              ...p,
              testimonials: p.testimonials.filter((_, i) => i !== index),
            }))
          }
          renderItem={(item, index) => (
            <div className="space-y-3">
              <TextArea
                label="Quote"
                value={item.quote}
                disabled={!canUpdate}
                onChange={(value) =>
                  setPage((p) => {
                    const testimonials = [...p.testimonials]
                    testimonials[index] = { ...testimonials[index], quote: value }
                    return { ...p, testimonials }
                  })
                }
              />
              <div className="grid gap-3 md:grid-cols-4">
                <Field
                  label="Initials"
                  value={item.initials}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setPage((p) => {
                      const testimonials = [...p.testimonials]
                      testimonials[index] = {
                        ...testimonials[index],
                        initials: value,
                      }
                      return { ...p, testimonials }
                    })
                  }
                />
                <Field
                  label="Name"
                  value={item.name}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setPage((p) => {
                      const testimonials = [...p.testimonials]
                      testimonials[index] = { ...testimonials[index], name: value }
                      return { ...p, testimonials }
                    })
                  }
                />
                <Field
                  label="Role"
                  value={item.role}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setPage((p) => {
                      const testimonials = [...p.testimonials]
                      testimonials[index] = { ...testimonials[index], role: value }
                      return { ...p, testimonials }
                    })
                  }
                />
                <Field
                  label="Rating (1-5)"
                  value={String(item.rating)}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setPage((p) => {
                      const testimonials = [...p.testimonials]
                      testimonials[index] = {
                        ...testimonials[index],
                        rating: Math.min(5, Math.max(1, Number(value) || 1)),
                      }
                      return { ...p, testimonials }
                    })
                  }
                />
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="FAQ">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={page.faq_section.eyebrow}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                faq_section: { ...p.faq_section, eyebrow: value },
              }))
            }
          />
          <Field
            label="Heading"
            value={page.faq_section.heading}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({
                ...p,
                faq_section: { ...p.faq_section, heading: value },
              }))
            }
          />
        </div>
        <ListEditor
          title="Questions"
          canEdit={canUpdate}
          max={20}
          items={page.faqs}
          onAdd={() =>
            setPage((p) => ({
              ...p,
              faqs: [...p.faqs, { question: '', answer: '' }],
            }))
          }
          onRemove={(index) =>
            setPage((p) => ({
              ...p,
              faqs: p.faqs.filter((_, i) => i !== index),
            }))
          }
          renderItem={(item, index) => (
            <div className="space-y-3">
              <Field
                label="Question"
                value={item.question}
                disabled={!canUpdate}
                onChange={(value) =>
                  setPage((p) => {
                    const faqs = [...p.faqs]
                    faqs[index] = { ...faqs[index], question: value }
                    return { ...p, faqs }
                  })
                }
              />
              <TextArea
                label="Answer"
                value={item.answer}
                disabled={!canUpdate}
                onChange={(value) =>
                  setPage((p) => {
                    const faqs = [...p.faqs]
                    faqs[index] = { ...faqs[index], answer: value }
                    return { ...p, faqs }
                  })
                }
              />
            </div>
          )}
        />
      </Section>

      <Section title="Bottom CTA">
        <Field
          label="Heading"
          value={page.cta.heading}
          disabled={!canUpdate}
          onChange={(value) =>
            setPage((p) => ({ ...p, cta: { ...p.cta, heading: value } }))
          }
        />
        <TextArea
          label="Description"
          value={page.cta.description}
          disabled={!canUpdate}
          onChange={(value) =>
            setPage((p) => ({ ...p, cta: { ...p.cta, description: value } }))
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Button label"
            value={page.cta.button}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({ ...p, cta: { ...p.cta, button: value } }))
            }
          />
          <Field
            label="Button URL"
            value={page.cta.button_url}
            disabled={!canUpdate}
            onChange={(value) =>
              setPage((p) => ({ ...p, cta: { ...p.cta, button_url: value } }))
            }
          />
        </div>
      </Section>

      {canUpdate ? (
        <div className="sticky bottom-4 flex justify-end">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save page content'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function Section({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-admin-heading">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-admin-label">{label}</span>
      <Input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-admin-label">{label}</span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[88px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm disabled:opacity-60"
      />
    </label>
  )
}

function ListEditor<T>({
  title,
  items,
  max,
  canEdit,
  onAdd,
  onRemove,
  renderItem,
}: {
  title: string
  items: T[]
  max: number
  canEdit: boolean
  onAdd: () => void
  onRemove: (index: number) => void
  renderItem: (item: T, index: number) => React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-admin-heading">{title}</h3>
        {canEdit && items.length < max ? (
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            Add
          </Button>
        ) : null}
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-border p-4"
        >
          {renderItem(item, index)}
          {canEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemove(index)}
            >
              Remove
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
