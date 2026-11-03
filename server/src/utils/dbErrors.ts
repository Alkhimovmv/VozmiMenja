// SQLite возвращает нарушение внешнего ключа как SQLITE_CONSTRAINT с текстом FOREIGN KEY.
export function isForeignKeyError(error: unknown): boolean {
  const err = error as { code?: string; message?: string } | null
  return err?.code === 'SQLITE_CONSTRAINT' && /FOREIGN KEY/i.test(err.message || '')
}
