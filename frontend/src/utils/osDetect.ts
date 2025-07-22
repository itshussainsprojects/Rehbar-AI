import { UAParser } from 'ua-parser-js'

export interface OSInfo {
  name: string
  version?: string
  isChrome: boolean
  isMobile: boolean
}

export function detectOS(): OSInfo {
  const parser = new UAParser()
  const result = parser.getResult()
  
  const os = result.os
  const browser = result.browser
  const device = result.device
  
  return {
    name: os.name || 'Unknown',
    version: os.version,
    isChrome: browser.name === 'Chrome',
    isMobile: device.type === 'mobile' || device.type === 'tablet'
  }
}

export function getDownloadUrl(osInfo: OSInfo): string {
  const { name, isChrome, isMobile } = osInfo
  
  // If Chrome on desktop, redirect to extension
  if (isChrome && !isMobile) {
    return '/extension'
  }
  
  // If mobile, show manual chooser
  if (isMobile) {
    return '/download'
  }
  
  // Desktop OS detection
  switch (name.toLowerCase()) {
    case 'windows':
    case 'mac os':
    case 'macos':
    case 'linux':
    case 'ubuntu':
      return '/desktop'
    default:
      return '/download'
  }
}

export function getOSDisplayName(osName: string): string {
  switch (osName.toLowerCase()) {
    case 'mac os':
    case 'macos':
      return 'macOS'
    case 'windows':
      return 'Windows'
    case 'linux':
    case 'ubuntu':
      return 'Linux'
    default:
      return osName
  }
}

export function getDownloadFileName(osName: string): string {
  switch (osName.toLowerCase()) {
    case 'windows':
      return 'RehbarAI-Setup.exe'
    case 'mac os':
    case 'macos':
      return 'RehbarAI.dmg'
    case 'linux':
    case 'ubuntu':
      return 'RehbarAI.AppImage'
    default:
      return 'RehbarAI-Setup'
  }
}
