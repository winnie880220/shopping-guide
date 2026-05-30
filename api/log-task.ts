import { Client } from '@notionhq/client';

type ApiRequest = {
  method?: string;
  body?: {
    userId?: string;
    date?: string;
    task1_sec?: number | null;
    task2_sec?: number | null;
    task3_sec?: number | null;
    task4_sec?: number | null;
    task5_sec?: number | null;
  };
};

type ApiResponse = {
  status: (code: number) => { json: (body: unknown) => void };
};

function cleanEnv(value?: string): string {
  if (!value) return '';
  return value.trim().replace(/^["']|["']$/g, '');
}

function notionErrorMessage(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body?: { message?: string } }).body;
    return body?.message;
  }
  if (error instanceof Error) return error.message;
  return undefined;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const notionKey = cleanEnv(process.env.NOTION_API_KEY);
  const databaseId = cleanEnv(process.env.NOTION_DATABASE_ID);

  if (!notionKey || !databaseId) {
    return res.status(500).json({ error: 'Notion is not configured' });
  }

  const { userId, date, task1_sec, task2_sec, task3_sec, task4_sec, task5_sec } = req.body ?? {};

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const notion = new Client({ auth: notionKey });
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        UserID: { title: [{ text: { content: String(userId) } }] },
        Date: { date: { start: date || new Date().toISOString().split('T')[0] } },
        task1_sec: { number: task1_sec ?? null },
        task2_sec: { number: task2_sec ?? null },
        task3_sec: { number: task3_sec ?? null },
        task4_sec: { number: task4_sec ?? null },
        task5_sec: { number: task5_sec ?? null },
      },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notion Error:', error);
    return res.status(500).json({
      error: 'Failed to log task to Notion',
      detail: notionErrorMessage(error),
    });
  }
}
