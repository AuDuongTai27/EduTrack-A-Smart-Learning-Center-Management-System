import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { notificationInboxApi, type NotificationRecipientOption } from '../../../../api/notificationInboxApi';
import { notificationRoleLabel } from '../../../../BLL/services/notificationPresentation';

export default function RecipientCombobox({ value, onChange, disabled }: {
  value: NotificationRecipientOption | null; onChange: (value: NotificationRecipientOption | null) => void; disabled: boolean;
}) {
  const id = useId(); const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(''); const [rows, setRows] = useState<NotificationRecipientOption[]>([]);
  const [open, setOpen] = useState(false); const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
  const term = query.trim();
  useEffect(() => {
    const term = query.trim();
    if (value || term.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void notificationInboxApi.recipients(term, controller.signal).then(result => {
        if (!controller.signal.aborted) setRows(result);
      }).catch(() => { if (!controller.signal.aborted) setError('Không tải được người nhận. Vui lòng thử lại.'); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, value, retry]);
  useEffect(() => { if (active >= 0) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' }); }, [active, id]);
  function resetResults() { setRows([]); setLoading(false); setError(''); setActive(-1); }
  function pick(row: NotificationRecipientOption) { onChange(row); setQuery(''); setOpen(false); resetResults(); }
  function keyboard(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); setOpen(true);
      if (rows.length) setActive(index => event.key === 'ArrowDown' ? (index + 1) % rows.length : (index <= 0 ? rows.length - 1 : index - 1));
    }
    if (event.key === 'Enter') { event.preventDefault(); if (open && active >= 0 && rows[active]) pick(rows[active]); }
  }
  return <div className="ntf-recipient" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>Người nhận <span className="ntf-required" aria-hidden="true">*</span></label>
    <input ref={input} id={id} className="form-control" role="combobox" autoComplete="off" aria-autocomplete="list"
      aria-expanded={open && !value} aria-controls={`${id}-results`} aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
      aria-required="true" aria-describedby={`${id}-help`} disabled={disabled} readOnly={!!value} maxLength={100}
      placeholder="Tìm theo họ tên hoặc mã tài khoản..." value={value ? `${value.fullName} (${value.userCode})` : query}
      onFocus={() => { if (!value) setOpen(true); }} onKeyDown={keyboard}
      onChange={e => { setQuery(e.target.value); setRows([]); setActive(-1); setOpen(true); setError(''); setLoading(e.target.value.trim().length >= 2); }} />
    <small id={`${id}-help`} className="text-muted">{value ? value.roles.map(notificationRoleLabel).join(', ') : 'Nhập ít nhất 2 ký tự. Tối đa 20 kết quả; chọn một người nhận.'}</small>
    {value && <button type="button" className="btn btn-sm btn-outline-secondary ntf-clear-recipient" disabled={disabled}
      onClick={() => { onChange(null); setQuery(''); setOpen(true); resetResults(); input.current?.focus(); }}>Thay đổi / Xóa người nhận</button>}
    <div id={`${id}-results`} role="listbox" aria-label="Kết quả tìm người nhận" hidden={!open || !!value} aria-busy={loading}>
      {rows.map((row, index) => <div key={row.userId} id={`${id}-${index}`} role="option" aria-selected={index === active}
        className="ntf-recipient-option" onPointerDown={e => e.preventDefault()} onClick={() => pick(row)}>
        <strong>{row.fullName}</strong><small>{row.userCode} · {row.roles.map(notificationRoleLabel).join(', ')}</small>
      </div>)}
    </div>
    {open && !value && <div className="ntf-search-status" role={error ? 'alert' : 'status'}>
      {loading ? 'Đang tìm người nhận...' : error || (term.length < 2 ? 'Nhập tên hoặc mã để tìm kiếm.' : !rows.length ? 'Không tìm thấy người nhận đang hoạt động.' : `${rows.length} kết quả. Dùng phím mũi tên và Enter để chọn.`)}
      {error && <button type="button" className="btn btn-link btn-sm" onClick={() => { resetResults(); setLoading(true); setRetry(n => n + 1); }}>Thử lại</button>}
    </div>}
  </div>;
}
