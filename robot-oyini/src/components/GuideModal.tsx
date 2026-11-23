import React, { useState } from 'react';
import { X, Compass } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMANDS_REFERENCE = [
  {
    short: 'FD n',
    full: 'FORWARD n',
    desc: 'Robotdı házirgi baǵıtı boyınsha n qádem aldınǵa jıljıtadı.',
    example: 'FD 5',
  },
  {
    short: 'BK n',
    full: 'BACKWARD n',
    desc: 'Robotdı burılmastan n qádem artqa jıljıtadı.',
    example: 'BK 3',
  },
  {
    short: 'RT deg',
    full: 'RIGHT deg',
    desc: 'Robotdı saat tili baǵıtında (ońǵa) deg gradusqa buradı.',
    example: 'RT 90',
  },
  {
    short: 'LT deg',
    full: 'LEFT deg',
    desc: 'Robotdı saat tiline qarama-qarsı (solǵa) deg gradusqa buradı.',
    example: 'LT 90',
  },
  {
    short: 'REPEAT k [ ... ]',
    full: 'Tákirarlaw siklı',
    desc: 'Qawsırma ishindegi buyrıqlardı k márte tákirarlap orınlaydı.',
    example: 'REPEAT 4 [FD 3 RT 90]',
  },
];

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="guide-modal-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Basqarıw buyrıqları qollanbası
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              9-klass informatika · Qısqartırılǵan robot buyrıqları
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Qollanbanı jabıw"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Textbook Figure Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-5 items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="sm:col-span-2 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center">
              {!imgFailed ? (
                <img
                  src="/assets/aistudio/image_dd3e6045.png"
                  alt="6.11-súwret. Aldınǵa háreketleniw (FORWARD 5 / FD 5)"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-auto rounded object-contain max-h-44"
                />
              ) : (
                <div className="w-full h-36 bg-slate-100 rounded flex flex-col items-center justify-center text-slate-500 text-xs p-3 text-center">
                  <Compass className="w-6 h-6 mb-1.5 text-slate-400" />
                  <span>6.11-súwret · FD 5</span>
                </div>
              )}
            </div>
            <div className="sm:col-span-3 space-y-2">
              <h3 className="font-display text-sm font-bold text-slate-900">
                Robot qalay háreketlenedi?
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Sabaqlıqta kórsetilgenindey, robot koordinata torı boylap
                háreketlenedi. Tolıq buyrıq ornına onıń qısqartırılǵan túrin
                jazıw qolaylı: máselen, <strong className="font-mono text-slate-900">FORWARD 5</strong> ornına{' '}
                <strong className="font-mono text-slate-900">FD 5</strong> jazıladı.
              </p>
              <p className="text-xs leading-relaxed text-slate-600">
                Buyrıqlar joqarıdan tómenge qatar boyınsha izbe-iz orınlanadı.
              </p>
            </div>
          </div>

          {/* Command Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-2.5 px-4">Qısqartpa</th>
                  <th className="py-2.5 px-4">Tolıq atı</th>
                  <th className="py-2.5 px-4">Wazıypası</th>
                  <th className="py-2.5 px-4">Mısal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {COMMANDS_REFERENCE.map((item) => (
                  <tr key={item.short} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      {item.short}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {item.full}
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed">
                      {item.desc}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {item.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Túsinikli, oyınǵa qaytıw
          </button>
        </div>
      </div>
    </div>
  );
};
