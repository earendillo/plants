'use client'

type Props = {
  emoji: string
  name: string
  waterDays: string
  feedDays: string
  onEmojiChange: (v: string) => void
  onNameChange: (v: string) => void
  onWaterDaysChange: (v: string) => void
  onFeedDaysChange: (v: string) => void
  inputClass: string
}

export function PlantFormFields({
  emoji,
  name,
  waterDays,
  feedDays,
  onEmojiChange,
  onNameChange,
  onWaterDaysChange,
  onFeedDaysChange,
  inputClass,
}: Props) {
  return (
    <>
      <div>
        <label htmlFor="emoji" className="block text-sm font-medium text-slate-700">
          Emoji
        </label>
        <input
          id="emoji"
          value={emoji}
          onChange={e => onEmojiChange(e.target.value)}
          required
          maxLength={4}
          className="mt-1 w-16 rounded-lg border border-slate-200 px-3 py-3 text-center text-2xl focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Plant name
        </label>
        <input
          id="name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          required
          maxLength={100}
          placeholder="e.g. Monstera"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="waterDays" className="block text-sm font-medium text-slate-700">
          Water every (days)
        </label>
        <input
          id="waterDays"
          type="number"
          value={waterDays}
          onChange={e => onWaterDaysChange(e.target.value)}
          required
          min={1}
          max={365}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="feedDays" className="block text-sm font-medium text-slate-700">
          Feed every (days)
        </label>
        <input
          id="feedDays"
          type="number"
          value={feedDays}
          onChange={e => onFeedDaysChange(e.target.value)}
          required
          min={1}
          max={365}
          className={inputClass}
        />
      </div>
    </>
  )
}
