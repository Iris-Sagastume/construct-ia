// src/App.tsx
import { useEffect, useState } from 'react';
import { api } from './api';

export default function App(){
  const [projects,setProjects]=useState<any[]>([]);
  const [name,setName]=useState('');
  const load=async()=>{ const {data}=await api.get('/projects'); setProjects(data); }
  const create=async()=>{ if(!name) return; await api.post('/projects',{name}); setName(''); load(); }
  useEffect(()=>{ load(); },[]);
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inversag – Proyectos (Demo Sprint 1)</h1>
      <div className="flex gap-2 mb-4">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre del proyecto" className="border p-2 flex-1"/>
        <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded">Crear</button>
      </div>
      <ul className="space-y-2">
        {projects.map(p=><li key={p.id} className="border p-3 rounded">{p.name} · {p.status}</li>)}
      </ul>
    </div>
  );
}
