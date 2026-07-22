export function getVisiblePageNumbers(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (value) =>
      value === 1 || value === totalPages || Math.abs(value - page) <= 1,
  )

  return pages.reduce<(number | "ellipsis")[]>((acc, value, index) => {
    if (index > 0 && value - (pages[index - 1] ?? 0) > 1) {
      acc.push("ellipsis")
    }
    acc.push(value)
    return acc
  }, [])
}
