import { ReactNode } from 'react';

type SocialLink = {
  label: string;
  url: string;
  ariaLabel: string;
  icon: ReactNode;
  id?: string;
  extra?: ReactNode;
};

const links: SocialLink[] = [
  {
    label: 'X',
    url: 'https://x.com/gothlab_dev?s=11',
    ariaLabel: 'X (Twitter) �ffnen',
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2H21l-6.484 7.41L22 22h-6.828l-4.77-6.222L4.9 22H2.142l6.94-7.93L2 2h6.914l4.313 5.77L18.244 2zm-1.195 18h1.77L7.03 4h-1.8l11.82 16z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/maro.xt?igsh=MTdwZG1peGVqbXZlMg%3D%3D&utm_source=qr',
    ariaLabel: 'Instagram �ffnen',
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM18 6.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" />
      </svg>
    ),
  },
  {
    label: 'Discord',
    url: 'https://discord.com/users/1109040058843025519',
    ariaLabel: 'Discord �ffnen',
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.317 4.369A19.791 19.791 0 0016.558 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 00-4-.47c-1.36 0-2.72.16-4 .47-.17-.39-.39-.85-.6-1.23A19.736 19.736 0 003.68 4.37C1.94 7.2 1.48 9.95 1.66 12.66c1.73 1.3 3.4 2.09 5.04 2.61.41-.58.78-1.2 1.1-1.86-.61-.22-1.19-.49-1.75-.79.15-.11.29-.22.43-.33a10.9 10.9 0 0010.04 0c.14.11.28.22.43.33-.56.3-1.14.57-1.75.79.32.66.69 1.28 1.1 1.86 1.64-.52 3.32-1.32 5.06-2.62.23-3.21-.54-5.94-2.6-8.29zM9.27 12.94c-.78 0-1.42-.71-1.42-1.58s.63-1.58 1.42-1.58c.79 0 1.43.71 1.42 1.58 0 .87-.63 1.58-1.42 1.58zm5.46 0c-.78 0-1.42-.71-1.42-1.58s.64-1.58 1.42-1.58c.79 0 1.42.71 1.42 1.58 0 .87-.63 1.58-1.42 1.58z" />
      </svg>
    ),
  },
  {
    label: 'Steam',
    url: 'https://steamcommunity.com/profiles/76561199068188141/',
    ariaLabel: 'Steam �ffnen',
    id: 'steam-link',
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 00-9.8 8.06l4.64 1.93a3.5 3.5 0 116.36 1.6l2.27 1.05A4.5 4.5 0 1016.5 7a4.47 4.47 0 00-3.88 2.25l-.03.05A10 10 0 1012 2zm4.5 4a3 3 0 110 6 3 3 0 010-6zM9 16.5a2 2 0 11.001-4.001A2 2 0 019 16.5z" />
      </svg>
    ),
    extra: <div id="steam-inline" className="steam-inline" aria-live="polite" />,
  },
];

export function SocialLinks() {
  return (
    <div className="links">
      {links.map((link) => (
        <a
          key={link.url}
          id={link.id}
          className="link"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.ariaLabel}
        >
          {link.icon}
          <span>{link.label}</span>
          {link.extra}
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;