import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { selectLanguage, selectLanguageConfig, setLanguage, Language } from '@/store/slice/languageSlice';
import { SUPPORTED_LANGUAGES } from '@/config/languages';

export function LanguageSwitcher() {
  const dispatch = useDispatch();
  const currentLang = useSelector(selectLanguage);
  const langConfig = useSelector(selectLanguageConfig);
  if (SUPPORTED_LANGUAGES.length <= 1) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50 transition-colors">
          {langConfig.flag ? (
            <img
              src={langConfig.flag}
              alt={langConfig.label}
              className="h-3.5 w-5 object-cover rounded-[2px]"
            />
          ) : (
            <Globe className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className="font-medium">{currentLang.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => dispatch(setLanguage(lang.code as Language))}
            className={cn(
              'flex items-center gap-2 text-[12px] cursor-pointer',
              currentLang === lang.code && 'bg-gray-50 font-medium',
            )}
          >
            {lang.flag ? (
              <img
                src={lang.flag}
                alt={lang.label}
                className="h-4 w-5 object-cover rounded-[2px]"
              />
            ) : (
              <Globe className="h-3.5 w-3.5 text-gray-400" />
            )}
            <span>{lang.label}</span>
            {currentLang === lang.code && <Check className="h-3 w-3 ml-auto text-gray-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
