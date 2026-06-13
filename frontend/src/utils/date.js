import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate  = (d) => format(parseISO(d), 'dd/MM/yyyy', { locale: es })
export const formatDatetime = (d) => format(parseISO(d), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
export const fromNow     = (d) => formatDistanceToNow(parseISO(d), { locale: es, addSuffix: true })
