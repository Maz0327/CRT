import { useState, useEffect } from 'react';
import { Page } from '../components/layout/Page';
import { SignalCard } from '../components/SignalCard';
import { NeedsEditModal } from '../components/NeedsEditModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, RefreshCw } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { useSignals, useConfirmSignal, useNeedsEditSignal } from '../hooks/useSignals';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

type FilterTab = 'unreviewed' | 'needs_edit' | 'confirmed';

export default function SignalsInboxPage() {
  const { currentProjectId } = useProjectContext();
  const [activeTab, setActiveTab] = useState<FilterTab>('unreviewed');
  const [needsEditModal, setNeedsEditModal] = useState<{
    isOpen: boolean;
    signalId: string;
    signalTitle: string;
  }>({ isOpen: false, signalId: '', signalTitle: '' });

  // If navigated with ?highlight=<signalId>, scroll that card into view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("highlight");
    if (!id) return;
    const el = document.querySelector(`[data-signal-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2","ring-purple-400","ring-offset-2");
      setTimeout(() => el.classList.remove("ring-2","ring-purple-400","ring-offset-2"), 1500);
    }
  }, []);

  // Queries for different tabs
  const unreviewedQuery = useSignals(currentProjectId || undefined, 'unreviewed');
  const needsEditQuery = useSignals(currentProjectId || undefined, 'needs_edit');
  const confirmedQuery = useSignals(currentProjectId || undefined, 'confirmed');

  // Mutations
  const confirmSignalMutation = useConfirmSignal();
  const needsEditSignalMutation = useNeedsEditSignal();

  const currentQuery = {
    unreviewed: unreviewedQuery,
    needs_edit: needsEditQuery,
    confirmed: confirmedQuery
  }[activeTab];

  const handleConfirm = (id: string) => {
    confirmSignalMutation.mutate(id);
  };

  const handleNeedsEdit = (id: string, title: string) => {
    setNeedsEditModal({ isOpen: true, signalId: id, signalTitle: title });
  };

  const handleNeedsEditSubmit = (notes: string) => {
    needsEditSignalMutation.mutate({ 
      id: needsEditModal.signalId, 
      notes: notes.trim() || undefined 
    });
  };

  const refreshCurrentTab = () => {
    currentQuery.refetch();
  };

  if (!currentProjectId) {
    return (
      <Page title="Signals Inbox" className="flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Please select a project to view signals</p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Signals Inbox">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Signals Inbox</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshCurrentTab}
              disabled={currentQuery.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${currentQuery.isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Signal
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unreviewed" className="flex items-center gap-2">
              Unreviewed
              {unreviewedQuery.data && unreviewedQuery.data.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreviewedQuery.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="needs_edit" className="flex items-center gap-2">
              Needs Review
              {needsEditQuery.data && needsEditQuery.data.length > 0 && (
                <Badge variant="outline" className="ml-1 border-amber-300 text-amber-700">
                  {needsEditQuery.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              Processed
              {confirmedQuery.data && confirmedQuery.data.length > 0 && (
                <Badge variant="outline" className="ml-1">
                  {confirmedQuery.data.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unreviewed" className="mt-4">
            <SignalsList 
              signals={unreviewedQuery.data || []}
              isLoading={unreviewedQuery.isLoading}
              onConfirm={handleConfirm}
              onNeedsEdit={handleNeedsEdit}
              emptyMessage="No unreviewed signals. New signals from analysis will appear here."
            />
          </TabsContent>

          <TabsContent value="needs_edit" className="mt-4">
            <SignalsList 
              signals={needsEditQuery.data || []}
              isLoading={needsEditQuery.isLoading}
              onConfirm={handleConfirm}
              onNeedsEdit={handleNeedsEdit}
              emptyMessage="No signals need editing. Signals marked for review will appear here."
            />
          </TabsContent>

          <TabsContent value="confirmed" className="mt-4">
            <SignalsList 
              signals={confirmedQuery.data || []}
              isLoading={confirmedQuery.isLoading}
              onConfirm={handleConfirm}
              onNeedsEdit={handleNeedsEdit}
              emptyMessage="No confirmed signals yet. Confirmed signals will appear here."
            />
          </TabsContent>
        </Tabs>
      </div>

      <NeedsEditModal
        open={needsEditModal.isOpen}
        onClose={() => setNeedsEditModal({ isOpen: false, signalId: '', signalTitle: '' })}
        onSubmit={handleNeedsEditSubmit}
        signalTitle={needsEditModal.signalTitle}
      />
    </Page>
  );
}

function SignalsList({ 
  signals, 
  isLoading, 
  onConfirm, 
  onNeedsEdit, 
  emptyMessage 
}: {
  signals: any[];
  isLoading: boolean;
  onConfirm: (id: string) => void;
  onNeedsEdit: (id: string, title: string) => void;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <SignalCard
          key={signal.id}
          id={signal.id}
          title={signal.title}
          summary={signal.summary}
          status={signal.status}
          sourceTag={signal.source_tag}
          confidence={signal.confidence}
          receiptsCount={signal.receipts_count}
          whySurfaced={signal.why_surfaced}
          onConfirm={onConfirm}
          onNeedsEdit={(id) => onNeedsEdit(id, signal.title)}
        />
      ))}
    </div>
  );
}