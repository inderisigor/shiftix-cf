import React from 'react'
export default function StatusBadge({ status }) {
 const colors = {
   Sent:      { bg: '#dbeafe', color: '#1e40af' },
   Won:       { bg: '#dcfce7', color: '#166534' },
   Lost:      { bg: '#fee2e2', color: '#991b1b' },
   Warm:      { bg: '#fef3c7', color: '#92400e' },
   'On Hold': { bg: '#d1fae5', color: '#065f46' },
 }
 const c = colors[status] || colors.Sent
 return (
<span style={{
     display: 'inline-block', padding: '2px 8px', borderRadius: 12,
     fontSize: 11, fontWeight: 500, background: c.bg, color: c.color
   }}>
     {status || 'Sent'}
</span>
 )
}
