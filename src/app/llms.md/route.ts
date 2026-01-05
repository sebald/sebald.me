import { getAllLLMText } from '@/lib/source';

export const revalidate = false;

export const GET = async () => {
  const text = await getAllLLMText();
  return new Response(text);
};
