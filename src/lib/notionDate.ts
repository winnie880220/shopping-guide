const NOTION_TIME_ZONE = 'Asia/Taipei';

/** Notion Date 屬性（含時間）用的 start + time_zone */
export function buildNotionDateProperty(input?: string | Date) {
  const date = input ? new Date(input) : new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: NOTION_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map(part => [part.type, part.value])
  );

  const start = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;

  return {
    start,
    time_zone: NOTION_TIME_ZONE,
  };
}
