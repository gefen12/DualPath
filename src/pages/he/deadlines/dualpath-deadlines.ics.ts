import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { deadlineCalendar } from '@/lib/calendar';
import { byCalendar } from '@/lib/deadlines';

export const GET: APIRoute = async () => {
  const deadlines = byCalendar((await getCollection('deadlines')).map((d) => ({ ...d.data, id: d.id })));
  return new Response(deadlineCalendar(deadlines, 'he'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
