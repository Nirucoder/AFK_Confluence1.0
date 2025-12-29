import React from 'react';
import { AlertCircle, Users, Activity } from 'lucide-react';

const Sidebar = ({ incidents, volunteers }) => {
    return (
        <div className="w-96 bg-slate-900/90 backdrop-blur-md border-r border-slate-700 h-screen flex flex-col font-sans p-4 z-10 shadow-xl overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Command Center
                </h1>
                <p className="text-slate-400 text-sm">Situational Awareness System</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-cyan-400 mb-2">
                        <Users size={18} />
                        <span className="font-semibold">Active</span>
                    </div>
                    <span className="text-2xl font-bold">{volunteers.length}</span>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertCircle size={18} />
                        <span className="font-semibold">Incidents</span>
                    </div>
                    <span className="text-2xl font-bold">{incidents.length}</span>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Recent Incidents
            </h2>

            <div className="space-y-3">
                {incidents.length === 0 ? (
                    <div className="text-slate-500 text-sm">No active incidents</div>
                ) : (
                    incidents.map((inc) => (
                        <div key={inc.id} className="bg-slate-800 p-3 rounded border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
                            <h3 className="font-medium text-slate-200">{inc.title}</h3>
                            <p className="text-xs text-slate-400 mt-1 truncate">{inc.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs px-2 py-0.5 bg-red-900/50 text-red-300 rounded border border-red-900">
                                    {inc.status}
                                </span>
                                <span className="text-xs text-slate-500">
                                    ID: {inc.id}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
