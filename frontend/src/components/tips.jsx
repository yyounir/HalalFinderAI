import React from 'react';
import { Lightbulb } from 'lucide-react';

/* Tips component
   - Displays helpful tips with images to guide users choosing halal products.
   - Images use unsplash placeholders; replace with local assets in /public if desired.
*/

const tipsData = [
  {
    id: 1,
    title: 'Read the Ingredients List',
    text: 'Look for gelatin, lard, or alcohol-based ingredients which may indicate haram content.',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=60&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Check for Certification',
    text: 'Halal certification logos from trusted organizations are the clearest indicator.',
    img: 'https://static.vecteezy.com/system/resources/previews/016/746/182/non_2x/green-check-mark-icon-symbol-logo-in-a-circle-tick-symbol-green-color-illustration-free-vector.jpg'
  },
  {
    id: 3,
    title: 'When in Doubt, Contact Manufacturer',
    text: 'Manufacturers can confirm source of enzymes, emulsifiers and flavorings.',
    img: 'https://cdn-icons-png.flaticon.com/512/3690/3690107.png'
  }
];

export default function Tips() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Lightbulb className="w-8 h-8 text-amber-500" />
        <div>
          <h3 className="font-bold">Smart Tips</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">Quick guidance to help you choose halal products.</p>
        </div>
      </div>

      <div className="space-y-3">
        {tipsData.map(tip => (
          <div key={tip.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              <img src={tip.img} alt={tip.title} className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-sm dark:text-slate-100">{tip.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{tip.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
