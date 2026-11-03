export function resolveOfficeScope(
  userOfficeIds: number[] | null,
  queryOfficeId?: string,
): number[] | undefined {
  const parsedOfficeId = queryOfficeId ? Number(queryOfficeId) : undefined
  const officeId = Number.isInteger(parsedOfficeId) && (parsedOfficeId as number) > 0
    ? parsedOfficeId
    : undefined

  if (userOfficeIds === null) return officeId ? [officeId] : undefined
  if (queryOfficeId) return officeId && userOfficeIds.includes(officeId) ? [officeId] : []
  return userOfficeIds
}
