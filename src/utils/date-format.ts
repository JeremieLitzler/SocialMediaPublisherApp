import { useDateFormat } from '@vueuse/core'

export const formatDateStr = (
  dtStr?: string | null | undefined,
  format?: string,
  defaultText: string = 'No date set',
) => {
  if (!dtStr) {
    return ref(defaultText)
  }
  return useDateFormat(dtStr, format, { locales: 'fr-FR' })
}

export const formatDateToStr = (datetime: Date, format: string) => {
  return useDateFormat(datetime, format)
}

export const formatDateStrToUserFriendly = (dtStr: string | null | undefined) =>
  formatDateStr(dtStr, 'ddd D MMM YYYY')

export const dateToSupabaseDateString = (datetime: Date) => {
  const format: string = 'YYYY-MM-DDTHH:mm:ss.SSS+ZZ:ZZ'
  const formattedDateString = formatDateToStr(datetime, format)
  return formattedDateString
}

export const toISOStringWithTimezone = (date: Date) => {
  const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0')
  const tzOffset = -date.getTimezoneOffset()
  const diff = tzOffset >= 0 ? '+' : '-'
  const timezone = diff + pad(tzOffset / 60) + ':' + pad(tzOffset % 60)

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    '.' +
    pad(date.getMilliseconds()) +
    timezone
  )
}
