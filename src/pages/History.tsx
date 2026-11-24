import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Trash2,
  Volume2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { historyService } from '../services/historyService';
import { useVoice } from '../contexts/VoiceContext';
import { useApp } from '../contexts/AppContext';
import type { HistoryRecord } from '../types';

export default function History() {
  const navigate = useNavigate();
  const { speak, triggerHaptic } = useVoice();
  const { setCurrentResult } = useApp();

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = historyService.getHistory();
    setRecords(data);
  };

  const handleClearHistory = () => {
    triggerHaptic('selection');
    historyService.clearHistory();
    setRecords([]);
    setClearModalOpen(false);
    speak('Recognition history cleared.');
  };

  const handleSelectRecord = (record: HistoryRecord) => {
    triggerHaptic('selection');
    setCurrentResult(record);
    const clean = record.denomination.replace('₹', '');
    speak(`Selected previous scan: ${clean} rupees. Navigating to result screen.`);
    navigate('/result');
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const timeStr = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <Layout title="Recognition History" showBack>
      <div className="space-y-6">
        {/* Summary Card & Clear Action */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0f2347] border border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Total Scans
            </span>
            <div className="text-2xl font-black text-white">
              {records.length} {records.length === 1 ? 'Record' : 'Records'}
            </div>
          </div>

          {records.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setClearModalOpen(true)}
              iconLeft={<Trash2 className="w-4 h-4" />}
              aria-label="Clear all history records"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* History List */}
        {records.length > 0 ? (
          <div className="space-y-3" role="feed" aria-label="Currency recognition records">
            {records.map((record) => (
              <Card
                key={record.id}
                padding="md"
                onClick={() => handleSelectRecord(record)}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Denomination badge */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-950 to-teal-950 border border-cyan-400/30 flex items-center justify-center text-xl font-black text-cyan-300 shadow-sm flex-shrink-0">
                    {record.denomination}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        Indian Rupee Note
                      </span>
                      {record.isDemo ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          DEMO
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <Cpu className="w-2.5 h-2.5" />
                          AI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(record.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Speak button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('selection');
                    const clean = record.denomination.replace('₹', '');
                    speak(`This is an Indian ${clean} rupee note, recorded ${formatDate(record.timestamp)}.`);
                  }}
                  className="p-3 rounded-xl text-cyan-400 hover:bg-cyan-500/10 min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors focus:ring-2 focus:ring-cyan-400"
                  aria-label={`Read aloud record for ${record.denomination} note`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 px-4 space-y-4 rounded-3xl bg-[#0f2347]/40 border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                No Scans Recorded Yet
              </h2>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Scan your first currency note or test with a sample note in Demo Mode.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/scan')}
              aria-label="Open camera to scan a currency note"
            >
              Scan Currency Now
            </Button>
          </div>
        )}

        {/* Clear Confirmation Modal */}
        <Modal
          open={clearModalOpen}
          onClose={() => setClearModalOpen(false)}
          title="Clear Recognition History"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Are you sure you want to delete all saved scan records? This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="secondary" onClick={() => setClearModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleClearHistory}>
                Delete All
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
