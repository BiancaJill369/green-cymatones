import type { TimeOfDay } from '../../hooks/useTimeOfDay'

// Daylight phases (dawn/day/noon/dusk): butterflies + ladybugs.
// (Night fireflies live in the forest band, rendered by GardenView.)
export default function Creatures({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  if (timeOfDay === 'night') return null

  return (
    <>
      <div className="butterfly bfly-a">
        <div className="wing l" />
        <div className="wing r" />
      </div>
      <div className="butterfly bfly-b">
        <div className="wing l" />
        <div className="wing r" />
      </div>
      <div className="ladybug lb-1">
        <div className="lhead" />
        <div className="lbody" />
      </div>
      <div className="ladybug lb-2">
        <div className="lhead" />
        <div className="lbody" />
      </div>
    </>
  )
}
