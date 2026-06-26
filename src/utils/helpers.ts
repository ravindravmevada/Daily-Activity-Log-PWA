export const DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
export const MON = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const pad = (n: number) => String(n).padStart(2,'0')

export function todayKey() { return dkey(new Date()) }
export function dkey(d: Date) { return pad(d.getDate()) + '-' + pad(d.getMonth()+1) + '-' + d.getFullYear() }
export function keyToDate(k: string) {
  const [dd,mm,yyyy] = k.split('-').map(Number)
  return new Date(yyyy, mm-1, dd)
}
export function fmtTS(ms: number) {
  const d = new Date(ms)
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h === 0) h = 12
  return DOW[d.getDay()] + ', ' + pad(d.getDate()) + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear()
    + ' - ' + pad(h) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' ' + ap
}
export function fmtClock(ms: number) {
  const s = Math.floor(Math.abs(ms)/1000)
  return pad(Math.floor(s/3600)) + ':' + pad(Math.floor((s%3600)/60)) + ':' + pad(s%60)
}
export function fmtDur(ms: number) {
  if (ms < 0) ms = 0
  const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  if (h > 0) return h + 'h ' + m + 'm'
  if (m > 0) return m + 'm ' + sec + 's'
  return sec + 's'
}
export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }
