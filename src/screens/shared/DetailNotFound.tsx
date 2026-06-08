import { ErrorState, SubHead } from '../../components/index.ts'
import { close } from '../../components/icons/icons.tsx'

const Close = close

export interface DetailNotFoundProps {
  title: string
  onBack: () => void
}

export function DetailNotFound({ title, onBack }: DetailNotFoundProps) {
  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title={title} onBack={onBack} />
      <div className="q-body">
        <ErrorState
          icon={<Close size={28} />}
          title={`${title} not found`}
          description="It may have been removed or the link is out of date."
          actionLabel="Go back"
          onAction={onBack}
        />
      </div>
    </div>
  )
}
