import logoIcon from '../../assets/logo-icon.svg'

export function LogoIcon({ className = 'w-8 h-8' }) {
  return <img src={logoIcon} alt="TradeEdge" className={className} />
}
