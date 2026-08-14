import { useState, useEffect } from 'react';
import API from '../services/api.js';

export default function SimpleCrud({ endpoint, title, columns, fields, searchFields }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const fetch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    try {
      const { data } = await API.get(`${endpoint}?${params}`);
      setItems(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const initForm = () => {
    const obj = {};
    fields.forEach((f) => { obj[f.name] = f.default ?? ''; });
    return obj;
  };

  const handleSave = async () => {
    if (modal === 'add') await API.post(endpoint, form);
    else await API.put(`${endpoint}/${modal}`, form);
    setModal(null);
    fetch();
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete this ${title.toLowerCase()}?`)) return;
    await API.delete(`${endpoint}/${id}`);
    fetch();
  };

  const openEdit = (item) => {
    const obj = {};
    fields.forEach((f) => { obj[f.name] = item[f.name] ?? ''; });
    setForm(obj);
    setModal(item._id);
  };

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <h3>{title}</h3>
          <button className="btn btn-primary" onClick={() => { setForm(initForm()); setModal('add'); }}>
            <i className="fa-solid fa-plus"></i> Add
          </button>
        </div>
        <div className="panel-body">
          <div className="search-box" style={{ marginBottom: '20px' }}>
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetch()} />
          </div>
          {loading ? <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
            <table className="data-table">
              <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}
              <th>Actions</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    {columns.map((c) => <td key={c.key}>{c.render ? c.render(item) : item[c.key]}</td>)}
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(item)}><i className="fa-solid fa-pen"></i></button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', color: '#64748b' }}>No records found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay show" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? `Add ${title}` : `Edit ${title}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              {fields.map((f) => (
                <div className="form-group" key={f.name}>
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea rows={3} value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  ) : (
                    <input type={f.type || 'text'} value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })} />
                  )}
                </div>
              ))}
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
