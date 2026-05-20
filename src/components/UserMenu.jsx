import { useState, useEffect, useRef } from 'react';
import { fetchUserAttributes, updateUserAttribute, updatePassword } from 'aws-amplify/auth';

export default function UserMenu({ signOut }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(false);
  const [name, setName] = useState('');
  const [editName, setEditName] = useState('');
  const [email, setEmail] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const ref = useRef();

  useEffect(() => {
    fetchUserAttributes().then(attrs => {
      setName(attrs.name || '');
      setEditName(attrs.name || '');
      setEmail(attrs.email || '');
    });
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSaveName() {
    try {
      await updateUserAttribute({ userAttribute: { attributeKey: 'name', value: editName } });
      setName(editName);
      setNameMsg('保存しました');
    } catch {
      setNameMsg('保存に失敗しました');
    }
  }

  async function handleChangePw() {
    setPwMsg('');
    if (newPw !== confirmPw) { setPwMsg('新しいパスワードが一致しません'); return; }
    try {
      await updatePassword({ oldPassword: currentPw, newPassword: newPw });
      setPwMsg('パスワードを変更しました');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) {
      setPwMsg(e.message || 'エラーが発生しました');
    }
  }

  const initial = name ? name[0].toUpperCase() : '?';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 32, height: 32, borderRadius: '50%', background: '#4CAF50',
        border: 'none', cursor: 'pointer', color: 'white', fontWeight: 'bold', fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 40, background: 'white',
          borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 100, minWidth: 140, overflow: 'hidden',
        }}>
          <button onClick={() => { setOpen(false); setPage(true); }} style={menuItemStyle}>
            マイページ
          </button>
          <div style={{ height: 1, background: '#f0f0f0' }} />
          <button onClick={signOut} style={{ ...menuItemStyle, color: '#c62828' }}>
            ログアウト
          </button>
        </div>
      )}

      {page && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setPage(false)}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 380,
            maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, margin: 0, color: '#333' }}>マイページ</h2>
              <button onClick={() => setPage(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>✕</button>
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>名前</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={editName} onChange={e => { setEditName(e.target.value); setNameMsg(''); }}
                  style={inputStyle} placeholder="名前を入力" />
                <button onClick={handleSaveName} style={btnStyle}>保存</button>
              </div>
              {nameMsg && <div style={{ fontSize: 12, color: '#4CAF50', marginTop: 4 }}>{nameMsg}</div>}
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>メールアドレス（ID）</label>
              <div style={{ fontSize: 14, color: '#555', padding: '8px 0' }}>{email}</div>
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>パスワード変更</label>
              <input value={currentPw} onChange={e => { setCurrentPw(e.target.value); setPwMsg(''); }}
                type="password" style={{ ...inputStyle, marginBottom: 8 }} placeholder="現在のパスワード" />
              <input value={newPw} onChange={e => { setNewPw(e.target.value); setPwMsg(''); }}
                type="password" style={{ ...inputStyle, marginBottom: 8 }} placeholder="新しいパスワード" />
              <input value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPwMsg(''); }}
                type="password" style={{ ...inputStyle, marginBottom: 8 }} placeholder="新しいパスワード（確認）" />
              <button onClick={handleChangePw} style={btnStyle}>変更する</button>
              {pwMsg && (
                <div style={{ fontSize: 12, marginTop: 4, color: pwMsg === 'パスワードを変更しました' ? '#4CAF50' : '#c62828' }}>
                  {pwMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  width: '100%', padding: '12px 16px', background: 'none', border: 'none',
  textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#333',
};
const sectionStyle = { marginBottom: 24 };
const labelStyle = { fontSize: 12, color: '#999', display: 'block', marginBottom: 6 };
const inputStyle = {
  width: '100%', border: '1px solid #e0e0e0', borderRadius: 8,
  padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', display: 'block',
};
const btnStyle = {
  padding: '10px 16px', background: '#4CAF50', color: 'white',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap',
};
