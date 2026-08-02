import { useSettings } from '../../context/SettingsContext';
import logoBlack from '../../images/main logo black.png';
import logoWhite from '../../images/main logo white.png';

export default function BrandLogo({ variant = 'black', showName = false, imgClassName = '', nameClassName = '', link = null }) {
  const { getSetting } = useSettings();
  const instituteName = getSetting('institute_name', '');
  const src = variant === 'white' ? logoWhite : logoBlack;

  const content = (
    <div className="flex items-center gap-2.5 min-w-0">
      <img src={src} alt={instituteName || 'Logo'} className={`w-auto shrink-0 ${imgClassName || 'h-8'}`} draggable={false} />
      {showName && (
        <span className={`font-extrabold truncate ${nameClassName || 'text-base text-ink'}`} style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          {instituteName}
        </span>
      )}
    </div>
  );

  if (link) {
    return (
      <a href={link} className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
        {content}
      </a>
    );
  }

  return content;
}
