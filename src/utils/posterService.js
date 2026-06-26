import { toPng } from 'html-to-image'

const POSTER_ERROR_MESSAGE = '海报生成失败，请稍后重试'

export async function generatePosterPng(element) {
  if (!element) {
    throw new Error('报告数据不存在，无法生成海报')
  }

  try {
    const width = Math.ceil(element.scrollWidth || element.offsetWidth || 1080)
    const height = Math.ceil(element.scrollHeight || element.offsetHeight || 2200)

    return await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#09070f',
      width,
      height,
      style: {
        width: `${width}px`,
        minHeight: `${height}px`,
        height: 'auto',
        transform: 'none',
      },
    })
  } catch (error) {
    console.warn('[POSTER_GENERATE_FAILED]', error)
    throw new Error(POSTER_ERROR_MESSAGE)
  }
}

export async function downloadPoster(element, filename) {
  const dataUrl = await generatePosterPng(element)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename || 'lingxige-report.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return dataUrl
}

export async function copyReportLink(url) {
  const link = url || window.location.href

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(link)
    return link
  }

  const input = document.createElement('textarea')
  input.value = link
  input.setAttribute('readonly', 'readonly')
  input.style.position = 'fixed'
  input.style.left = '-9999px'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(input)

  if (!copied) {
    throw new Error('复制失败，请手动复制浏览器地址')
  }

  return link
}
