// Token tema neumorphic (terang & gelap).
export const getTheme = (isDarkMode) => ({
    // [MODIFIED] Deep Dark palette: charcoal surfaces with restrained contrast.
    bgApp: isDarkMode ? 'bg-[#101318]' : 'bg-[#e0e5ec]',
    bgContainer: isDarkMode ? 'bg-[#181D24]' : 'bg-[#e0e5ec]',
    textPrimary: isDarkMode ? 'text-[#F1F3F5]' : 'text-gray-800',
    textSecondary: isDarkMode ? 'text-[#9AA3AE]' : 'text-gray-500',
    shadowOut: isDarkMode
      ? 'shadow-[7px_7px_16px_#0B0E12,-5px_-5px_14px_#252C35]'
      : 'shadow-[5px_5px_10px_#bec3c9,-5px_-5px_10px_#ffffff]',
    shadowOutActive: isDarkMode
      ? 'active:shadow-[inset_3px_3px_7px_#0B0E12,inset_-3px_-3px_7px_#252C35]'
      : 'active:shadow-[inset_3px_3px_6px_#bec3c9,inset_-3px_-3px_6px_#ffffff]',
    shadowIn: isDarkMode
      ? 'shadow-[inset_5px_5px_10px_#0B0E12,inset_-3px_-3px_8px_#252C35]'
      : 'shadow-[inset_5px_5px_10px_#bec3c9,inset_-5px_-5px_10px_#ffffff]',
    border: isDarkMode ? 'border-[#2B333D]' : 'border-gray-300/50',
    // [MODIFIED] Inputs use a deeper surface to distinguish them from cards.
    inputBg: isDarkMode ? 'bg-[#13181E]' : 'bg-[#e0e5ec]',
    inputFocus: isDarkMode ? 'focus:ring-[#F07845] focus:ring-opacity-50' : 'focus:ring-[#df6a49] focus:ring-opacity-30',
  });
