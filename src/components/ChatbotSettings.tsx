'use client';

import { useState } from 'react';
import { Settings, Volume2, VolumeX, Save, Trash2, Download, Upload, Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface ChatbotSettingsProps {
  settings: {
    voiceEnabled: boolean;
    autoSave: boolean;
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    responseStyle: 'detailed' | 'concise' | 'academic';
    language: 'pt-BR' | 'en-US' | 'es-ES';
  };
  onSettingsChange: (settings: ChatbotSettingsProps['settings']) => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
  onClearData: () => void;
}

export default function ChatbotSettings({
  settings,
  onSettingsChange,
  onExportData,
  onImportData,
  onClearData
}: ChatbotSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onImportData(data);
          toast({
            title: "Dados Importados!",
            description: "Seus dados foram importados com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro",
            description: "Não foi possível importar os dados. Verifique o formato do arquivo.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      onClearData();
      toast({
        title: "Dados Limpos!",
        description: "Todos os dados foram removidos com sucesso.",
      });
    }
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' }
  ];

  const responseStyleOptions = [
    { value: 'detailed', label: 'Detalhado' },
    { value: 'concise', label: 'Conciso' },
    { value: 'academic', label: 'Acadêmico' }
  ];

  const languageOptions = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español (España)' }
  ];

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-white hover:bg-white/20"
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Chatbot
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)]">
          <CardContent className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="appearance">Aparência</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
                <TabsTrigger value="data">Dados</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Configurações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {settings.voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        <span>Respostas em Voz</span>
                      </div>
                      <Checkbox
                        checked={settings.voiceEnabled}
                        onCheckedChange={(checked) => handleSettingChange('voiceEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        <span>Salvar Automaticamente</span>
                      </div>
                      <Checkbox
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Idioma</label>
                      <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estilo de Resposta</label>
                      <Select value={settings.responseStyle} onValueChange={(value) => handleSettingChange('responseStyle', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {responseStyleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Aparência</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tema</label>
                      <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              Claro
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              Escuro
                            </div>
                          </SelectItem>
                          <SelectItem value="auto">
                            <div className="flex items-center gap-2">
                              <Palette className="h-4 w-4" />
                              Automático
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tamanho da Fonte</label>
                      <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Personalização de Respostas</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Tom Teológico</span>
                            <Badge variant="secondary">Reformado</Badge>
                          </div>
                          <p className="text-xs text-slate-600">
                            Respostas baseadas na tradição reformada e calvinista
                          </p>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Profundidade</span>
                            <Badge variant="secondary">Acadêmica</Badge>
                          </div>
                          <p className="text-xs text-slate-600">
                            Análise detalhada com referências bíblicas e teológicas
                          </p>
                        </div>
                        
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Contexto</span>
                            <Badge variant="secondary">Histórico</Badge>
                          </div>
                          <p className="text-xs text-slate-600">
                            Mantém contexto da conversa para respostas mais coerentes
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Gerenciamento de Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Exportar Dados</h4>
                      <p className="text-sm text-slate-600">
                        Exporte seu histórico de conversas e configurações
                      </p>
                      <Button
                        onClick={onExportData}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Dados
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Importar Dados</h4>
                      <p className="text-sm text-slate-600">
                        Importe dados previamente exportados
                      </p>
                      <div>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileImport}
                          className="hidden"
                          id="import-data"
                        />
                        <Button
                          onClick={() => document.getElementById('import-data')?.click()}
                          className="w-full"
                          variant="outline"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Dados
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-medium text-red-600">Limpar Dados</h4>
                      <p className="text-sm text-slate-600">
                        Remova todos os dados do chatbot permanentemente
                      </p>
                      <Button
                        onClick={clearAllData}
                        className="w-full"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar Todos os Dados
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}