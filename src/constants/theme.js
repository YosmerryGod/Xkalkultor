// Token tema neumorphic (terang & gelap).
export const getTheme = (isDarkMode) => ({
    bgApp: isDarkMode ? 'bg-[#18181c]' : 'bg-[#e0e5ec]',
    bgContainer: isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#e0e5ec]',
    textPrimary: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    shadowOut: isDarkMode 
      ? 'shadow-[5px_5px_10px_#141418,-5px_-5px_10px_#282830]' 
      : 'shadow-[5px_5px_10px_#bec3c9,-5px_-5px_10px_#ffffff]',
    shadowOutActive: isDarkMode 
      ? 'active:shadow-[inset_3px_3px_6px_#141418,inset_-3px_-3px_6px_#282830]' 
      : 'active:shadow-[inset_3px_3px_6px_#bec3c9,inset_-3px_-3px_6px_#ffffff]',
    shadowIn: isDarkMode
      ? 'shadow-[inset_5px_5px_10px_#141418,inset_-5px_-5px_10px_#282830]'
      : 'shadow-[inset_5px_5px_10px_#bec3c9,inset_-5px_-5px_10px_#ffffff]',
    border: isDarkMode ? 'border-[#2a2a32]' : 'border-gray-300/50',
    inputBg: isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#e0e5ec]',
    inputFocus: isDarkMode ? 'focus:ring-[#df6a49] focus:ring-opacity-50' : 'focus:ring-[#df6a49] focus:ring-opacity-30',
  });
