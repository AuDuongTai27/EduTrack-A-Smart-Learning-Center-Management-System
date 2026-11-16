/** Shared EduTrack tree / graduation cap / open-book mark. Text is supplied by its host. */
export function BrandIcon({ size = 36, monochrome = false }: { size?: number; monochrome?: boolean }) {
  return <img className="et-brand-icon" src={`${import.meta.env.BASE_URL}branding/edutrack-${monochrome ? 'mono' : 'icon'}.svg`} width={size} height={size} alt="" aria-hidden="true" draggable={false} />;
}
