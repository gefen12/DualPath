import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { deadlineCalendar } from '@/lib/calendar';

export const getStaticPaths = (async () =>
  (await getCollection('deadlines')).map((d) => ({ params: { id: d.id }, props: { deadline: { ...d.data, id: d.id } } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(deadlineCalendar([props.deadline], 'he'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
