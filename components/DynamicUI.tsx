
import React, { useState } from 'react';
import { UIIntent, UISchema } from '../types';

interface DynamicUIProps {
  intent: UIIntent;
  schema: UISchema;
  onSubmit: (data: any) => void;
}

const DynamicUI: React.FC<DynamicUIProps> = ({ intent, schema, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    schema.fields?.forEach(f => {
      if (f.defaultValue) initial[f.key] = f.defaultValue;
    });
    return initial;
  });

  if (intent === UIIntent.NONE) return null;

  const renderForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{schema.title}</h3>
      {schema.fields?.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === 'select' ? (
            <select
              className="border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData[field.key] || ''}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            >
              <option value="">请选择...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              className="border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData[field.key] || ''}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              placeholder={`请输入 ${field.label.toLowerCase()}...`}
            />
          )}
        </div>
      ))}
      <div className="pt-4 flex gap-2">
        {schema.actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onSubmit(formData)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              action.type === 'SUBMIT' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
          <tr>
            {schema.columns?.map(col => (
              <th key={col.key} className="px-4 py-3 font-semibold">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {schema.data?.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {schema.columns?.map(col => (
                <td key={col.key} className="px-4 py-3">{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {schema.items?.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onSubmit(item)}
          className="p-3 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all group"
        >
          {item.image && <img src={item.image} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />}
          <h4 className="font-semibold text-slate-800 group-hover:text-indigo-700">{item.title}</h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {intent === UIIntent.FORM && renderForm()}
      {intent === UIIntent.TABLE && renderTable()}
      {intent === UIIntent.CARD && renderCard()}
      {intent === UIIntent.PREVIEW && (
        <div className="prose prose-slate max-w-none">
          <h3 className="text-lg font-semibold">{schema.title}</h3>
          <div className="p-4 bg-slate-50 rounded-lg whitespace-pre-wrap text-sm">
            {schema.content}
          </div>
          <button 
            onClick={() => onSubmit({})}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium"
          >
            确认知晓
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicUI;
