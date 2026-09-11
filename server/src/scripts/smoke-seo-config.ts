export const pagesToCheck = [
  { path: '/', canonicalPath: '/' },
  { path: '/?category=Камеры', canonicalPath: '/arenda-gopro-moskva' },
  { path: '/?category=Пылесосы%2C%20уборка%20и%20клининг', canonicalPath: '/arenda-pylesosov-moskva' },
  { path: '/?category=Аудиооборудование', canonicalPath: '/arenda-audiooborudovaniya-moskva' },
  { path: '/arenda-pylesosov-moskva', canonicalPath: '/arenda-pylesosov-moskva' },
  { path: '/arenda-gopro-moskva', canonicalPath: '/arenda-gopro-moskva' },
  { path: '/arenda-audiooborudovaniya-moskva', canonicalPath: '/arenda-audiooborudovaniya-moskva' },
  { path: '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva', canonicalPath: '/arenda-stroitelnogo-pylesosa-posle-remonta-moskva' },
  { path: '/arenda-kolonki-dlya-vecherinki-moskva', canonicalPath: '/arenda-kolonki-dlya-vecherinki-moskva' },
  { path: '/arenda-kamery-dlya-puteshestviya-vloga-moskva', canonicalPath: '/arenda-kamery-dlya-puteshestviya-vloga-moskva' },
  { path: '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva', canonicalPath: '/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva' },
  { path: '/kak-prohodit-arenda-tehniki', canonicalPath: '/kak-prohodit-arenda-tehniki' },
  { path: '/samovyvoz-24-7-postamat', canonicalPath: '/samovyvoz-24-7-postamat' },
  { path: '/arenda-tehniki-dlya-meropriyatiya-moskva', canonicalPath: '/arenda-tehniki-dlya-meropriyatiya-moskva' },
  { path: '/about', canonicalPath: '/about' },
  { path: '/rental-agreement', canonicalPath: '/rental-agreement' },
]

export const requiredCanonicalPaths = [
  ...new Set(pagesToCheck.map((page) => page.canonicalPath).filter((pagePath) => pagePath !== '/')),
]
