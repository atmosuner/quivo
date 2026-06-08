import { Button, ErrorState } from '../../components/index.ts'
import { shield } from '../../components/icons/icons.tsx'
import { bootstrapQuivoApp } from '../../stores/bootstrap.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'

const Shield = shield

export interface BootstrapErrorProps {
  message: string
}

export function BootstrapError({ message }: BootstrapErrorProps) {
  const resetFamily = useFamilyStore((state) => state.resetFamily)

  return (
    <div className="q-app">
      <div className="q-scroll">
        <div className="q-body" style={{ paddingTop: 72 }}>
          <ErrorState
            icon={<Shield size={30} />}
            title="Could not load Quivo"
            description={message}
            actionLabel="Try again"
            onAction={() => void bootstrapQuivoApp()}
          />
          <div style={{ maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>
            <Button
              variant="ghost"
              size="md"
              block
              onClick={() => void resetFamily().then(() => bootstrapQuivoApp())}
            >
              Reset to demo data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
