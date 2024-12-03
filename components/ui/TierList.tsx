"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Upload, X, LinkIcon, Plus, Trash2, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Inter, Bangers } from 'next/font/google';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import ConfettiGenerator from 'confetti-js';

const inter = Inter({ subsets: ['latin'] });
const bangers = Bangers({ weight: '400', subsets: ['latin'] });

declare global {
  interface Window {
    confetti: any;
  }
}

interface TierItem {
  id: number;
  imageUrl: string;
  name: string;
  originalSection: number;
}

interface Section {
  id: number;
  name: string;
  color: string;
  items: TierItem[];
  icon: string;
  averageScore: number;
}

interface Tier {
  id: number;
  name: string;
  color: string;
}

const TierList: React.FC = () => {
  const colorOptions = [
    { value: '#FF6666' },
    { value: '#FFD280' },
    { value: '#FFFF99' },
    { value: '#90EE90' },
    { value: '#B0E2FF' },
    { value: '#6666FF' },
    { value: '#9370DB' },
    { value: '#DDA0DD' },
    { value: '#FF66FF' },
    { value: '#FF99CC' },
    { value: '#FF0000' },
    { value: '#FFA500' },
    { value: '#FFFF00' },
    { value: '#32CD32' },
    { value: '#0000FF' },
    { value: '#4B0082' },
    { value: '#EE82EE' },
    { value: '#FF00FF' },
    { value: '#FF1493' },
    { value: '#8B0000' },
  ];

  const [tiers, setTiers] = useState<Tier[]>([
    { id: 10, name: '10', color: colorOptions[0].value },
    { id: 9, name: '9', color: colorOptions[1].value },
    { id: 8, name: '8', color: colorOptions[2].value },
    { id: 7, name: '7', color: colorOptions[3].value },
    { id: 6, name: '6', color: colorOptions[4].value },
    { id: 5, name: '5', color: colorOptions[5].value },
    { id: 4, name: '4', color: colorOptions[6].value },
    { id: 3, name: '3', color: colorOptions[7].value },
    { id: 2, name: '2', color: colorOptions[8].value },
    { id: 1, name: '1', color: colorOptions[9].value },
  ]);

  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      name: 'Azulitos',
      color: '#0000FF',
      items: [],
      icon: '/Azulitos.png',
      averageScore: 0
    },
    {
      id: 2,
      name: 'Rojitos',
      color: '#FF0000',
      items: [],
      icon: '/Rojitos.png',
      averageScore: 0
    }
  ]);

  const [pendingSection, setPendingSection] = useState<Section>({
    id: 3,
    name: 'No hay esta semana',
    color: '#4A4A4A',
    items: [],
    icon: '',
    averageScore: 0
  });

  const [draggedItem, setDraggedItem] = useState<TierItem | null>(null);
  const [tierItems, setTierItems] = useState<{ [key: string]: TierItem[] }>({});
  const [editingTier, setEditingTier] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [winningSection, setWinningSection] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('/winner-sound.mp3') : null);
  const [isTie, setIsTie] = useState(false);
  const [tiedSections, setTiedSections] = useState<number[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('tierListData');
    if (savedData) {
      const { savedTiers, savedSections, savedPendingSection, savedTierItems } = JSON.parse(savedData);
      setTiers(savedTiers);
      setSections(prev => prev.map(section => {
        const savedSection = savedSections.find((s: Section) => s.id === section.id);
        return savedSection ? { ...savedSection, icon: section.icon } : section;
      }));
      setPendingSection(savedPendingSection);
      setTierItems(savedTierItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tierListData', JSON.stringify({
      savedTiers: tiers,
      savedSections: sections,
      savedPendingSection: pendingSection,
      savedTierItems: tierItems
    }));
  }, [tiers, sections, pendingSection, tierItems]);

  const calculateAverageScore = (sectionId: number): string => {
    let totalScore = 0;
    let itemCount = 0;

    Object.entries(tierItems).forEach(([tierId, items]) => {
      const itemsFromSection = items.filter(item => item.originalSection === sectionId);
      totalScore += itemsFromSection.length * parseInt(tierId);
      itemCount += itemsFromSection.length;
    });

    return itemCount > 0 ? (totalScore / itemCount).toFixed(2) : '0';
  };

  const handleFileSelect = (sectionId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = (e: Event) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        imageUrl: URL.createObjectURL(file),
        name: file.name,
        originalSection: sectionId
      }));

      setSections(prev => prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [...section.items, ...newImages]
          };
        }
        return section;
      }));
    };

    input.click();
  };

  const handleAddImageByUrl = (sectionId: number) => {
    if (imageUrl) {
      const newImage = {
        id: Date.now() + Math.random(),
        imageUrl: imageUrl,
        name: 'Image from URL',
        originalSection: sectionId
      };

      setSections(prev => prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [...section.items, newImage]
          };
        }
        return section;
      }));

      setImageUrl('');
      setIsUrlDialogOpen(false);
    }
  };

  const handleRemoveImage = (sectionId: number, itemId: number) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));
  };

  const handleDragStart = (item: TierItem, sectionId: number) => {
    setDraggedItem({ ...item, originalSection: sectionId });
  };

  const handleDrag = (e: React.DragEvent<HTMLImageElement>) => {
    const scrollSpeed = 15;
    const scrollThreshold = 100;

    if (e.clientY < scrollThreshold) {
      window.scrollBy(0, -scrollSpeed);
    } else if (window.innerHeight - e.clientY < scrollThreshold) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (tierId: number) => {
    if (!draggedItem) return;

    if (draggedItem.originalSection === pendingSection.id) {
      setPendingSection(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== draggedItem.id)
      }));
    } else {
      setSections(prev => prev.map(section => {
        if (section.id === draggedItem.originalSection) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== draggedItem.id)
          };
        }
        return section;
      }));
    }

    setTierItems(prev => {
      const newTierItems = { ...prev };
      Object.keys(newTierItems).forEach(key => {
        newTierItems[key] = newTierItems[key]?.filter(item => 
          item.id !== draggedItem.id
        ) || [];
      });
      
      if (!newTierItems[tierId]) {
        newTierItems[tierId] = [];
      }
      newTierItems[tierId] = [...newTierItems[tierId], draggedItem];
      
      return newTierItems;
    });
    
    setDraggedItem(null);
  };

  const handleDropToSection = (e: React.DragEvent, targetSectionId: number | null, isPending = false) => {
    e.preventDefault();
    if (!draggedItem) return;

    setTierItems(prev => {
      const newTierItems = { ...prev };
      Object.keys(newTierItems).forEach(key => {
        newTierItems[key] = newTierItems[key]?.filter(item => 
          item.id !== draggedItem.id
        ) || [];
      });
      return newTierItems;
    });

    if (draggedItem.originalSection === pendingSection.id) {
      setPendingSection(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== draggedItem.id)
      }));
    } else {
      setSections(prev => prev.map(section => {
        if (section.id === draggedItem.originalSection) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== draggedItem.id)
          };
        }
        return section;
      }));
    }

    if (isPending) {
      setPendingSection(prev => ({
        ...prev,
        items: [...prev.items, draggedItem]
      }));
    } else if (targetSectionId !== null) {
      setSections(prev => prev.map(section => {
        if (section.id === targetSectionId) {
          return {
            ...section,
            items: [...section.items, draggedItem]
          };
        }
        return section;
      }));
    }

    setDraggedItem(null);
  };

  const addNewTier = (position: 'top' | 'bottom') => {
    const newId = position === 'top' ? Math.max(...tiers.map(t => t.id)) + 1 : Math.min(...tiers.map(t => t.id)) - 1;
    const newTier = {
      id: newId,
      name: newId.toString(),
      color: colorOptions[newId % colorOptions.length].value
    };
    setTiers(prev => position === 'top' ? [newTier, ...prev] : [...prev, newTier]);
  };

  const removeTier = (tierId: number) => {
    setTiers(prev => prev.filter(tier => tier.id !== tierId));
    setTierItems(prev => {
      const newItems = { ...prev };
      delete newItems[tierId];
      return newItems;
    });
  };

  const updateTier = (tierId: number, updates: Partial<Tier>) => {
    setTiers(prev => prev.map(tier => 
      tier.id === tierId ? { ...tier, ...updates } : tier
    ));
    setEditingTier(null);
  };

  const handleTierEdit = (e: React.MouseEvent, tierId: number) => {
    e.stopPropagation();
    setEditingTier(tierId);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.tier-edit') && !(event.target as Element).closest('.color-option')) {
        updateTier(tierId, {});
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
  };

  const handleTierNameChange = (e: React.ChangeEvent<HTMLInputElement>, tierId: number) => {
    const newName = e.target.value;
    setTiers(prev => prev.map(tier => 
      tier.id === tierId ? { ...tier, name: newName } : tier
    ));
  };

  const handleTierColorChange = (color: string, tierId: number) => {
    updateTier(tierId, { color: color });
  };

  const handleTierEditKeyDown = (e: React.KeyboardEvent, tierId: number) => {
    if (e.key === 'Enter') {
      updateTier(tierId, {});
    }
  };

  const resetTierList = () => {
    const allItems = [...Object.values(tierItems).flat(), ...pendingSection.items];
    
    const updatedSections = sections.map(section => ({
      ...section,
      items: [
        ...section.items,
        ...allItems.filter(item => item.originalSection === section.id)
      ]
    }));

    setTiers(prev => prev.map((tier,index) => ({
      ...tier,
      color: colorOptions[index % colorOptions.length].value,
    })));
    setSections(updatedSections);
    setPendingSection({
      ...pendingSection,
      items: []
    });
    setTierItems({});

    setTimeout(() => {
      sections.forEach(section => {
        const newScore = calculateAverageScore(section.id);
        setSections(prev => prev.map(s => 
          s.id === section.id ? { ...s, averageScore: parseFloat(newScore) } : s
        ));
      });
    }, 0);
  };

  const startConfetti = (iconUrls: string[]) => {
     const confettiSettings = { 
       target: 'confetti-canvas', 
       max: 150, 
       size: 2, 
       animate: true, 
       props: ['circle', ...iconUrls.map(url => ({ type: 'svg', src: url, size: 15, weight: 1 }))], 
       rotate: true,
       spread: 180
     };
     window.confetti = new ConfettiGenerator(confettiSettings);
     window.confetti.render();
   };

  const stopConfetti = () => {
    if (window.confetti) {
      window.confetti.clear();
    }
  };

  const calculateAllAverages = () => {
    setIsCalculating(true);
    setShowResult(false);
    setIsTie(false);
    setTiedSections([]);

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => console.error("Error playing audio:", error));
    }

    setTimeout(() => {
      const newSections = sections.map(section => ({
        ...section,
        averageScore: parseFloat(calculateAverageScore(section.id))
      }));

      const maxScore = Math.max(...newSections.map(s => s.averageScore));
      const winningSections = newSections.filter(s => s.averageScore === maxScore);

      setSections(newSections);

      if (winningSections.length > 1) {
        setIsTie(true);
        setTiedSections(winningSections.map(s => s.id));
        startConfetti(winningSections.map(s => s.icon));
      } else if (winningSections.length === 1) {
        setWinningSection(winningSections[0].id);
        startConfetti([winningSections[0].icon]);
      }

      setShowResult(true);

      setTimeout(() => {
        setShowResult(false);
        setWinningSection(null);
        setIsTie(false);
        setTiedSections([]);
        stopConfetti();
      }, 10000);
    }, 8000);
  };

  const handleTimerComplete = () => {
    setIsCalculating(false);
  };

  return (
    <div className={`p-4 min-h-screen bg-gray-900 ${inter.className}`}>
      <TooltipProvider>
        <div className="flex items-center mb-6">
          <div className="w-1/4 flex items-center">
            <Button 
              onClick={calculateAllAverages} 
              variant="secondary" 
              size="sm" 
              className="mr-2"
              disabled={isCalculating}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Promedios
            </Button>
            <Button onClick={resetTierList} variant="destructive" size="sm">
              Resetear Tierlist
            </Button>
          </div>
          <h1 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center flex-1 ${bangers.className}`}>
            El Shonen Semanal
          </h1>
          <div className="w-1/4"></div>
        </div>
        
        {isCalculating && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="text-center">
              <p className={`text-6xl mb-8 text-white ${bangers.className}`}>Y EL GANADOR DEL SHONEN SEMANAL ES...</p>
              <CountdownTimer seconds={8} onComplete={handleTimerComplete} className="text-6xl text-white" />
            </div>
          </div>
        )}

        {showResult && (isTie ? (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <Card className="p-8 max-w-2xl w-full" style={{ 
              background: 'linear-gradient(45deg, #FF0000, #0000FF)',
              boxShadow: '0 0 50px rgba(255, 255, 255, 0.5)',
            }}>
              <div className={`${bangers.className} text-center`}>
                <h2 className="text-6xl font-bold mb-6 text-white animate-bounce" style={{ textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000' }}>
                  ¡EMPATE!
                </h2>
                <p className="text-4xl mb-4 text-white" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}>
                  {tiedSections.map(id => sections.find(s => s.id === id)?.name).join(' y ')}
                </p>
                <p className="text-7xl font-bold text-yellow-300 animate-pulse" style={{ textShadow: '4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000' }}>
                  {sections.find(s => s.id === tiedSections[0])?.averageScore.toFixed(2)}
                </p>
              </div>
              <div className="mt-8 flex justify-center space-x-4">
                {tiedSections.map(id => (
                  <img
                    key={id}
                    src={sections.find(s => s.id === id)?.icon}
                    alt={`${sections.find(s => s.id === id)?.name} icon`}
                    className="w-32 h-32 object-contain animate-bounce"
                    style={{ animation: 'bounce 2s infinite' }}
                  />
                ))}
              </div>
            </Card>
          </div>
        ) : winningSection && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <Card className="p-8 max-w-2xl w-full" style={{ 
              backgroundColor: sections.find(s => s.id === winningSection)?.color,
              boxShadow: '0 0 50px rgba(255, 255, 255, 0.5)',
            }}>
              <div className={`${bangers.className} text-center`}>
                <h2 className="text-6xl font-bold mb-6 text-white animate-bounce" style={{ textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000' }}>
                  ¡GANADOR!
                </h2>
                <p className="text-4xl mb-4 text-white" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}>
                  {sections.find(s => s.id === winningSection)?.name}
                </p>
                <p className="text-7xl font-bold text-yellow-300 animate-pulse" style={{ textShadow: '4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000' }}>
                  {sections.find(s => s.id === winningSection)?.averageScore.toFixed(2)}
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <img
                  src={sections.find(s => s.id === winningSection)?.icon}
                  alt="Winner icon"
                  className="w-32 h-32 object-contain animate-spin"
                  style={{ animation: 'spin 5s linear infinite' }}
                />
              </div>
            </Card>
          </div>
        ))}
        
        <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
          {/* Left side - Tiers */}
          <div className="w-full md:w-1/2 space-y-2">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="flex gap-2 items-stretch"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(tier.id)}
              >
                {/* Tier label */}
                <div 
                  className="w-24 min-h-[4rem] flex flex-col items-center justify-center text-sm font-bold relative group overflow-hidden cursor-pointer rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: tier.color }}
                  onClick={(e) => handleTierEdit(e, tier.id)}
                >
                  {editingTier === tier.id ? (
                    <div className="absolute inset-0 bg-gray-100 flex flex-col p-1 tier-edit">
                      <Input
                        type="text"
                        value={tier.name}
                        className="w-full mb-1 text-sm h-8"
                        onChange={(e) => handleTierNameChange(e, tier.id)}
                        onKeyDown={(e) => handleTierEditKeyDown(e, tier.id)}
                        autoFocus
                      />
                      <Select
                        value={tier.color}
                        onValueChange={(value) => handleTierColorChange(value, tier.id)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="w-8 h-8 rounded-full color-option" style={{ backgroundColor: color.value }} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <>
                      <span className="px-1 py-1 text-center w-full break-words leading-tight">{tier.name}</span>
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTier(tier.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Tier content */}
                <div className="flex-1 bg-gray-800 p-2 min-h-24 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {tierItems[tier.id]?.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="relative group">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-24 object-cover cursor-move rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:z-10 hover:shadow-lg"
                          draggable
                          onDragStart={() => handleDragStart(item, tier.id)}
                          onDrag={handleDrag}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-4">
              <Button 
                onClick={() => addNewTier('top')}
                className="w-1/2 mr-2"
                variant="outline"
                size="sm"
              >
                <ChevronUp size={16} className="mr-2" />
                Agregar Tier Arriba
              </Button>
              <Button 
                onClick={() => addNewTier('bottom')}
                className="w-1/2"
                variant="outline"
                size="sm"
              >
                <ChevronDown size={16} className="mr-2" />
                Agregar Tier Abajo
              </Button>
            </div>
          </div>

          {/* Right side - Sections */}
          <div className="w-full md:w-1/2 space-y-4">
            {sections.map(section => (
              <Card 
                key={section.id}
                className="p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: section.color }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropToSection(e, section.id)}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10"></div>
                  <h2 className={`text-xl font-bold text-white text-center flex-1 flex items-center justify-center gap-2 ${bangers.className}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {section.icon && (
                      <>
                        <img
                          src={section.icon}
                          alt={`${section.name} icon`}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                        {section.name}
                        <img
                          src={section.icon}
                          alt={`${section.name} icon`}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </>
                    )}
                    {!section.icon && section.name}
                  </h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 w-10">
                        <Plus size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleFileSelect(section.id)}>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Subir imagen</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => {
                        setActiveSectionId(section.id);
                        setIsUrlDialogOpen(true);
                      }}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        <span>Agregar por URL</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {section.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="relative group">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-24 object-cover cursor-move rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:z-10 hover:shadow-lg"
                        draggable
                        onDragStart={() => handleDragStart(item, section.id)}
                        onDrag={handleDrag}
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(section.id, item.id)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-white font-bold">
                    Promedio: {section.averageScore.toFixed(2)}
                  </span>
                </div>
              </Card>
            ))}
            
            <Card 
              className="p-4 bg-gray-700 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropToSection(e, null, true)}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold text-white text-center w-full ${bangers.className}`}>No hay esta semana</h2>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {pendingSection.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-24 object-cover cursor-move rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:z-10 hover:shadow-lg"
                      draggable
                      onDragStart={() => handleDragStart(item, pendingSection.id)}
                      onDrag={handleDrag}
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(pendingSection.id, item.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar imagen por URL</DialogTitle>
            </DialogHeader>
            <Input
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button onClick={() => handleAddImageByUrl(activeSectionId!)}>Agregar</Button>
          </DialogContent>
        </Dialog>
        <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-50"></canvas>
      </TooltipProvider>
    </div>
  );
};

export default TierList;

