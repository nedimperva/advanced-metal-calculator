"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { useI18n } from '@/contexts/i18n-context'
import { useColorTheme } from '@/contexts/color-theme-context'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { LENGTH_UNITS, WEIGHT_UNITS } from '@/lib/unit-conversions'
import { PRICING_MODELS, type PricingModel } from '@/lib/pricing-models'
import { 
  Palette, 
  Globe, 
  Ruler, 
  Weight, 
  Monitor, 
  Sun, 
  Moon, 
  Languages,
  Settings
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme, availableThemes } = useColorTheme()
  const { language, setLanguage, t, availableLanguages } = useI18n()
  const { updateDefaults, getSuggestions } = useUserPreferences()
  const suggestions = getSuggestions()

  const handleDefaultLengthUnitChange = (newUnit: string) => {
    updateDefaults({ defaultLengthUnit: newUnit })
  }

  const handleDefaultWeightUnitChange = (newUnit: string) => {
    updateDefaults({ defaultWeightUnit: newUnit })
  }

  const handleDefaultCurrencyChange = (newCurrency: string) => {
    updateDefaults({ defaultCurrency: newCurrency })
  }

  const handleDefaultPricingModelChange = (newModel: string) => {
    updateDefaults({ defaultPricingModel: newModel })
  }

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      case 'system': return <Monitor className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return t('light')
      case 'dark': return t('dark')
      case 'system': return t('system')
      default: return t('system')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            {t('settingsTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t('appearance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Selection */}
              <div className="space-y-2">
                <Label htmlFor="theme-select" className="text-sm font-medium">
                  {t('theme')}
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme-select">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {getThemeIcon(theme || 'system')}
                        {getThemeLabel(theme || 'system')}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        {t('light')}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        {t('dark')}
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        {t('system')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {theme === 'system' && 'Automatically matches your device theme'}
                  {theme === 'light' && 'Light theme for daytime use'}
                  {theme === 'dark' && 'Dark theme for reduced eye strain'}
                </p>
              </div>

              {/* Color Theme Selection */}
              <div className="space-y-2">
                <Label htmlFor="color-theme-select" className="text-sm font-medium">
                  {t('colorTheme')}
                </Label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger id="color-theme-select">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ 
                            background: `hsl(var(--primary))` 
                          }}
                        />
                        {availableThemes.find(t => t.value === colorTheme)?.name}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableThemes.map((themeOption) => (
                      <SelectItem key={themeOption.value} value={themeOption.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ 
                              background: (() => {
                                switch (themeOption.value) {
                                  case 'professional-blue':
                                    return 'hsl(209, 142%, 47%)'
                                  case 'engineering-green':
                                    return 'hsl(142, 76%, 36%)'
                                  case 'industrial-orange':
                                    return 'hsl(25, 95%, 53%)'
                                  case 'structural-gray':
                                    return 'hsl(215, 28%, 17%)'
                                  case 'copper-bronze':
                                    return 'hsl(19, 78%, 44%)'
                                  default:
                                    return 'hsl(209, 142%, 47%)'
                                }
                              })()
                            }}
                          />
                          <div>
                            <div className="font-medium">{themeOption.name}</div>
                            <div className="text-xs text-muted-foreground">{themeOption.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Professional color schemes for different engineering disciplines
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="h-5 w-5" />
                {t('language')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language-select" className="text-sm font-medium">
                  {t('language')}
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {availableLanguages.find(lang => lang.code === language)?.nativeName}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{lang.nativeName}</span>
                          {lang.name !== lang.nativeName && (
                            <span className="text-muted-foreground">({lang.name})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {availableLanguages.length} {availableLanguages.length === 1 ? 'language' : 'languages'} available
                  </Badge>
                  {language === 'bs' && (
                    <Badge variant="secondary" className="text-xs">
                      🇧🇦 Native
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Units */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                {t('units')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Default Length Unit */}
              <div className="space-y-2">
                <Label htmlFor="default-length-unit" className="text-sm font-medium">
                  {t('defaultLengthUnit')}
                </Label>
                <Select 
                  value={suggestions.defaults.lengthUnit} 
                  onValueChange={handleDefaultLengthUnitChange}
                >
                  <SelectTrigger id="default-length-unit">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        {LENGTH_UNITS[suggestions.defaults.lengthUnit as keyof typeof LENGTH_UNITS]?.name}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LENGTH_UNITS).map(([key, unit]) => (
                      <SelectItem key={key} value={key}>
                        <span>{unit.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Weight Unit */}
              <div className="space-y-2">
                <Label htmlFor="default-weight-unit" className="text-sm font-medium">
                  {t('defaultWeightUnit')}
                </Label>
                <Select 
                  value={suggestions.defaults.weightUnit} 
                  onValueChange={handleDefaultWeightUnitChange}
                >
                  <SelectTrigger id="default-weight-unit">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        {WEIGHT_UNITS[suggestions.defaults.weightUnit as keyof typeof WEIGHT_UNITS]?.name}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WEIGHT_UNITS).map(([key, unit]) => (
                      <SelectItem key={key} value={key}>
                        <span>{unit.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Default Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Weight className="h-5 w-5" />
                {t('pricing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Default Currency */}
              <div className="space-y-2">
                <Label htmlFor="default-currency" className="text-sm font-medium">
                  {t('defaultCurrency')}
                </Label>
                <Select 
                  value={suggestions.defaults.defaultCurrency} 
                  onValueChange={handleDefaultCurrencyChange}
                >
                  <SelectTrigger id="default-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="BAM">BAM - Bosnian Mark</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Default Pricing Model */}
              <div className="space-y-2">
                <Label htmlFor="default-pricing-model" className="text-sm font-medium">
                  {t('defaultPricingModel')}
                </Label>
                <Select 
                  value={suggestions.defaults.defaultPricingModel} 
                  onValueChange={handleDefaultPricingModelChange}
                >
                  <SelectTrigger id="default-pricing-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRICING_MODELS).map(([key, model]) => (
                      <SelectItem key={key} value={key}>
                        <span>{model.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• {t('defaultCurrency')}: {suggestions.defaults.defaultCurrency}</p>
                <p>• {t('defaultPricingModel')}: {PRICING_MODELS[suggestions.defaults.defaultPricingModel as keyof typeof PRICING_MODELS]?.name}</p>
                <p className="mt-2 italic">These will be used as default selections for new calculations.</p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="min-w-[100px]">
              {t('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 