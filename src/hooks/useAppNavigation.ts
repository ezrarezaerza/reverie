import { useState, useEffect, useCallback } from 'react';
import { MainTab, SubViewType, NavigationState } from '../types/navigation';
import { getLocalDateString } from '../utils/dateUtils';
import { soundEngine } from '../utils/soundEngine';

function parseUrlState(): NavigationState {
  if (typeof window === 'undefined') {
    return { tab: 'journal', view: 'none' };
  }

  const params = new URLSearchParams(window.location.search);
  const rawTab = params.get('tab');
  const rawView = params.get('view');
  const selectedId = params.get('id') || undefined;
  const selectedDate = params.get('date') || undefined;
  const promptIndexRaw = params.get('prompt');
  const promptIndex = promptIndexRaw !== null && !isNaN(Number(promptIndexRaw)) ? Number(promptIndexRaw) : undefined;
  const refPromptText = params.get('promptText') || undefined;

  let tab: MainTab = 'journal';
  if (rawTab === 'novelties' || rawTab === 'scrapbook' || rawTab === 'timeflow' || rawTab === 'settings') {
    tab = rawTab;
  }

  let view: SubViewType = 'none';
  if (rawView === 'dossier' || rawView === 'workshop' || rawView === 'serendipity' || rawView === 'nudge') {
    view = rawView;
  }

  // Handle PWA shortcut action params (?action=write_entry or ?action=log_novelty)
  const action = params.get('action');
  if (action === 'write_entry' || action === 'new_entry') {
    tab = 'journal';
  } else if (action === 'log_novelty' || action === 'novelty') {
    tab = 'novelties';
  }

  return {
    tab,
    view,
    selectedId,
    selectedDate,
    promptIndex,
    refPromptText
  };
}

function buildUrl(state: NavigationState): string {
  const params = new URLSearchParams();
  if (state.tab !== 'journal') {
    params.set('tab', state.tab);
  }
  if (state.view !== 'none') {
    params.set('view', state.view);
  }
  if (state.selectedId) {
    params.set('id', state.selectedId);
  }
  if (state.selectedDate && state.selectedDate !== getLocalDateString()) {
    params.set('date', state.selectedDate);
  }
  if (state.promptIndex !== undefined) {
    params.set('prompt', state.promptIndex.toString());
  }
  if (state.refPromptText) {
    params.set('promptText', state.refPromptText);
  }

  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

export function useAppNavigation() {
  const [navState, setNavState] = useState<NavigationState>(() => parseUrlState());

  // Listen to browser Back / Forward buttons and Android hardware back gestures
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlState();
      setNavState(parsed);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateState = useCallback((newState: NavigationState, replace = false) => {
    setNavState(newState);
    const newUrl = buildUrl(newState);
    if (replace) {
      window.history.replaceState(newState, '', newUrl);
    } else {
      window.history.pushState(newState, '', newUrl);
    }
  }, []);

  const navigateToTab = useCallback((tab: MainTab) => {
    soundEngine.playPaperTurnSound();
    updateState({
      tab,
      view: 'none'
    });
  }, [updateState]);

  const navigateToNoveltyDossier = useCallback((noveltyId: string) => {
    soundEngine.playPaperTurnSound();
    updateState({
      tab: 'novelties',
      view: 'dossier',
      selectedId: noveltyId
    });
  }, [updateState]);

  const navigateToNoveltyWorkshop = useCallback((editingNoveltyId?: string) => {
    soundEngine.playPaperTurnSound();
    updateState({
      tab: 'novelties',
      view: 'workshop',
      selectedId: editingNoveltyId
    });
  }, [updateState]);

  const navigateToSerendipity = useCallback(() => {
    soundEngine.playPaperTurnSound();
    updateState({
      tab: navState.tab,
      view: 'serendipity'
    });
  }, [navState.tab, updateState]);

  const navigateToEveningNudge = useCallback((promptIndex?: number, promptText?: string) => {
    soundEngine.playPaperTurnSound();
    updateState({
      tab: navState.tab,
      view: 'nudge',
      promptIndex,
      refPromptText: promptText
    });
  }, [navState.tab, updateState]);

  const navigateBack = useCallback((fallbackTab: MainTab = 'journal') => {
    soundEngine.playPaperTurnSound();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      updateState({
        tab: fallbackTab,
        view: 'none'
      });
    }
  }, [updateState]);

  const closeSubView = useCallback((fallbackTab?: MainTab) => {
    soundEngine.playPaperTurnSound();
    updateState({
      tab: fallbackTab || navState.tab,
      view: 'none'
    });
  }, [navState.tab, updateState]);

  return {
    navState,
    activeTab: navState.tab,
    currentView: navState.view,
    selectedId: navState.selectedId,
    selectedDate: navState.selectedDate,
    promptIndex: navState.promptIndex,
    refPromptText: navState.refPromptText,
    navigateToTab,
    navigateToNoveltyDossier,
    navigateToNoveltyWorkshop,
    navigateToSerendipity,
    navigateToEveningNudge,
    navigateBack,
    closeSubView
  };
}
